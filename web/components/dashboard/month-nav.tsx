"use client";

import { useRouter } from "next/navigation";

interface Props {
  month: number;
  year: number;
}

export function MonthNav({ month, year }: Props) {
  const router = useRouter();

  function go(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    router.push(`/dashboard/payments?month=${m}&year=${y}`);
  }

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => go(-1)}
        className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {!isCurrentMonth && (
        <button
          onClick={() => router.push("/dashboard/payments")}
          className="text-xs text-primary font-medium px-2 py-1 rounded-full hover:bg-primary/10 transition-colors"
        >
          Bugun
        </button>
      )}
      <button
        onClick={() => go(1)}
        className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
