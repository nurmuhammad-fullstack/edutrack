import Link from "next/link";
import { Logo } from "@/components/logo";
import { applyLink, APPLY_TEMPLATE } from "@/lib/apply";

// Self-service registration is intentionally disabled. Trainer accounts are
// created by the admin after verifying the person is a real coach.
export default function RegisterPage() {
  const apply = applyLink();

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <Logo className="size-16 mb-5" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Akkaunt ochish</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-sm">
          Xavfsizlik uchun akkauntlar qo&apos;lda ochiladi — faqat haqiqiy trenerlar uchun.
          Quyidagi ma&apos;lumotlarni Telegram orqali yuboring, admin tekshirib akkauntingizni
          ochib beradi.
        </p>

        <div className="mt-5 w-full bg-card border border-border rounded-2xl p-4 text-left">
          <div className="text-xs font-medium text-muted-foreground mb-2">Yuboriladigan ma&apos;lumotlar:</div>
          <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{APPLY_TEMPLATE}</pre>
        </div>

        <a
          href={apply}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.95 4.27 18.6 19.94c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.43 2.34c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.1-.56-.62-.2L6.6 13.06l-4.97-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 2.7c.9-.34 1.68.2 1.4 1.57Z" />
          </svg>
          Telegram orqali ariza topshirish
        </a>

        <p className="text-sm text-muted-foreground mt-6">
          Akkauntingiz bormi?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Kiring
          </Link>
        </p>
      </div>
    </div>
  );
}
