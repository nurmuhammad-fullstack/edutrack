import Link from "next/link";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/landing/phone-mockup";
import { LangSwitcher } from "@/components/lang-switcher";
import { fmtMoney } from "@/lib/utils";
import { PLAN_PRICE, PLAN_PRICE_YEARLY } from "@/lib/plan";
import { applyLink } from "@/lib/apply";
import { landing } from "@/lib/i18n";
import { getLocale } from "@/lib/get-locale";

const apply = applyLink();

const FEAT_KEYS = ["payment", "invite", "manual", "bot", "reminder", "attendance", "reports"] as const;

// Prices + feature flags (text labels come from the locale dictionary, aligned by index).
const PLAN_META = [
  {
    monthly: PLAN_PRICE.FREE,
    yearly: PLAN_PRICE_YEARLY.FREE,
    primary: false,
    feats: { payment: true, invite: true, manual: true, bot: false, reminder: false, attendance: false, reports: false },
  },
  {
    monthly: PLAN_PRICE.BASIC,
    yearly: PLAN_PRICE_YEARLY.BASIC,
    primary: true,
    feats: { payment: true, invite: true, manual: true, bot: true, reminder: true, attendance: false, reports: false },
  },
  {
    monthly: PLAN_PRICE.PRO,
    yearly: PLAN_PRICE_YEARLY.PRO,
    primary: false,
    feats: { payment: true, invite: true, manual: true, bot: true, reminder: true, attendance: true, reports: true },
  },
] as const;

export default async function LandingPage() {
  const locale = await getLocale();
  const t = landing[locale];

  return (
    <main className="flex flex-col min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-3.5 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Logo className="size-7" />
          <span className="text-xl font-bold text-primary tracking-tight">EduTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitcher locale={locale} />
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">
            {t.navLogin}
          </Link>
          <a
            href={apply}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            {t.navApply}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_70%_0%,theme(colors.primary/14),transparent)]" />
        <div className="absolute -z-10 top-20 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -z-10 top-40 right-0 size-72 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 pt-12 lg:pt-16 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              {t.heroBadge}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              {t.heroTitle1}
              <br />
              <span className="text-primary">{t.heroTitle2}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">{t.heroSub}</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <a
                href={apply}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                {t.ctaFree}
              </a>
              <Link
                href="/login"
                className="w-full sm:w-auto h-12 px-8 rounded-xl border border-border bg-card text-foreground font-medium flex items-center justify-center hover:bg-muted transition-colors"
              >
                {t.ctaLogin}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">{t.trust}</p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.map((f) => (
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
          <h2 className="text-2xl font-bold text-center text-foreground mb-10">{t.howTitle}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {t.steps.map((s) => (
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
          <h2 className="text-2xl font-bold text-center text-foreground mb-2">{t.pricingTitle}</h2>
          <p className="text-center text-muted-foreground text-sm mb-10">{t.pricingSub}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PLAN_META.map((plan, i) => {
              const meta = t.plans[i];
              return (
                <div
                  key={meta.name}
                  className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                    plan.primary ? "border-primary bg-primary/5 ring-1 ring-primary/20 relative" : "border-border bg-background"
                  }`}
                >
                  {plan.primary && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                      {t.popular}
                    </span>
                  )}
                  <div>
                    <div className="font-semibold text-foreground">{meta.name}</div>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      {plan.monthly === 0 ? t.free : fmtMoney(plan.monthly)}
                      {plan.monthly > 0 && <span className="text-sm font-normal text-muted-foreground">{t.perMonth}</span>}
                    </div>
                    {plan.yearly > 0 && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t.perYearPrefix} {fmtMoney(plan.yearly)}{t.perYear}
                      </div>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2 text-sm">
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <span className="text-green-600 shrink-0">✓</span> {meta.students}
                    </li>
                    <li className="flex items-center gap-2 text-foreground font-medium">
                      <span className="text-green-600 shrink-0">✓</span> {meta.groups}
                    </li>
                    {FEAT_KEYS.map((key) => {
                      const has = plan.feats[key];
                      return (
                        <li
                          key={key}
                          className={`flex items-center gap-2 ${has ? "text-muted-foreground" : "text-slate-400"}`}
                        >
                          <span className={`shrink-0 font-bold ${has ? "text-green-600" : "text-red-500"}`}>
                            {has ? "✓" : "✕"}
                          </span>
                          {t.feat[key]}
                        </li>
                      );
                    })}
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
                    {t.choose}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-5">
          <Logo className="size-14" />
          <h2 className="text-3xl font-bold text-foreground">{t.finalTitle}</h2>
          <p className="text-muted-foreground">{t.finalSub}</p>
          <a
            href={apply}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.95 4.27 18.6 19.94c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.43 2.34c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.1-.56-.62-.2L6.6 13.06l-4.97-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 2.7c.9-.34 1.68.2 1.4 1.57Z" />
            </svg>
            {t.finalCta}
          </a>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        {t.footer}
      </footer>
    </main>
  );
}
