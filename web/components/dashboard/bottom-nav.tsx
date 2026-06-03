"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";

interface Props {
  pendingCount: number;
  showAttendance?: boolean;
}

const navItems = [
  {
    href: "/dashboard",
    labelKey: "navApplications" as const,
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6M9 16h6M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/students",
    labelKey: "navStudents" as const,
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/attendance",
    labelKey: "navAttendance" as const,
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/dashboard/payments",
    labelKey: "navPayments" as const,
    icon: (
      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <path d="M1 10h22" />
      </svg>
    ),
  },
];

export function BottomNav({ pendingCount, showAttendance = true }: Props) {
  const pathname = usePathname();
  const t = useT();
  const items = showAttendance
    ? navItems
    : navItems.filter((i) => i.href !== "/dashboard/attendance");

  return (
    <nav
      style={{ viewTransitionName: "vt-nav" }}
      className="fixed bottom-0 left-0 right-0 h-[72px] bg-card/80 backdrop-blur-xl border-t border-border z-50 flex items-center pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex w-full">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium relative transition-colors duration-200 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative flex items-center justify-center">
                {/* Sliding active indicator (shared layout animation) */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -inset-x-3 -inset-y-1.5 bg-primary/10 rounded-2xl"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <motion.div
                  className="relative"
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {item.icon}
                  {item.href === "/dashboard" && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 size-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </motion.div>
              </div>
              <span className="relative">{t[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
