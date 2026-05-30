import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";

// Admin pages read live platform-wide data — never statically prerender.
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
