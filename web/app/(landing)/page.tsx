import Link from "next/link";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/landing/phone-mockup";
import { fmtMoney } from "@/lib/utils";
import { PLAN_PRICE, PLAN_PRICE_YEARLY } from "@/lib/plan";
import { applyLink } from "@/lib/apply";

const apply = applyLink();

const FEATURES = [
  { icon: "📱", title: "Telegram orqali", desc: "O'quvchilar bot orqali ro'yxatdan o'tadi. Hech qanday ilova kerak emas." },
  { icon: "✅", title: "Bir tugma bilan", desc: "Yangi ariza kelsa — tasdiqlash yoki rad etish faqat bir bosuv." },
  { icon: "💰", title: "To'lov nazorati", desc: "Kim to'lagan, kim to'lamagan — bir qarashda. Avto eslatma bilan." },
  { icon: "📋", title: "Davomat", desc: "Har kuni o'quvchilar davomatini belgilang va statistikasini ko'ring." },
];

const STEPS = [
  { n: "1", title: "Ariza topshiring", desc: "Telegram orqali ma'lumotlaringizni yuboring." },
  { n: "2", title: "Tasdiqlash", desc: "Admin tekshirib, akkauntingizni ochib beradi." },
  { n: "3", title: "Boshqaring", desc: "Havolangizni o'quvchilarga ulashing, to'lov va davomatni yuriting." },
];

const PLANS = [
  {
    name: "Bepul",
    monthly: PLAN_PRICE.FREE,
    yearly: PLAN_PRICE_YEARLY.FREE,
    features: ["10 o'quvchi", "3 guruh", "To'lov nazorati", "Telegram havola"],
    primary: false,
  },
  {
    name: "Asosiy",
    monthly: PLAN_PRICE.BASIC,
    yearly: PLAN_PRICE_YEARLY.BASIC,
    features: ["60 o'quvchi", "10 guruh", "Bot orqali qo'shish", "Avto to'lov eslatma"],
    primary: true,
  },
  {
    name: "Pro",
    monthly: PLAN_PRICE.PRO,
    yearly: PLAN_PRICE_YEARLY.PRO,
    features: ["Cheksiz o'quvchi", "Cheksiz guruh", "Davomat", "Hisobotlar"],
    primary: false,
  },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Logo className="size-7" />
          <span className="text-xl font-bold text-primary tracking-tight">EduTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
            Kirish
          </Link>
          <a
            href={apply}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Ariza topshirish
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_70%_0%,theme(colors.primary/14),transparent)]" />
        <div className="absolute -z-10 top-20 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -z-10 top-40 right-0 size-72 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 pt-12 lg:pt-16 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              🏆 Sport trenerlar uchun #1 yordamchi
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Excel va daftar o&apos;rniga —<br />
              <span className="text-primary">aqlli boshqaruv</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              O&apos;quvchilar, to&apos;lovlar va davomat — barchasi Telegram orqali bir joyda.
              Hech narsani unutmaysiz, hech qaysi to&apos;lovni yo&apos;qotmaysiz.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <a
                href={apply}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                🎁 Bepul akkaunt oching
              </a>
              <Link
                href="/login"
                className="w-full sm:w-auto h-12 px-8 rounded-xl border border-border bg-card text-foreground font-medium flex items-center justify-center hover:bg-muted transition-colors"
              >
                Tizimga kirish
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              🎁 Akkaunt <b className="text-foreground">mutlaqo bepul</b> — trenerligingiz tasdiqlangach, biz ochib beramiz
            </p>
          </div>

          {/* Right: product mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-2.5">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">Qanday boshlanadi?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-2">
                <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {s.n}
                </div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card border-y border-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">Tariflar</h2>
          <p className="text-center text-muted-foreground text-sm mb-10">
            Bepul boshlang — o&apos;quvchilaringiz ko&apos;paysa, oshiring. Yillik to&apos;lovda <b>2 oy bepul</b>.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                  plan.primary ? "border-primary bg-primary/5 ring-1 ring-primary/20 relative" : "border-border bg-background"
                }`}
              >
                {plan.primary && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                    OMMABOP
                  </span>
                )}
                <div>
                  <div className="font-semibold text-foreground">{plan.name}</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {plan.monthly === 0 ? "Bepul" : fmtMoney(plan.monthly)}
                    {plan.monthly > 0 && <span className="text-sm font-normal text-muted-foreground">/oy</span>}
                  </div>
                  {plan.yearly > 0 && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      yoki {fmtMoney(plan.yearly)}/yil
                    </div>
                  )}
                </div>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-green-600 shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={apply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-auto h-10 rounded-xl font-medium text-sm flex items-center justify-center transition-colors ${
                    plan.primary
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  Tanlash
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-5">
          <Logo className="size-14" />
          <h2 className="text-3xl font-bold text-foreground">Bugun boshlang</h2>
          <p className="text-muted-foreground">
            Ariza qoldiring — admin tezda bog&apos;lanib, akkauntingizni ochib beradi.
          </p>
          <a
            href={apply}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.95 4.27 18.6 19.94c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.43 2.34c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.1-.56-.62-.2L6.6 13.06l-4.97-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 2.7c.9-.34 1.68.2 1.4 1.57Z" />
            </svg>
            Telegram orqali ariza topshirish
          </a>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        © 2026 EduTrack · Sport trenerlar uchun
      </footer>
    </main>
  );
}
