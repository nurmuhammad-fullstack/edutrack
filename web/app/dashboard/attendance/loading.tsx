import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceLoading() {
  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-3.5 w-32 flex-1" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
