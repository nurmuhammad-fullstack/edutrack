import { NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/prisma";
import { fmtMoney } from "@/lib/utils";
import { planLimits, studentLimitMessage, PLAN_LABEL } from "@/lib/plan";
import { applyLink } from "@/lib/apply";
import { botMsg, botLang, type Locale } from "@/lib/i18n";

// Resolve the saved language for a chat (default uz). null record = not chosen yet.
async function getChatLang(chatId: number): Promise<Locale> {
  const u = await prisma.botUser.findUnique({ where: { chatId: String(chatId) }, select: { lang: true } });
  return botLang(u?.lang);
}

function langKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🇺🇿 O'zbekcha", callback_data: "lang:uz" },
        { text: "🇷🇺 Русский", callback_data: "lang:ru" },
      ],
    ],
  };
}

// The trainer onboarding message + buttons, in the given language.
async function sendOnboarding(chatId: number, lang: Locale) {
  const m = botMsg[lang];
  await bot.sendMessage(chatId, m.onboarding, {
    reply_markup: {
      inline_keyboard: [
        [{ text: m.btnApply, url: applyLink() }],
        [{ text: m.btnCabinet, url: `${APP_URL}/login` }],
        [{ text: m.btnFeedback, callback_data: "feedback" }],
      ],
    },
  });
}

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: false });

// Base app URL (dashboard lives here). Derived from MINI_APP_URL so there's
// only one URL to configure.
const APP_URL =
  (process.env.MINI_APP_URL ?? "").replace(/\/mini-app\/?$/, "") ||
  "https://edutrack-saas.vercel.app";

// Marker so we can recognise the "add student name" reply prompt.
const ADD_PROMPT =
  "➕ Yangi o'quvchining ism familiyasini shu xabarga javob tariqasida yozing:";

function describeSender(from?: {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}): string {
  if (!from) return "noma'lum";
  const name = `${from.first_name ?? ""} ${from.last_name ?? ""}`.trim();
  const handle = from.username ? ` @${from.username}` : "";
  return `${name}${handle} [${from.id}]`.trim();
}

// ── Multi-step "add student" conversation helpers ──
// Step 2: ask which group (inline buttons carry the draft student id).
async function askGroup(chatId: number, studentId: number, trainerId: string) {
  const groups = await prisma.group.findMany({ where: { trainerId }, orderBy: { id: "asc" } });
  if (groups.length === 0) {
    await askPayDay(chatId, studentId);
    return;
  }
  const rows = groups.map((g) => [
    { text: `${g.name.split("·")[0].trim()} · ${fmtMoney(g.monthlyFee)}`, callback_data: `addg:${studentId}:${g.id}` },
  ]);
  rows.push([{ text: "Guruhsiz", callback_data: `addg:${studentId}:0` }]);
  await bot.sendMessage(chatId, "👥 Guruhni tanlang:", { reply_markup: { inline_keyboard: rows } });
}

// Step 3: ask the payment day. The draft student id is embedded in the prompt
// text ([#id]) so we can recover it from the reply without a state store.
async function askPayDay(chatId: number, studentId: number) {
  await bot.sendMessage(
    chatId,
    `💳 To'lov kunini yozing (1-31).\nKerak bo'lmasa 0 deb yozing.\n[#${studentId}]`,
    { reply_markup: { force_reply: true } }
  );
}

