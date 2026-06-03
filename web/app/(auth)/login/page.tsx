"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { normalizePhone, phoneToEmail } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { applyLink } from "@/lib/apply";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Phone is the identifier. (An email is still accepted as a fallback for
    // legacy accounts created before the phone switch.)
    let identifierEmail: string;
    if (phone.includes("@")) {
      identifierEmail = phone.trim();
    } else {
      const normalized = normalizePhone(phone);
      if (!normalized) {
        setError("Telefon raqamini to'g'ri kiriting");
        setLoading(false);
        return;
      }
      identifierEmail = phoneToEmail(normalized);
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: identifierEmail,
      password,
    });

    if (error) {
      setError("Telefon yoki parol noto'g'ri");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo className="size-14 mb-3" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">EduTrack</h1>
          <p className="text-muted-foreground mt-1 text-sm">Tizimga kiring</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Telefon raqam</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Parol</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Kirilmoqda..." : "Kirish"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Akkaunt ochmoqchimisiz?{" "}
          <a
            href={applyLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Ariza topshiring
          </a>
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          <Link href="/" className="hover:underline">
            ← Bosh sahifaga
          </Link>
        </p>
      </div>
    </div>
  );
}
