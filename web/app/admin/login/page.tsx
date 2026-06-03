"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Noto'g'ri parol");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#f4f5f7] text-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-slate-200/60 p-7">
        <div className="flex flex-col items-center mb-7">
          <Logo className="size-14 mb-4" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">EduTrack Admin</h1>
          <p className="text-sm text-slate-400 mt-1">Boshqaruv paneli</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Parol</label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
