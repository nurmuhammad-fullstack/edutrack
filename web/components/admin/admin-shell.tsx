"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

const NAV = [
  {
    id: "overview",
    label: "Umumiy",
    icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  },
  {
    id: "leads",
    label: "Arizalar",
    icon: "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  },
  {
    id: "trainers",
    label: "O'qituvchilar",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  },
  {
    id: "payments",
    label: "To'lovlar",
    icon: "M1 4h22v16H1zM1 10h22",
  },
  {
    id: "feedback",
    label: "Fikrlar",
    icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [active, setActive] = useState("overview");
  const [loggingOut, setLoggingOut] = useState(false);

  function go(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#f4f5f7] text-slate-800 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-200/80 px-4 py-5">
        <div className="flex items-center gap-2 px-2 mb-8">
          <Logo className="size-9" />
          <span className="font-bold text-[17px] tracking-tight text-slate-900">EduTrack</span>
        </div>

        <div className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Boshqaruv
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === item.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <NavIcon d="M3 12l9-9 9 9M5 10v10h14V10" />
            Saytga o&apos;tish
          </a>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <NavIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            {loggingOut ? "Chiqilmoqda..." : "Chiqish"}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 lg:ml-60 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#f4f5f7]/80 backdrop-blur-xl px-5 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="lg:hidden size-8" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Boshqaruv paneli</h1>
              <p className="text-xs text-slate-400 mt-1 hidden sm:block">Platforma umumiy ko&apos;rinishi</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-1.5 py-1.5 shadow-sm border border-slate-200/70">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-none">Admin</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Platforma egasi</div>
            </div>
            <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <button
              onClick={logout}
              disabled={loggingOut}
              title="Chiqish"
              className="lg:hidden size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <NavIcon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </button>
          </div>
        </header>

        <main className="px-5 lg:px-8 pb-10">{children}</main>
      </div>
    </div>
  );
}
