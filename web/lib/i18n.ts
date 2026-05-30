import { cookies } from "next/headers";

export type Locale = "uz" | "ru";
export const LOCALES: Locale[] = ["uz", "ru"];
export const DEFAULT_LOCALE: Locale = "uz";
export const LOCALE_COOKIE = "lang";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "ru" ? "ru" : "uz";
}

// ── Landing page dictionary ──────────────────────────────────────────────────
export const landing = {
  uz: {
    navLogin: "Kirish",
    navApply: "Ariza topshirish",
    heroBadge: "🏆 Sport trenerlar uchun #1 yordamchi",
    heroTitle1: "Excel va daftar o'rniga —",
    heroTitle2: "aqlli boshqaruv",
    heroSub:
      "O'quvchilar, to'lovlar va davomat — barchasi Telegram orqali bir joyda. Hech narsani unutmaysiz, hech qaysi to'lovni yo'qotmaysiz.",
    ctaFree: "🎁 Bepul akkaunt oching",
    ctaLogin: "Tizimga kirish",
    trust: "🎁 Akkaunt mutlaqo bepul — trenerligingiz tasdiqlangach, biz ochib beramiz",
    features: [
      { icon: "📱", title: "Telegram orqali", desc: "O'quvchilar bot orqali ro'yxatdan o'tadi. Hech qanday ilova kerak emas." },
      { icon: "✅", title: "Bir tugma bilan", desc: "Yangi ariza kelsa — tasdiqlash yoki rad etish faqat bir bosuv." },
      { icon: "💰", title: "To'lov nazorati", desc: "Kim to'lagan, kim to'lamagan — bir qarashda. Avto eslatma bilan." },
      { icon: "📋", title: "Davomat", desc: "Har kuni o'quvchilar davomatini belgilang va statistikasini ko'ring." },
    ],
    howTitle: "Qanday boshlanadi?",
    steps: [
      { n: "1", title: "Ariza topshiring", desc: "Telegram orqali ma'lumotlaringizni yuboring." },
      { n: "2", title: "Tasdiqlash", desc: "Admin tekshirib, akkauntingizni ochib beradi." },
      { n: "3", title: "Boshqaring", desc: "Havolangizni o'quvchilarga ulashing, to'lov va davomatni yuriting." },
    ],
    pricingTitle: "Tariflar",
    pricingSub: "Bepul boshlang — o'quvchilaringiz ko'paysa, oshiring. Yillik to'lovda 2 oy bepul.",
    popular: "OMMABOP",
    free: "Bepul",
    perMonth: "/oy",
    perYearPrefix: "yoki",
    perYear: "/yil",
    choose: "Tanlash",
    fullCompare: "To'liq solishtiruv",
    plans: [
      { name: "Bepul", students: "10 o'quvchi", groups: "3 guruh" },
      { name: "Asosiy", students: "60 o'quvchi", groups: "10 guruh" },
      { name: "Pro", students: "Cheksiz o'quvchi", groups: "Cheksiz guruh" },
    ],
    feat: {
      payment: "To'lov nazorati",
      invite: "Havola / ariza",
      manual: "Qo'lda qo'shish",
      bot: "Bot orqali qo'shish",
      reminder: "Avto to'lov eslatma",
      attendance: "Davomat",
      reports: "Hisobotlar",
    },
    finalTitle: "Bugun boshlang",
    finalSub: "Ariza qoldiring — admin tezda bog'lanib, akkauntingizni ochib beradi.",
    finalCta: "Telegram orqali ariza topshirish",
    footer: "© 2026 EduTrack · Sport trenerlar uchun",
  },
  ru: {
    navLogin: "Войти",
    navApply: "Оставить заявку",
    heroBadge: "🏆 #1 помощник для спорт-тренеров",
    heroTitle1: "Вместо Excel и тетради —",
    heroTitle2: "умное управление",
    heroSub:
      "Ученики, оплаты и посещаемость — всё в одном месте через Telegram. Ничего не забудете, ни одной оплаты не потеряете.",
    ctaFree: "🎁 Открыть бесплатный аккаунт",
    ctaLogin: "Войти в систему",
    trust: "🎁 Аккаунт абсолютно бесплатный — откроем после подтверждения, что вы тренер",
    features: [
      { icon: "📱", title: "Через Telegram", desc: "Ученики регистрируются через бота. Никаких приложений." },
      { icon: "✅", title: "В один клик", desc: "Новая заявка — подтверждение или отклонение в одно касание." },
      { icon: "💰", title: "Контроль оплат", desc: "Кто заплатил, кто нет — с одного взгляда. С авто-напоминаниями." },
      { icon: "📋", title: "Посещаемость", desc: "Отмечайте посещаемость учеников и смотрите статистику." },
    ],
    howTitle: "Как начать?",
    steps: [
      { n: "1", title: "Оставьте заявку", desc: "Отправьте свои данные через Telegram." },
      { n: "2", title: "Подтверждение", desc: "Админ проверит и откроет вам аккаунт." },
      { n: "3", title: "Управляйте", desc: "Поделитесь ссылкой с учениками, ведите оплаты и посещаемость." },
    ],
    pricingTitle: "Тарифы",
    pricingSub: "Начните бесплатно — растёт число учеников, повышайте тариф. При годовой оплате 2 месяца бесплатно.",
    popular: "ПОПУЛЯРНЫЙ",
    free: "Бесплатно",
    perMonth: "/мес",
    perYearPrefix: "или",
    perYear: "/год",
    choose: "Выбрать",
    fullCompare: "Полное сравнение",
    plans: [
      { name: "Бесплатный", students: "10 учеников", groups: "3 группы" },
      { name: "Базовый", students: "60 учеников", groups: "10 групп" },
      { name: "Pro", students: "Безлимит учеников", groups: "Безлимит групп" },
    ],
    feat: {
      payment: "Контроль оплат",
      invite: "Ссылка / заявка",
      manual: "Добавление вручную",
      bot: "Добавление через бота",
      reminder: "Авто-напоминания об оплате",
      attendance: "Посещаемость",
      reports: "Отчёты",
    },
    finalTitle: "Начните сегодня",
    finalSub: "Оставьте заявку — админ свяжется и откроет ваш аккаунт.",
    finalCta: "Оставить заявку в Telegram",
    footer: "© 2026 EduTrack · Для спорт-тренеров",
  },
} as const;

