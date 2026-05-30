"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initials, avatarColor, fmtMoney } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";
import type { Student, Group } from "@/types";

interface Props {
  student: Student & { group: Group | null };
  paid: boolean;
  month: number;
  year: number;
  index?: number;
}

export function PaymentRow({ student, paid: initialPaid, month, year, index = 0 }: Props) {
  const [paid, setPaid] = useState(initialPaid);
  const [loading, setLoading] = useState(false);
  const [paymentDay, setPaymentDay] = useState<number | null>(student.paymentDay);
  const [editingDay, setEditingDay] = useState(false);
  const [dayInput, setDayInput] = useState(student.paymentDay ? String(student.paymentDay) : "");
  const router = useRouter();
  const t = useT();

  async function toggle() {
    setLoading(true);
    const newStatus = paid ? "PENDING" : "PAID";
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: student.id,
        month,
        year,
        amount: student.group?.monthlyFee ?? 0,
        status: newStatus,
      }),
    });
    // First-ever payment auto-anchors the payment day on the server; mirror it.
    if (!paid && paymentDay == null) {
      const today = new Date(Date.now() + 5 * 3600 * 1000).getUTCDate();
      setPaymentDay(today);
      setDayInput(String(today));
    }
    setPaid(!paid);
    setLoading(false);
    router.refresh();
  }

  async function saveDay() {
    const n = Number(dayInput);
    const value = dayInput === "" ? null : n;
    if (value !== null && (!Number.isInteger(n) || n < 1 || n > 31)) return;
    setEditingDay(false);
    setPaymentDay(value);
    await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentDay: value }),
    });
    router.refresh();
  }

  // Has the payment day arrived for the viewed cycle? (Tashkent UTC+5)
  const tash = new Date(Date.now() + 5 * 3600 * 1000);
  const ty = tash.getUTCFullYear();
  const tm = tash.getUTCMonth() + 1;
  const td = tash.getUTCDate();
  const daysInMonth = new Date(year, month, 0).getDate();
  const dueDay = paymentDay != null ? Math.min(paymentDay, daysInMonth) : null;
  let isDue = false;
  if (dueDay != null) {
    if (year < ty || (year === ty && month < tm)) isDue = true; // overdue
    else if (year === ty && month === tm) isDue = td >= dueDay; // due this month
  }

  const state: "paid" | "due" | "pending" = paid ? "paid" : isDue ? "due" : "pending";
  const btnClass =
    state === "paid"
      ? "bg-green-50 text-green-700 border border-green-200"
      : state === "due"
      ? "bg-green-600 text-white border border-green-600 shadow-sm"
      : "bg-muted text-muted-foreground border border-border";
  const btnLabel = state === "paid" ? t.paid : state === "due" ? t.paidShort : t.pending;

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300"
    >
      <div
        className={`size-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(student.id)}`}
      >
        {initials(student.fullName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground truncate">{student.fullName}</div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
          <span>
            {student.group ? (
              <>{student.group.name.split("·")[0].trim()} · {fmtMoney(student.group.monthlyFee)}</>
            ) : (
              t.noGroup
            )}
          </span>

          {editingDay ? (
            <span className="inline-flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={31}
                value={dayInput}
                autoFocus
                onChange={(e) => setDayInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveDay();
                  if (e.key === "Escape") setEditingDay(false);
                }}
                placeholder="kun"
                className="w-14 h-6 rounded-md border border-border bg-background px-1.5 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={saveDay}
                className="text-primary font-medium px-1.5 py-0.5 rounded-md hover:bg-primary/10"
              >
                {t.save}
              </button>
            </span>
          ) : (
            <button
              onClick={() => setEditingDay(true)}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {paymentDay ? `${paymentDay}${t.daySuffix}` : t.setDay}
            </button>
          )}
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 transition-all active:scale-95 ${btnClass} ${
          loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {loading ? (
          <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : state === "due" ? (
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <span className={`size-1.5 rounded-full ${state === "paid" ? "bg-green-500" : "bg-muted-foreground"}`} />
        )}
        {btnLabel}
      </button>
    </div>
  );
}
