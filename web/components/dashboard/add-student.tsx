"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import type { Group } from "@/types";

export function AddStudent({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [groupId, setGroupId] = useState<string>(groups[0] ? String(groups[0].id) : "");
  const [paymentDay, setPaymentDay] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/students/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        phone,
        group_id: groupId || null,
        payment_day: paymentDay || null,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setFullName("");
      setPhone("");
      setPaymentDay("");
      setOpen(false);
      router.refresh();
    } else {
      setError(json.error ?? t.errorOccurred);
    }
    setSaving(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl border border-dashed border-border text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {t.addStudent}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-foreground">{t.newStudent}</span>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder={t.fullName}
        required
        autoFocus
        className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t.phoneOptional}
        className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="flex-1 h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="">{t.noGroup}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={31}
          value={paymentDay}
          onChange={(e) => setPaymentDay(e.target.value)}
          placeholder={t.paymentDayPh}
          className="w-28 h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
      >
        {saving ? t.adding : t.add}
      </button>
    </form>
  );
}
