"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Group } from "@/types";

type View = "form" | "pending" | "confirmed" | "rejected";

interface Props {
  trainerId: string;
  groups: Group[];
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: { user?: { id?: number; first_name?: string } };
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

export function RegistrationForm({ trainerId, groups }: Props) {
  const [view, setView] = useState<View>("form");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [groupId, setGroupId] = useState<string>(groups[0] ? String(groups[0].id) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [telegramId, setTelegramId] = useState<number | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
    const user = tg?.initDataUnsafe?.user;
    if (user?.id) {
      setTelegramId(user.id);
      if (user.first_name) setFullName(user.first_name);
    }

    // Check existing status
    if (user?.id) {
      fetch(`/api/mini-app/status?trainer=${trainerId}&telegram_id=${user.id}`)
        .then((r) => r.json())
        .then((student) => {
          if (student?.status === "PENDING") setView("pending");
          else if (student?.status === "ACTIVE") setView("confirmed");
          else if (student?.status === "REJECTED") setView("rejected");
        })
        .catch(() => {});
    }
  }, [trainerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formatted = phone.startsWith("+998") ? phone : `+998${phone.replace(/\D/g, "")}`;

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainer_id: trainerId,
        full_name: fullName,
        phone: formatted,
        group_id: Number(groupId),
        telegram_id: telegramId,
      }),
    });

    if (!res.ok) {
      setError("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
      setLoading(false);
      return;
    }

    setView("pending");
    setLoading(false);
  }

  if (view === "pending") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center gap-5">
        <div className="size-24 rounded-full border-4 border-dashed border-orange-400 flex items-center justify-center text-4xl animate-spin-slow">
          ⏳
        </div>
        <div>
          <h2 className="font-bold text-xl">Ariza yuborildi!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            O&apos;qituvchi tasdiqlashini kuting
          </p>
        </div>
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-4 text-left">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Holat</span>
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Kutilmoqda
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Guruh</span>
            <span className="text-sm font-medium">
              {groups.find((g) => g.id === Number(groupId))?.name ?? "—"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (view === "confirmed") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center gap-5">
        <div className="size-24 rounded-full bg-green-100 flex items-center justify-center text-4xl">
          ✅
        </div>
        <div>
          <h2 className="font-bold text-xl">Tasdiqlandingiz!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Endi siz o&apos;quvchisiz. Xush kelibsiz!
          </p>
        </div>
      </div>
    );
  }

  if (view === "rejected") {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center gap-5">
        <div className="size-24 rounded-full bg-red-100 flex items-center justify-center text-4xl">
          ❌
        </div>
        <div>
          <h2 className="font-bold text-xl">Ariza rad etildi</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Qo&apos;shimcha ma&apos;lumot uchun o&apos;qituvchi bilan bog&apos;laning
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col p-6 gap-6 max-w-md mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold">Ro&apos;yxatdan o&apos;tish</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ma&apos;lumotlaringizni kiriting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Ism familiya</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Abdullayev Jasur"
            className="h-12 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Telefon raqam</label>
          <div className="flex gap-2">
            <span className="h-12 flex items-center px-4 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground">
              +998
            </span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="91 234 56 78"
              className="flex-1 h-12 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Guruh</label>
          <select
            required
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="h-12 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full h-12 mt-auto text-base">
          {loading ? "Yuborilmoqda..." : "Ariza yuborish"}
        </Button>
      </form>
    </div>
  );
}
