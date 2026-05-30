import { redirect } from "next/navigation";
import { getTrainerId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fmtMoney } from "@/lib/utils";
import { PaymentRow } from "@/components/dashboard/payment-row";
import { MonthNav } from "@/components/dashboard/month-nav";

const MONTH_NAMES = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const trainerId = await getTrainerId();
  if (!trainerId) redirect("/login");

  const now = new Date();
  const { month: mParam, year: yParam } = await searchParams;
  const month = mParam ? Number(mParam) : now.getMonth() + 1;
  const year = yParam ? Number(yParam) : now.getFullYear();

  const [students, payments] = await Promise.all([
    prisma.student.findMany({
      where: { trainerId, status: "ACTIVE" },
      include: { group: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.payment.findMany({
      where: { student: { trainerId }, month, year },
    }),
  ]);

  const paidIds = new Set(
    payments.filter((p) => p.status === "PAID").map((p) => p.studentId)
  );

  const paidCount = paidIds.size;
  const totalCount = students.length;
  const totalCollected = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = students.reduce(
    (sum, s) => sum + (s.group?.monthlyFee ?? 0),
    0
  );

  return (
    <div className="px-4 py-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-foreground">To&apos;lovlar</h1>
        <MonthNav month={month} year={year} />
      </div>

      <div className="text-center text-sm text-muted-foreground font-medium">
        {MONTH_NAMES[month - 1]} {year}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">To&apos;lagan</div>
          <div className="text-2xl font-bold text-foreground">
            {paidCount}
            <span className="text-base text-muted-foreground font-normal"> / {totalCount}</span>
          </div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: totalCount > 0 ? `${(paidCount / totalCount) * 100}%` : "0%" }}
            />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-xs text-muted-foreground mb-1">Yig&apos;ilgan</div>
          <div className="text-lg font-bold text-foreground leading-tight">
            {fmtMoney(totalCollected)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            / {fmtMoney(totalExpected)}
          </div>
        </div>
      </div>

      {/* Student list */}
      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-card rounded-2xl border border-border">
          <span className="text-3xl">👤</span>
          <p className="text-muted-foreground text-sm">Faol o&apos;quvchilar yo&apos;q</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border px-4">
          {students.map((student, i) => (
            <PaymentRow
              key={student.id}
              student={student}
              paid={paidIds.has(student.id)}
              month={month}
              year={year}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
