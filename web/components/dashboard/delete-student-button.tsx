"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteStudentButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm(`"${name}" o'quvchini o'chirasizmi?\n\nUning to'lov tarixi ham o'chadi. Bu amalni qaytarib bo'lmaydi.`)) {
      return;
    }
    setLoading(true);
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      disabled={loading}
      title="O'chirish"
      className="size-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 shrink-0"
    >
      {loading ? (
        <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
        </svg>
      )}
    </button>
  );
}
