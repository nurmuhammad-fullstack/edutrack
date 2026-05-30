"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { fmtMoney } from "@/lib/utils";
import { formatPhone } from "@/lib/phone";

type Plan = "FREE" | "BASIC" | "PRO";

export interface TrainerRow {
  id: string;
  name: string | null;
  phone: string | null;
  plan: Plan;
  referral: string | null;
  students: number;
  active: number;
  collected: number;
  joined: string;
}

const PLAN_BADGE: Record<Plan, string> = {
  FREE: "bg-slate-100 text-slate-600",
  BASIC: "bg-sky-100 text-sky-700",
  PRO: "bg-amber-100 text-amber-700",
};

const inputCls =
  "h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white transition-colors";

export function TrainersPanel({ trainers }: { trainers: TrainerRow[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

  // Add-trainer form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<Plan>("FREE");
  const [referral, setReferral] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ phone: string; password: string } | null>(null);

  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editReferral, setEditReferral] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? trainers.filter(
        (t) =>
          (t.name ?? "").toLowerCase().includes(q) ||
          (t.phone ?? "").includes(q.replace(/\D/g, "")) ||
          formatPhone(t.phone).toLowerCase().includes(q)
      )
    : trainers;

  function openEdit(t: TrainerRow) {
    setEditId(t.id);
    setEditName(t.name ?? "");
    setEditPhone(t.phone ? formatPhone(t.phone) : "");
    setEditPassword("");
    setEditReferral(t.referral ?? "");
    setEditError("");
  }

  async function addTrainer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/trainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, password, plan, referral }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setCreated({ phone, password });
      setName("");
      setPhone("");
      setPassword("");
      setPlan("FREE");
      setReferral("");
      router.refresh();
    } else {
      setError(json.error ?? "Xatolik yuz berdi");
    }
    setSaving(false);
  }

  async function changePlan(id: string, newPlan: Plan) {
    setSavingPlan(id);
    await fetch(`/api/admin/trainers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: newPlan }),
    });
    setSavingPlan(null);
    router.refresh();
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    setEditError("");
    const payload: Record<string, string> = { name: editName, phone: editPhone, referral: editReferral };
    if (editPassword) payload.password = editPassword;
    const res = await fetch(`/api/admin/trainers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setEditId(null);
      router.refresh();
    } else {
      setEditError(json.error ?? "Xatolik yuz berdi");
    }
    setSavingEdit(false);
  }

  async function deleteTrainer(id: string, label: string) {
    if (
      !confirm(
        `"${label}" trenerini o'chirasizmi?\n\nUning barcha o'quvchilari, guruhlari va to'lovlari ham o'chadi. Bu amalni qaytarib bo'lmaydi.`
      )
    )
      return;
    setDeleting(id);
    await fetch(`/api/admin/trainers/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3 justify-between">
        <h2 className="font-semibold text-slate-900">O&apos;qituvchilar</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="size-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Qidirish..."
              className="h-9 w-40 sm:w-52 rounded-xl bg-slate-50 border border-slate-200 pl-8 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setCreated(null);
              setError("");
            }}
            className="flex items-center gap-1.5 text-sm font-medium px-3.5 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Trener
          </button>
        </div>
      </div>

      {showForm && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          {created ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-emerald-600 font-medium">✅ Akkaunt ochildi!</p>
              <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-xl p-3 font-mono">
                <div>Telefon: {created.phone}</div>
                <div>Parol: {created.password}</div>
              </div>
              <p className="text-[11px] text-slate-400">
                Bu ma&apos;lumotlarni trenerga yuboring. Ular telefon + parol bilan kiradi.
              </p>
              <button onClick={() => setCreated(null)} className="self-start text-xs text-indigo-600 hover:underline mt-1">
                + Yana qo&apos;shish
              </button>
            </div>
          ) : (
            <form onSubmit={addTrainer} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism familiya" required className={inputCls} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" required className={inputCls} />
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol (kamida 6 belgi)" required minLength={6} className={inputCls} />
                <select value={plan} onChange={(e) => setPlan(e.target.value as Plan)} className={inputCls}>
                  <option value="FREE">FREE — Bepul</option>
                  <option value="BASIC">BASIC — Asosiy</option>
                  <option value="PRO">PRO</option>
                </select>
                <input
                  value={referral}
                  onChange={(e) => setReferral(e.target.value)}
                  placeholder="Promo-kod / kim tavsiya qildi (ixtiyoriy)"
                  className={`${inputCls} sm:col-span-2`}
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="self-start h-9 px-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Ochilmoqda..." : "Akkaunt ochish"}
              </button>
            </form>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-400">
          {q ? "Hech narsa topilmadi" : "Hozircha o'qituvchilar yo'q"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="font-medium px-5 py-3">O&apos;qituvchi</th>
                <th className="font-medium px-3 py-3 text-center">Tarif</th>
                <th className="font-medium px-3 py-3 text-center">O&apos;quvchi</th>
                <th className="font-medium px-3 py-3 text-center">Faol</th>
                <th className="font-medium px-3 py-3 text-right">Bu oy</th>
                <th className="font-medium px-3 py-3 text-right">Qo&apos;shilgan</th>
                <th className="font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <Fragment key={t.id}>
                  <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800 truncate max-w-[180px]">{t.name ?? "—"}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[180px]">
                        {t.phone ? formatPhone(t.phone) : "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <select
                        value={t.plan}
                        disabled={savingPlan === t.id}
                        onChange={(e) => changePlan(t.id, e.target.value as Plan)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${PLAN_BADGE[t.plan]} ${savingPlan === t.id ? "opacity-50" : ""}`}
                      >
                        <option value="FREE">FREE</option>
                        <option value="BASIC">BASIC</option>
                        <option value="PRO">PRO</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-600">{t.students}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{t.active}</td>
                    <td className="px-3 py-3 text-right text-slate-600 whitespace-nowrap">{fmtMoney(t.collected)}</td>
                    <td className="px-3 py-3 text-right text-slate-400 whitespace-nowrap text-xs">{t.joined}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => (editId === t.id ? setEditId(null) : openEdit(t))}
                        title="Tahrirlash"
                        className="size-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors mr-1"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTrainer(t.id, t.name ?? t.phone ?? "trener")}
                        disabled={deleting === t.id}
                        title="O'chirish"
                        className="size-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === t.id ? (
                          <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>

                  {editId === t.id && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={7} className="px-5 py-4">
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ism familiya" className={inputCls} />
                            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+998 90 123 45 67" className={inputCls} />
                            <input value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Yangi parol (ixtiyoriy)" className={inputCls} />
                            <input value={editReferral} onChange={(e) => setEditReferral(e.target.value)} placeholder="Promo-kod / referral" className={`${inputCls} sm:col-span-3`} />
                          </div>
                          {editError && <p className="text-xs text-red-500">{editError}</p>}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveEdit(t.id)}
                              disabled={savingEdit}
                              className="h-9 px-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-medium disabled:opacity-50"
                            >
                              {savingEdit ? "Saqlanmoqda..." : "Saqlash"}
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="h-9 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-100"
                            >
                              Bekor
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
