import { RegistrationForm } from "@/components/mini-app/registration-form";

export default async function MiniAppPage({
  searchParams,
}: {
  searchParams: Promise<{ trainer?: string }>;
}) {
  const { trainer: trainerId } = await searchParams;

  if (!trainerId) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl">⚠️</span>
          <p className="font-medium">Noto&apos;g&apos;ri havola</p>
          <p className="text-sm text-muted-foreground">
            O&apos;qituvchingiz bergan havola orqali kiring
          </p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const groupsRes = await fetch(`${baseUrl}/api/mini-app/groups?trainer=${trainerId}`, {
    cache: "no-store",
  });
  const groups = groupsRes.ok ? await groupsRes.json() : [];

  return <RegistrationForm trainerId={trainerId} groups={groups} />;
}
