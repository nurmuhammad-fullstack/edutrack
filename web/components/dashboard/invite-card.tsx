"use client";

import { useState } from "react";

interface Props {
  /** The trainer's personal student-invitation deep link. */
  link: string;
  /** PNG data URL of the QR code encoding `link`. */
  qrDataUrl: string;
  /** Compact rendering for the dashboard empty state (less padding, no QR by default). */
  compact?: boolean;
}

const SHARE_TEXT =
  "Salom! Men EduTrack orqali davomat va to'lovlarni yuritaman. Ro'yxatdan o'tish uchun shu havoladan kiring:";

export function InviteCard({ link, qrDataUrl, compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for browsers without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    link
  )}&text=${encodeURIComponent(SHARE_TEXT)}`;

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "EduTrack", text: SHARE_TEXT, url: link });
      } catch {
        /* user cancelled */
      }
    } else {
      window.open(telegramShareUrl, "_blank");
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6" />
        </svg>
        <span className="font-medium text-sm text-foreground">O&apos;quvchilarni taklif qilish</span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {!compact && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bu sizning shaxsiy havolangiz. O&apos;quvchilarga yuboring — ular havola orqali ro&apos;yxatdan
            o&apos;tadi va arizalari shu yerda paydo bo&apos;ladi.
          </p>
        )}

        {/* Link + copy */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground font-mono truncate">
            {link.replace(/^https:\/\//, "")}
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
              copied
                ? "bg-green-100 text-green-700"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            {copied ? (
              <>
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Nusxalandi
              </>
            ) : (
              <>
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Nusxalash
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={telegramShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2AABEE] text-white text-sm font-medium hover:bg-[#1d9bd9] transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.95 4.27 18.6 19.94c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.43 2.34c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.1-.56-.62-.2L6.6 13.06l-4.97-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 2.7c.9-.34 1.68.2 1.4 1.57Z" />
            </svg>
            Telegram
          </a>
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
            </svg>
            Ulashish
          </button>
        </div>

        {/* QR toggle */}
        <button
          onClick={() => setShowQr((v) => !v)}
          className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h.01M21 21h.01M21 17v.01" />
          </svg>
          {showQr ? "QR-kodni yashirish" : "QR-kodni ko'rsatish"}
        </button>

        {showQr && (
          <div className="flex flex-col items-center gap-3 pt-1">
            <div className="bg-white p-3 rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Taklif QR-kodi" width={180} height={180} className="size-44" />
            </div>
            <a
              href={qrDataUrl}
              download="edutrack-taklif-qr.png"
              className="text-xs font-medium text-primary hover:underline"
            >
              QR-kodni yuklab olish
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
