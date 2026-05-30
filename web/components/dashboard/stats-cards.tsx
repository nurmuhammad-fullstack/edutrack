import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface Props {
  stats: DashboardStats;
  labels: { total: string; active: string; pending: string; unpaid: string };
}

const cards = [
  { key: "total" as const, dark: true },
  { key: "active" as const, dark: false },
  { key: "pending" as const, dark: false },
  { key: "unpaid" as const, dark: false },
];

export function StatsCards({ stats, labels }: Props) {
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
            {labels[card.key]}
          </span>
          <span className="text-3xl font-bold">{stats[card.key]}</span>
        </div>
      ))}
    </div>
  );
}
