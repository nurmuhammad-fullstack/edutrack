"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function LangSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();

  function set(l: Locale) {
    if (l === locale) return;
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold">
      {(["uz", "ru"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
