import Link from "next/link";
import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Logo } from "@/components/logo";

// Dashboard pages are per-trainer and auth-gated — never statically prerender.
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const [pendingCount, trainer] = await Promise.all([
    prisma.student.count({ where: { trainerId, status: "PENDING" } }),
    prisma.trainer.findUnique({ where: { id: trainerId }, select: { name: true } }),
  ]);

  const initials =
    trainer?.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "T";

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-card/80 backdrop-blur-xl border-b border-border">
        <span className="inline-flex items-center gap-1.5">
          <Logo className="size-6" />
          <span className="font-bold text-lg text-primary tracking-tight">EduTrack</span>
        </span>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="relative">
              <svg className="size-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 size-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            </div>
          )}
          <Link href="/dashboard/settings" className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
            {initials}
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-nav">{children}</main>

      <BottomNav pendingCount={pendingCount} />
    </div>
  );
}
