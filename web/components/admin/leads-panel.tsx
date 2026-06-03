"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhone } from "@/lib/phone";

export interface LeadRow {
  id: number;
  name: string;
  phone: string;
  sport: string | null;
  message: string | null;
  source: string;
  status: string;
  referral: string | null;
  note: string | null;
  trainerId: string | null;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  NEW: { label: "🆕 Yangi", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  CONTACTED: { label: "📞 Bog'lanildi", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  VERIFIED: { label: "✅ Tekshirildi", cls: "bg-violet-50 text-violet-700 border-violet-200" },
  CONVERTED: { label: "🎓 Akkaunt ochildi", cls: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { label: "❌ Rad etildi", cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

const SOURCE_LABEL: Record<string, string> = {
  WEB: "🌐 Web",
  BOT: "🤖 Bot",
  INSTAGRAM: "📸 Instagram",
  TELEGRAM: "✈️ Telegram",
  REFERRAL: "🎟 Referal",
  MANUAL: "✍️ Qo'lda",
};

const STATUS_ORDER = ["NEW", "CONTACTED", "VERIFIED", "CONVERTED", "REJECTED"] as const;
const PLANS = ["FREE", "BASIC", "PRO"] as const;

const inputCls =
  "h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-indigo-400 w-full";

function relTime(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "hozir";
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

export function LeadsPanel({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [busy, setBusy] = useState<number | null>(null);
  const [convertId, setConvertId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: leads.length };
    for (const s of STATUS_ORDER) c[s] = 0;
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const openCount = (counts.NEW ?? 0) + (counts.CONTACTED ?? 0) + (counts.VERIFIED ?? 0);
  const conversion = leads.length > 0 ? Math.round(((counts.CONVERTED ?? 0) / leads.length) * 100) : 0;

  const shown = filter === "ALL" ? leads : leads.filter((l) => l.status === filter);

  async function setStatus(id: number, status: string) {
    setBusy(id);
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  }

  async function saveNote(id: number, note: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    router.refresh();
  }

  async function remove(id: number) {
    if (!confirm("Bu arizani o'chirasizmi?")) return;
    setBusy(id);
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60">
      {/* Header + funnel */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-slate-900">📥 Arizalar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ochiq: <b className="text-slate-700">{openCount}</b> · Konversiya:{" "}
            <b className="text-slate-700">{conversion}%</b> · Jami {leads.length}
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="h-9 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          {showAdd ? "Bekor" : "+ Ariza qo'shish"}
        </button>
      </div>

      {showAdd && <AddLeadForm onDone={() => { setShowAdd(false); router.refresh(); }} />}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(["ALL", ...STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
              filter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}
          >
            {s === "ALL" ? "Hammasi" : STATUS_META[s].label} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">Ariza yo'q</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {shown.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              busy={busy === lead.id}
              converting={convertId === lead.id}
              onConvert={() => setConvertId(convertId === lead.id ? null : lead.id)}
              onStatus={(s) => setStatus(lead.id, s)}
              onNote={(n) => saveNote(lead.id, n)}
              onRemove={() => remove(lead.id)}
              onConverted={() => { setConvertId(null); router.refresh(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadCard({
  lead,
  busy,
  converting,
  onConvert,
  onStatus,
  onNote,
  onRemove,
  onConverted,
}: {
  lead: LeadRow;
  busy: boolean;
  converting: boolean;
  onConvert: () => void;
  onStatus: (s: string) => void;
  onNote: (n: string) => void;
  onRemove: () => void;
  onConverted: () => void;
}) {
  const [note, setNote] = useState(lead.note ?? "");
  const st = STATUS_META[lead.status] ?? STATUS_META.NEW;
  const done = lead.status === "CONVERTED" || lead.status === "REJECTED";

  return (
    <div className="rounded-2xl border border-slate-200/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{lead.name}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
            <span className="text-[11px] text-slate-400">{SOURCE_LABEL[lead.source] ?? lead.source}</span>
          </div>
          <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <a href={`tel:${lead.phone}`} className="hover:text-indigo-600 font-medium">{formatPhone(lead.phone)}</a>
            {lead.sport && <span>🏷 {lead.sport}</span>}
            {lead.referral && <span>🎟 {lead.referral}</span>}
            <span className="text-slate-400">{relTime(lead.createdAt)}</span>
          </div>
          {lead.message && <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg px-3 py-2">{lead.message}</p>}
        </div>
      </div>

      {/* Actions */}
      {!done && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {lead.status === "NEW" && (
            <ActionBtn disabled={busy} onClick={() => onStatus("CONTACTED")}>📞 Bog'landim</ActionBtn>
          )}
          {(lead.status === "NEW" || lead.status === "CONTACTED") && (
            <ActionBtn disabled={busy} onClick={() => onStatus("VERIFIED")}>✅ Tekshirildi</ActionBtn>
          )}
          <ActionBtn primary disabled={busy} onClick={onConvert}>🎓 Akkaunt ochish</ActionBtn>
          <ActionBtn disabled={busy} onClick={() => onStatus("REJECTED")}>❌ Rad etish</ActionBtn>
        </div>
      )}

      {converting && <ConvertForm lead={lead} onDone={onConverted} />}

      {/* Note */}
      <div className="flex items-center gap-2 mt-3">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => note !== (lead.note ?? "") && onNote(note)}
          placeholder="Izoh (ichki)…"
          className="flex-1 h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-indigo-400"
        />
        <button onClick={onRemove} disabled={busy} className="text-xs text-slate-400 hover:text-red-500 px-2 py-1">
          O'chirish
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
        primary ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function ConvertForm({ lead, onDone }: { lead: LeadRow; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<string>("FREE");
  const [trial, setTrial] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ phone: string; password: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/trainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        password,
        plan,
        referral: lead.referral ?? "",
        trialMonths: Number(trial),
        leadId: lead.id,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Xatolik");
      return;
    }
    setCreated({ phone: formatPhone(lead.phone), password });
  }

  if (created) {
    return (
      <div className="mt-3 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
        <div className="font-semibold mb-1">✅ Akkaunt ochildi — ma'lumotlarni trenerga yuboring:</div>
        <div>Telefon: <b>{created.phone}</b></div>
        <div>Parol: <b>{created.password}</b></div>
        <button onClick={onDone} className="mt-2 text-xs font-medium text-green-700 underline">Yopish</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 flex flex-col gap-2">
      <div className="text-xs text-slate-500">
        <b>{lead.name}</b> · {formatPhone(lead.phone)} uchun akkaunt
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parol (kamida 6 belgi)"
          required
          minLength={6}
          className={inputCls}
        />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputCls}>
          {PLANS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {plan !== "FREE" && (
          <select value={trial} onChange={(e) => setTrial(e.target.value)} className={inputCls}>
            <option value="0">Promo yo'q</option>
            {[1, 2, 3, 6, 12].map((m) => (
              <option key={m} value={m}>{m} oy bepul (promo)</option>
            ))}
          </select>
        )}
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={saving}
        className="h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Ochilmoqda…" : "Akkauntni ochish"}
      </button>
    </form>
  );
}

function AddLeadForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sport, setSport] = useState("");
  const [source, setSource] = useState("INSTAGRAM");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, sport, source, message }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Xatolik");
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="mb-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 grid sm:grid-cols-2 gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism familiya" required className={inputCls} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" required className={inputCls} />
      <input value={sport} onChange={(e) => setSport(e.target.value)} placeholder="Sport turi (ixtiyoriy)" className={inputCls} />
      <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
        <option value="INSTAGRAM">📸 Instagram</option>
        <option value="TELEGRAM">✈️ Telegram</option>
        <option value="REFERRAL">🎟 Referal</option>
        <option value="MANUAL">✍️ Boshqa</option>
      </select>
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Izoh (ixtiyoriy)" className={`${inputCls} sm:col-span-2`} />
      {error && <div className="text-xs text-red-600 sm:col-span-2">{error}</div>}
      <button type="submit" disabled={saving} className="h-10 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 sm:col-span-2">
        {saving ? "Saqlanmoqda…" : "Ariza qo'shish"}
      </button>
    </form>
  );
}
