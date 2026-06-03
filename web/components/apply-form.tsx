"use client";

import { useState } from "react";

export interface ApplyDict {
  applyName: string;
  applyPhone: string;
  applySport: string;
  applyMessage: string;
  applySend: string;
  applySending: string;
  applyOkTitle: string;
  applyOkSub: string;
  errorOccurred: string;
}

export function ApplyForm({
  dict,
  source,
  referral,
}: {
  dict: ApplyDict;
  source: string;
  referral?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, sport, message, source, referral, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? dict.errorOccurred);
        setSaving(false);
        return;
      }
      setDone(true);
    } catch {
      setError(dict.errorOccurred);
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-8">
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
        <h2 className="text-xl font-bold text-foreground">{dict.applyOkTitle}</h2>
        <p className="text-muted-foreground text-sm max-w-xs">{dict.applyOkSub}</p>
      </div>
    );
  }

  const inputCls =
    "h-12 px-4 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary w-full";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {/* Honeypot — hidden from humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.applyName} required minLength={2} className={inputCls} />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        type="tel"
        inputMode="tel"
        placeholder="+998 90 123 45 67"
        required
        className={inputCls}
        aria-label={dict.applyPhone}
      />
      <input value={sport} onChange={(e) => setSport(e.target.value)} placeholder={dict.applySport} className={inputCls} />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={dict.applyMessage}
        rows={3}
        className="px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:border-primary w-full resize-none"
      />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={saving}
        className="h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20"
      >
        {saving ? dict.applySending : dict.applySend}
      </button>
    </form>
  );
}
