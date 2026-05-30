"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initials, avatarColor, fmtMoney, relTime } from "@/lib/utils";
import type { Student, Group } from "@/types";

interface Props {
  student: Student & { group: Group | null };
  index?: number;
}

export function PendingCard({ student, index = 0 }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null);

  async function action(type: "confirm" | "reject") {
    setLoading(type);
    const res = await fetch(`/api/students/${student.id}/${type}`, { method: "PATCH" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Amal bajarilmadi");
    }
    router.refresh();
    setLoading(null);
  }

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }}
      className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
    >
      {/* Top: avatar + info + tag */}
      <div className="flex items-center gap-3">
        <div
          className={`size-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor(student.id)}`}
        >
          {initials(student.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-sm truncate">
            {student.fullName}
          </div>
          <div className="text-xs text-muted-foreground">{student.phone}</div>
        </div>
        {student.group && (
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
            {student.group.name.split("·")[0].trim()}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 rounded-lg px-3 py-2">
          <span className="text-muted-foreground block">Ariza</span>
          <span className="font-medium">{relTime(student.createdAt.toISOString())}</span>
        </div>
        <div className="bg-muted/50 rounded-lg px-3 py-2">
          <span className="text-muted-foreground block">Oylik</span>
          <span className="font-medium">
            {student.group ? fmtMoney(student.group.monthlyFee) : "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => action("reject")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          {loading === "reject" ? "..." : "Rad etish"}
        </button>
        <button
          onClick={() => action("confirm")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-1.5 h-9 rounded-xl text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {loading === "confirm" ? "..." : "Tasdiqlash"}
        </button>
      </div>
    </div>
  );
}
