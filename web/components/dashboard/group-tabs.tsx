"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Group } from "@/types";

interface Props {
  groups: Group[];
  activeGroup?: string;
}

export function GroupTabs({ groups, activeGroup }: Props) {
  const searchParams = useSearchParams();

  const tabs = [
    { label: "Hammasi", value: undefined },
    ...groups.map((g) => ({
      label: g.name.split("·")[0].trim(),
      value: String(g.id),
    })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {tabs.map((tab) => {
        const isActive = activeGroup === tab.value || (!activeGroup && !tab.value);
        const params = new URLSearchParams(searchParams.toString());
        if (tab.value) {
          params.set("group", tab.value);
        } else {
          params.delete("group");
        }

        return (
          <Link
            key={tab.label}
            href={`/dashboard/students?${params.toString()}`}
            className={cn(
              "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