// ── Bot dictionary ───────────────────────────────────────────────────────────
export const botMsg = {
  uz: {
    chooseLang: "Tilni tanlang / Выберите язык:",
    onboarding:
      "🎁 EduTrack — sport trenerlar uchun #1 yordamchi!\n\n" +
      "O'quvchilar, to'lovlar va davomat — hammasi bir joyda, Telegram'da. Excel va daftarga qaytmaysiz! 📊\n\n" +
      "🎓 Trenermisiz?\n✅ Sizga BEPUL akkaunt ochib beramiz!\n" +
      "Faqat ariza qoldiring — trenerligingizni tasdiqlab, bugunoq ishga tushiramiz.\n\n" +
      "🔒 (Xavfsizlik uchun faqat haqiqiy trenerlarni qabul qilamiz.)\n\n" +
      "👨‍🎓 O'quvchimisiz? O'qituvchingiz bergan havola orqali kiring.",
    btnApply: "🎁 Bepul akkaunt ochish",
    btnCabinet: "🎓 Kabinetga kirish (akkauntim bor)",
    btnFeedback: "💬 Fikr bildirish",
    studentWelcome: "EduTrack ga xush kelibsiz! 📚\nRo'yxatdan o'tish uchun tugmani bosing:",
    btnRegister: "📝 Ro'yxatdan o'tish",
    feedbackPrompt: "📝 Fikr yoki muammoingizni shu xabarga javob tariqasida yozib yuboring:",
    feedbackThanks: "Rahmat! Fikringiz qabul qilindi 🙏",
    langSaved: "✅ Til o'zbekchaga o'rnatildi.",
  },
  ru: {
    chooseLang: "Tilni tanlang / Выберите язык:",
    onboarding:
      "🎁 EduTrack — #1 помощник для спорт-тренеров!\n\n" +
      "Ученики, оплаты и посещаемость — всё в одном месте, в Telegram. Забудьте про Excel и тетради! 📊\n\n" +
      "🎓 Вы тренер?\n✅ Откроем вам БЕСПЛАТНЫЙ аккаунт!\n" +
      "Просто оставьте заявку — подтвердим, что вы тренер, и запустим сегодня же.\n\n" +
      "🔒 (В целях безопасности принимаем только настоящих тренеров.)\n\n" +
      "👨‍🎓 Вы ученик? Войдите по ссылке, которую дал ваш тренер.",
    btnApply: "🎁 Открыть бесплатный аккаунт",
    btnCabinet: "🎓 Войти в кабинет (есть аккаунт)",
    btnFeedback: "💬 Оставить отзыв",
    studentWelcome: "Добро пожаловать в EduTrack! 📚\nНажмите кнопку для регистрации:",
    btnRegister: "📝 Регистрация",
    feedbackPrompt: "📝 Напишите ваш отзыв или проблему в ответ на это сообщение:",
    feedbackThanks: "Спасибо! Ваш отзыв принят 🙏",
    langSaved: "✅ Язык установлен на русский.",
  },
} as const;

export function botLang(v: string | null | undefined): Locale {
  return v === "ru" ? "ru" : "uz";
}
