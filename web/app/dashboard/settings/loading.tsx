import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  );
}
