import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsLoading() {
  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-24 mx-auto" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="bg-card rounded-2xl border border-border px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
