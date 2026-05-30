import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface Props {
  stats: DashboardStats;
}

const cards = [
  { key: "total" as const, label: "Jami", dark: true },
  { key: "active" as const, label: "Faol", dark: false },
  { key: "pending" as const, label: "Kutmoqda", dark: false },
  { key: "unpaid" as const, label: "To'lamagan", dark: false },
];

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.key}
          style={{ animationDelay: `${i * 60}ms` }}
          className={cn(
            "rounded-2xl p-4 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500",
            card.dark
              ? "bg-foreground text-background"
              : "bg-card border border-border"
          )}
        >
          <span
            className={cn(
              "text-xs font-medium",
              card.dark ? "text-background/60" : "text-muted-foreground"
            )}
          >
            {card.label}
          </span>
          <span className="text-3xl font-bold">{stats[card.key]}</span>
        </div>
      ))}
    </div>
  );
}
