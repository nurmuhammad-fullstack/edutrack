"use client";

import { useEffect, useState } from "react";
import { initials, avatarColor } from "@/lib/utils";
import type { Student, Group } from "@/types";

type Status = "PRESENT" | "ABSENT" | "LATE";

interface Props {
  groups: Group[];
  students: (Student & { group: Group | null })[];
  today: string; // YYYY-MM-DD (Tashkent)
}

const WEEKDAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

function shiftDate(s: string, delta: number) {
  const d = new Date(`${s}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
function dateLabel(s: string) {
  const d = new Date(`${s}T00:00:00.000Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} · ${WEEKDAYS[d.getUTCDay()]}`;
}

export function AttendanceClient({ groups, students, today }: Props) {
  const [date, setDate] = useState(today);
  const [group, setGroup] = useState<number | null>(null);
  const [att, setAtt] = useState<Record<number, Status>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/attendance?date=${date}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { studentId: number; status: Status }[]) => {
        if (!active) return;
        const map: Record<number, Status> = {};
        for (const r of rows) map[r.studentId] = r.status;
        setAtt(map);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [date]);

  async function mark(studentId: number, status: Status) {
    const prev = att[studentId];
    setAtt((m) => ({ ...m, [studentId]: status })); // optimistic
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, date, status }),
    });
    if (!res.ok) {
      setAtt((m) => {
        const n = { ...m };
        if (prev) n[studentId] = prev;
        else delete n[studentId];
        return n;
      });
    }
  }

  const visible = group == null ? students : students.filter((s) => s.groupId === group);
  const present = visible.filter((s) => att[s.id] === "PRESENT").length;
  const absent = visible.filter((s) => att[s.id] === "ABSENT").length;
  const late = visible.filter((s) => att[s.id] === "LATE").length;
  const isToday = date === today;

  const STATUS_BTN: { key: Status; label: string; on: string; icon: string }[] = [
    { key: "PRESENT", label: "Keldi", on: "bg-green-600 text-white border-green-600", icon: "M20 6 9 17l-5-5" },
    { key: "LATE", label: "Kech", on: "bg-amber-500 text-white border-amber-500", icon: "M12 6v6l4 2M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" },
    { key: "ABSENT", label: "Kelmadi", on: "bg-red-500 text-white border-red-500", icon: "M18 6 6 18M6 6l12 12" },
  ];

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      {/* Header + date nav */}
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-foreground">Davomat</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDate((d) => shiftDate(d, -1))}
            className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            onClick={() => setDate((d) => shiftDate(d, 1))}
            disabled={isToday}
            className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
        {dateLabel(date)}
        {!isToday && (
          <button onClick={() => setDate(today)} className="text-xs text-primary hover:underline">
            Bugun
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-green-700">{present}</div>
          <div className="text-[11px] text-green-700/70">Keldi</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-amber-700">{late}</div>
          <div className="text-[11px] text-amber-700/70">Kech</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-600">{absent}</div>
          <div className="text-[11px] text-red-600/70">Kelmadi</div>
        </div>
      </div>

      {/* Group filter */}
      {groups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setGroup(null)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              group == null ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border"
            }`}
          >
            Hammasi
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                group === g.id ? "bg-foreground text-background border-foreground" : "bg-card text-muted-foreground border-border"
              }`}
            >
              {g.name.split("·")[0].trim()}
            </button>
          ))}
        </div>
      )}

      {/* Students */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-card rounded-2xl border border-border">
          <span className="text-3xl">👤</span>
          <p className="text-muted-foreground text-sm">Faol o&apos;quvchilar yo&apos;q</p>
        </div>
      ) : (
        <div className={`bg-card rounded-2xl border border-border px-4 ${loading ? "opacity-60" : ""}`}>
          {visible.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className={`size-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(s.id)}`}>
                {initials(s.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{s.fullName}</div>
                {s.group && (
                  <div className="text-xs text-muted-foreground">{s.group.name.split("·")[0].trim()}</div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {STATUS_BTN.map((b) => {
                  const active = att[s.id] === b.key;
                  return (
                    <button
                      key={b.key}
                      onClick={() => mark(s.id, b.key)}
                      title={b.label}
                      className={`size-8 rounded-lg border flex items-center justify-center transition-all active:scale-90 ${
                        active ? b.on : "bg-card text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={b.icon} />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
