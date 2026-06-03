import Link from "next/link";
import { Logo } from "@/components/logo";
import { LangSwitcher } from "@/components/lang-switcher";
import { ApplyForm } from "@/components/apply-form";
import { applyLink } from "@/lib/apply";
import { landing } from "@/lib/i18n";
import { getLocale } from "@/lib/get-locale";

export const dynamic = "force-dynamic";

// Maps an inbound ?src= tag to a Lead source + optional referral code.
function resolveSource(src?: string, ref?: string): { source: string; referral?: string } {
  if (ref) return { source: "REFERRAL", referral: ref.slice(0, 60) };
  const s = (src ?? "").toLowerCase();
  if (s === "instagram" || s === "ig") return { source: "INSTAGRAM" };
  if (s === "telegram" || s === "tg") return { source: "TELEGRAM" };
  if (s) return { source: "REFERRAL", referral: src!.slice(0, 60) };
  return { source: "WEB" };
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string; ref?: string }>;
}) {
  const locale = await getLocale();
  const t = landing[locale];
  const { src, ref } = await searchParams;
  const { source, referral } = resolveSource(src, ref);

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-7" />
          <span className="text-lg font-bold text-primary tracking-tight">EduTrack</span>
        </Link>
        <LangSwitcher locale={locale} />
      </header>

      <div className="flex-1 flex items-start justify-center px-5 py-8">
        <div className="w-full max-w-md flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">{t.applyTitle}</h1>
            <p className="text-muted-foreground text-sm">{t.applySub}</p>
          </div>

          <ApplyForm
            dict={{
              applyName: t.applyName,
              applyPhone: t.applyPhone,
              applySport: t.applySport,
              applyMessage: t.applyMessage,
              applySend: t.applySend,
              applySending: t.applySending,
              applyOkTitle: t.applyOkTitle,
              applyOkSub: t.applyOkSub,
              errorOccurred: locale === "ru" ? "Произошла ошибка" : "Xatolik yuz berdi",
            }}
            source={source}
            referral={referral}
          />

          <div className="rounded-xl bg-muted/60 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
            {t.applyVerifyNote}
          </div>

          <a
            href={applyLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm font-medium text-primary hover:underline"
          >
            {t.applyOrTg}
          </a>

          <Link href="/" className="text-center text-xs text-muted-foreground hover:text-foreground">
            {t.applyBack}
          </Link>
        </div>
      </div>
    </main>
  );
}
