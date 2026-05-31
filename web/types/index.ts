export type Plan = "FREE" | "BASIC" | "PRO";
export type StudentStatus = "PENDING" | "ACTIVE" | "REJECTED";
export type PaymentStatus = "PENDING" | "PAID";

export interface Trainer {
  id: string;
  email: string;
  phone: string | null;
  telegramId: string | null;
  name: string | null;
  referral: string | null;
  attendanceEnabled: boolean;
  plan: Plan;
  planExpiresAt: Date | null;
  createdAt: Date;
}

export interface Group {
  id: number;
  trainerId: string;
  name: string;
  monthlyFee: number;
  createdAt: Date;
}

export interface Student {
  id: number;
  trainerId: string;
  groupId: number | null;
  telegramId: string | null;
  fullName: string;
  phone: string;
  status: StudentStatus;
  paymentDay: number | null;
  createdAt: Date;
  updatedAt: Date;
  group?: Group | null;
}

export interface Payment {
  id: number;
  studentId: number;
  month: number;
  year: number;
  amount: number;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
}

export interface DashboardStats {
  total: number;
  active: number;
  pending: number;
  unpaid: number;
}