export async function POST(req: Request) {
  // Verify the request really comes from Telegram. Telegram echoes the
  // secret_token set via setWebhook in this header on every update.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = await req.json();

    // ── 1. Inline button presses ───────────────────────────────────────────
    if (update.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message?.chat?.id;
      await bot.answerCallbackQuery(cq.id).catch(() => {});

      // Language chosen
      if (cq.data?.startsWith("lang:") && chatId) {
        const lang: Locale = cq.data === "lang:ru" ? "ru" : "uz";
        await prisma.botUser.upsert({
          where: { chatId: String(chatId) },
          update: { lang },
          create: { chatId: String(chatId), lang },
        });
        await sendOnboarding(chatId, lang);
        return NextResponse.json({ ok: true });
      }

      if (cq.data === "feedback" && chatId) {
        const lang = await getChatLang(chatId);
        await bot.sendMessage(chatId, botMsg[lang].feedbackPrompt, {
          reply_markup: { force_reply: true },
        });
      }

      // Add-student step 2: a group was picked.
      if (cq.data?.startsWith("addg:") && chatId) {
        const [, sidStr, gidStr] = cq.data.split(":");
        const sid = Number(sidStr);
        const gid = Number(gidStr);
        const trainer = await prisma.trainer.findUnique({
          where: { telegramId: String(chatId) },
          select: { id: true },
        });
        if (trainer) {
          const student = await prisma.student.findFirst({
            where: { id: sid, trainerId: trainer.id },
            select: { id: true },
          });
          if (student) {
            if (gid > 0) {
              const group = await prisma.group.findFirst({
                where: { id: gid, trainerId: trainer.id },
                select: { id: true },
              });
              if (group) await prisma.student.update({ where: { id: sid }, data: { groupId: gid } });
            }
            // Remove the buttons so the group can't be picked twice.
            if (cq.message?.message_id) {
              await bot
                .editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: cq.message.message_id })
                .catch(() => {});
            }
            await askPayDay(chatId, sid);
          }
        }
      }
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text: string = message.text ?? "";

    // ── 2. Feedback submission ──────────────────────────────────────────────
    // Either a reply to our feedback prompt (starts with 📝), or /feedback.
    const isReplyToPrompt = message.reply_to_message?.text?.startsWith("📝");
    const isFeedbackCmd = text.startsWith("/feedback");

    if (isReplyToPrompt || isFeedbackCmd) {
      const lang = await getChatLang(chatId);
      const body = isFeedbackCmd ? text.replace(/^\/feedback/, "").trim() : text.trim();

      if (!body) {
        await bot.sendMessage(chatId, botMsg[lang].feedbackPrompt, {
          reply_markup: { force_reply: true },
        });
        return NextResponse.json({ ok: true });
      }

      // Persist so it shows up in the admin dashboard.
      const from = message.from;
      await prisma.feedback
        .create({
          data: {
            telegramId: from?.id ? String(from.id) : null,
            name: `${from?.first_name ?? ""} ${from?.last_name ?? ""}`.trim() || null,
            username: from?.username ?? null,
            message: body,
          },
        })
        .catch(() => {});

      // Also forward to the founder's Telegram if configured.
      const adminChatId = process.env.ADMIN_CHAT_ID;
      if (adminChatId) {
        await bot
          .sendMessage(
            adminChatId,
            `💬 Yangi fikr:\n\n${body}\n\n— ${describeSender(message.from)}`
          )
          .catch(() => {});
      }

      await bot.sendMessage(chatId, botMsg[lang].feedbackThanks);
      return NextResponse.json({ ok: true });
    }

    // ── 2b. Add student — step 1: name (creates draft, then asks group) ──────
    const isNameReply = message.reply_to_message?.text?.startsWith("➕");
    const isAddCmd = text.startsWith("/add");

    if (isNameReply || isAddCmd) {
      const trainer = await prisma.trainer.findUnique({
        where: { telegramId: String(chatId) },
        select: { id: true, plan: true },
      });

      if (!trainer) {
        await bot.sendMessage(
          chatId,
          "Bu buyruq faqat o'qituvchilar uchun.\nKabinetingizdagi Sozlamalar → \"Bot orqali qo'shish\" bo'limidan Telegram'ni ulang.",
          { reply_markup: { inline_keyboard: [[{ text: "🎓 Kabinetga kirish", url: `${APP_URL}/login` }]] } }
        );
        return NextResponse.json({ ok: true });
      }

      const limits = planLimits(trainer.plan);

      // Bot-add is a paid (BASIC/PRO) feature.
      if (!limits.botAdd) {
        await bot.sendMessage(
          chatId,
          `Bot orqali qo'shish ${PLAN_LABEL.BASIC}/${PLAN_LABEL.PRO} tarifda mavjud.\nHozircha o'quvchini kabinetdan qo'shing.`,
          { reply_markup: { inline_keyboard: [[{ text: "🎓 Kabinet", url: `${APP_URL}/login` }]] } }
        );
        return NextResponse.json({ ok: true });
      }

      // Active-student limit.
      const activeCount = await prisma.student.count({
        where: { trainerId: trainer.id, status: "ACTIVE" },
      });
      if (activeCount >= limits.maxStudents) {
        await bot.sendMessage(chatId, "⚠️ " + studentLimitMessage(trainer.plan));
        return NextResponse.json({ ok: true });
      }

      const name = (isAddCmd ? text.replace(/^\/add/, "") : text).trim();
      if (name.length < 2) {
        await bot.sendMessage(chatId, ADD_PROMPT, { reply_markup: { force_reply: true } });
        return NextResponse.json({ ok: true });
      }
      if (name.length > 100) {
        await bot.sendMessage(chatId, "Ism juda uzun. Qaytadan: /add");
        return NextResponse.json({ ok: true });
      }

      const student = await prisma.student.create({
        data: { trainerId: trainer.id, fullName: name, phone: "—", status: "ACTIVE" },
      });
      await askGroup(chatId, student.id, trainer.id);
      return NextResponse.json({ ok: true });
    }

    // ── 2c. Add student — step 3: payment day (finishes) ─────────────────────
    if (message.reply_to_message?.text?.startsWith("💳")) {
      const m = message.reply_to_message.text.match(/\[#(\d+)\]/);
      const sid = m ? Number(m[1]) : null;
      const trainer = await prisma.trainer.findUnique({
        where: { telegramId: String(chatId) },
        select: { id: true },
      });

      if (sid && trainer) {
        const student = await prisma.student.findFirst({
          where: { id: sid, trainerId: trainer.id },
          include: { group: true },
        });
        if (student) {
          const raw = text.trim();
          let day: number | null = null;
          if (raw !== "0") {
            const n = Number(raw);
            if (!Number.isInteger(n) || n < 1 || n > 31) {
              await bot.sendMessage(chatId, `💳 Faqat 1-31 yoki 0 yozing.\n[#${sid}]`, {
                reply_markup: { force_reply: true },
              });
              return NextResponse.json({ ok: true });
            }
            day = n;
          }
          await prisma.student.update({ where: { id: sid }, data: { paymentDay: day } });
          const groupName = student.group?.name?.split("·")[0].trim() ?? "Guruhsiz";
          await bot.sendMessage(
            chatId,
            `✅ Qo'shildi!\n\n👤 ${student.fullName}\n👥 ${groupName}\n📅 To'lov kuni: ${day ? `${day}-kun` : "belgilanmagan"}\n\nYana qo'shish uchun /add yuboring.`
          );
          return NextResponse.json({ ok: true });
        }
      }
      return NextResponse.json({ ok: true });
    }

    // ── 3. /id helper (used to discover the admin chat id) ───────────────────
    if (text.startsWith("/id")) {
      await bot.sendMessage(chatId, `Sizning Telegram ID: ${chatId}`);
      return NextResponse.json({ ok: true });
    }

    // ── 3b. /lang — change language ──────────────────────────────────────────
    if (text.startsWith("/lang")) {
      await bot.sendMessage(chatId, botMsg.uz.chooseLang, { reply_markup: langKeyboard() });
      return NextResponse.json({ ok: true });
    }

    // ── 4. /start ────────────────────────────────────────────────────────────
    if (text.startsWith("/start")) {
      const payload = text.split(" ")[1]; // trainer id for student registration

      // Trainer linking their Telegram to their account.
      if (payload && payload.startsWith("trainer_")) {
        const tid = payload.slice("trainer_".length);
        const trainer = await prisma.trainer.findUnique({ where: { id: tid }, select: { id: true, name: true } });
        if (!trainer) {
          await bot.sendMessage(chatId, "Havola noto'g'ri yoki eskirgan.");
          return NextResponse.json({ ok: true });
        }
        // Free this chat from any previous trainer, then link.
        await prisma.trainer.updateMany({
          where: { telegramId: String(chatId), id: { not: tid } },
          data: { telegramId: null },
        });
        await prisma.trainer.update({ where: { id: tid }, data: { telegramId: String(chatId) } });
        await bot.sendMessage(
          chatId,
          `✅ Telegram ulandi${trainer.name ? `, ${trainer.name}` : ""}!\n\nEndi shu yerdan o'quvchi qo'shishingiz mumkin — /add buyrug'ini yuboring.`
        );
        return NextResponse.json({ ok: true });
      }

      if (payload) {
        // Student arrived via a trainer's personal invite link.
        const lang = await getChatLang(chatId);
        const m = botMsg[lang];
        const miniAppUrl = `${process.env.MINI_APP_URL}?trainer=${payload}`;
        await bot.sendMessage(chatId, m.studentWelcome, {
          reply_markup: {
            inline_keyboard: [[{ text: m.btnRegister, web_app: { url: miniAppUrl } }]],
          },
        });
      } else {
        // No payload → new visitor. Ask language first (once), then onboard.
        const existing = await prisma.botUser.findUnique({
          where: { chatId: String(chatId) },
          select: { lang: true },
        });
        if (!existing) {
          await bot.sendMessage(chatId, botMsg.uz.chooseLang, { reply_markup: langKeyboard() });
        } else {
          await sendOnboarding(chatId, botLang(existing.lang));
        }
      }
      return NextResponse.json({ ok: true });
    }

    // ── 5. Anything else: offer the feedback entry point ─────────────────────
    {
      const lang = await getChatLang(chatId);
      await bot.sendMessage(
        chatId,
        lang === "ru" ? "Оставьте отзыв кнопкой ниже 👇" : "Quyidagi tugma orqali fikr qoldiring 👇",
        { reply_markup: { inline_keyboard: [[{ text: botMsg[lang].btnFeedback, callback_data: "feedback" }]] } }
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
