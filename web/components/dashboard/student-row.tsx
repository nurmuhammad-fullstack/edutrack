import { initials, avatarColor, fmtMoney } from "@/lib/utils";
import { DeleteStudentButton } from "@/components/dashboard/delete-student-button";
import type { DashboardDict } from "@/lib/i18n";
import type { Student, Group, Payment } from "@/types";

interface Props {
  student: Student & { group: Group | null };
  payments: Payment[];
  index?: number;
  t: Pick<DashboardDict, "paid" | "pending">;
}

export function StudentRow({ student, payments, index = 0, t }: Props) {
  const now = new Date();
  const paid = payments.some(
    (p) =>
      p.studentId === student.id &&
      p.month === now.getMonth() + 1 &&
      p.year === now.getFullYear() &&
      p.status === "PAID"
  );

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0 animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-300"
    >
      <div
        className={`size-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(student.id)}`}
      >
        {initials(student.fullName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground truncate">
          {student.fullName}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 min-w-0">
          {student.group && (
            <>
              <span className="bg-muted rounded-full px-1.5 py-0.5 shrink-0 whitespace-nowrap">
                {student.group.name.split("·")[0].trim()}
              </span>
              <span className="shrink-0">·</span>
              <span className="truncate">{fmtMoney(student.group.monthlyFee)}</span>
            </>
          )}
        </div>
      </div>
      <span
        className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
          paid
            ? "bg-green-50 text-green-700"
            : "bg-orange-50 text-orange-700"
        }`}
      >
        <span className={`size-1.5 rounded-full ${paid ? "bg-green-500" : "bg-orange-500"}`} />
        {paid ? t.paid : t.pending}
      </span>
      <DeleteStudentButton id={student.id} name={student.fullName} />
    </div>
  );
}
