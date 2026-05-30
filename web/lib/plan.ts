import type { Plan } from "@/types";

// ── Subscription tiers ───────────────────────────────────────────────────────
// All plan limits & feature flags live here so the FREE/BASIC/PRO boundary —
// the core of the upgrade funnel — is tuned in one place.

export interface PlanLimits {
  maxStudents: number; // active students (Infinity = unlimited)
  maxGroups: number;
  botAdd: boolean; // add students via the Telegram bot
  reminders: boolean; // automatic payment reminders
  attendance: boolean; // Davomat
  reports: boolean; // analytics / export
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: { maxStudents: 10, maxGroups: 3, botAdd: false, reminders: false, attendance: false, reports: false },
  BASIC: { maxStudents: 60, maxGroups: 10, botAdd: true, reminders: true, attendance: false, reports: false },
  PRO: { maxStudents: Infinity, maxGroups: Infinity, botAdd: true, reminders: true, attendance: true, reports: true },
};

export const PLAN_LABEL: Record<Plan, string> = { FREE: "Bepul", BASIC: "Asosiy", PRO: "Pro" };
export const PLAN_PRICE: Record<Plan, number> = { FREE: 0, BASIC: 49000, PRO: 99000 };
// Yearly = pay for 10 months, get 2 free.
export const PLAN_PRICE_YEARLY: Record<Plan, number> = { FREE: 0, BASIC: 490000, PRO: 990000 };

export function planLimits(plan: Plan | undefined | null): PlanLimits {
  return PLAN_LIMITS[plan ?? "FREE"];
}

export function canUseAttendance(plan: Plan | undefined | null): boolean {
  return planLimits(plan).attendance;
}

/** Plan that unlocks a given student count (used for upgrade messaging). */
export function nextPlanFor(plan: Plan): Plan {
  return plan === "FREE" ? "BASIC" : "PRO";
}

export function studentLimitMessage(plan: Plan): string {
  const limit = planLimits(plan).maxStudents;
  return `${limit} ta o'quvchi limitiga yetdingiz. Ko'proq o'quvchi uchun ${PLAN_LABEL[nextPlanFor(plan)]} tarifga o'ting — admin bilan bog'laning.`;
}

export function groupLimitMessage(plan: Plan): string {
  const limit = planLimits(plan).maxGroups;
  return `${limit} ta guruh limitiga yetdingiz. Ko'proq guruh uchun ${PLAN_LABEL[nextPlanFor(plan)]} tarifga o'ting.`;
}
