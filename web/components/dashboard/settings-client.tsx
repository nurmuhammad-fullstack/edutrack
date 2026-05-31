"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtMoney, initials, avatarColor } from "@/lib/utils";
import { InviteCard } from "@/components/dashboard/invite-card";
import { planLimits, nextPlanFor, PLAN_PRICE } from "@/lib/plan";
import { useT } from "@/components/i18n-provider";
import type { Trainer, Group, Plan } from "@/types";

const PLAN_COLORS = {
  FREE: "bg-muted text-muted-foreground",
  BASIC: "bg-blue-50 text-blue-700",
  PRO: "bg-amber-50 text-amber-700",
};

const BOT_LINK = "https://t.me/study_track_uz_bot";

interface Props {
  trainer: Trainer | null;
  groups: Group[];
  inviteLink: string;
  inviteQr: string;
  activeStudents: number;
}

function limitText(n: number) {
  return Number.isFinite(n) ? String(n) : "∞";
}

export function SettingsClient({ trainer, groups: initialGroups, inviteLink, inviteQr, activeStudents }: Props) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupFee, setNewGroupFee] = useState("");
  const [newGroupDays, setNewGroupDays] = useState<number[]>([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [attendanceOn, setAttendanceOn] = useState(trainer?.attendanceEnabled ?? true);

  async function toggleAttendance() {
    const next = !attendanceOn;
    setAttendanceOn(next);
    await fetch("/api/trainer/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendanceEnabled: next }),
    });
    router.refresh();
  }

  const t = useT();
  const trainerInitials = initials(trainer?.name ?? trainer?.email ?? "T");
  const trainerName = trainer?.name ?? trainer?.email ?? "Trener";
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME ?? "study_track_uz_bot";

  async function handleAddGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupFee) return;
    setAddingGroup(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim(), monthlyFee: Number(newGroupFee), lessonDays: newGroupDays }),
    });
    if (res.ok) {
      const group = await res.json();
      setGroups((prev) => [...prev, group]);
      setNewGroupName("");
      setNewGroupFee("");
      setNewGroupDays([]);
      setShowAddGroup(false);
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? t.errorOccurred);
    }
    setAddingGroup(false);
  }

  async function handleDeleteGroup(id: number) {
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
      router.refresh();
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
        <div
          className={`size-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${avatarColor(
            trainer?.id.charCodeAt(0) ?? 0
          )}`}
        >
          {trainerInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground truncate">{trainerName}</div>
          {trainer?.email && trainer.name && (
            <div className="text-xs text-muted-foreground truncate">{trainer.email}</div>
          )}
          <span
            className={`inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              PLAN_COLORS[trainer?.plan ?? "FREE"]
            }`}
          >
            {t.planLabels[trainer?.plan ?? "FREE"]} {t.planWord}
          </span>
        </div>
      </div>

      {/* Invite students */}
      <InviteCard link={inviteLink} qrDataUrl={inviteQr} />

      {/* Add students via bot */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.95 4.27 18.6 19.94c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.43 2.34c-.27.27-.5.5-1 .5l.36-5.1L17.9 6.1c.4-.36-.1-.56-.62-.2L6.6 13.06l-4.97-1.56c-1.08-.34-1.1-1.08.23-1.6L20.55 2.7c.9-.34 1.68.2 1.4 1.57Z" />
          </svg>
          <span className="font-medium text-sm text-foreground">{t.botAddTitle}</span>
        </div>

        {trainer?.telegramId ? (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.botConnected}</p>
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start text-xs font-medium text-primary hover:underline"
            >
              {t.openBot}
            </a>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">{t.botConnectSub}</p>
            <a
              href={`https://t.me/${botUsername}?start=trainer_${trainer?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#2AABEE] text-white text-sm font-medium hover:bg-[#1d9bd9] transition-colors"
            >
              {t.connectTelegram}
            </a>
          </>
        )}
      </div>

      {/* Groups section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-medium text-sm text-foreground">{t.groups}</span>
          <button
            onClick={() => setShowAddGroup((v) => !v)}
            className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-colors hover:bg-primary/20"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {showAddGroup && (
          <form onSubmit={handleAddGroup} className="px-4 py-3 border-b border-border bg-muted/30 flex flex-col gap-2">
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder={t.groupNamePh}
              className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary/50"
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">{t.lessonDaysSub}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setNewGroupDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
                    }
                    className={`flex-1 h-8 rounded-lg text-[11px] font-medium transition-colors ${
                      newGroupDays.includes(d)
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border text-muted-foreground"
                    }`}
                  >
                    {t.weekdaysShort[d]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={newGroupFee}
                onChange={(e) => setNewGroupFee(e.target.value)}
                placeholder={t.monthlyFeePh}
                className="flex-1 text-sm bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={addingGroup || !newGroupName.trim() || !newGroupFee}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl disabled:opacity-50 transition-opacity"
              >
                {addingGroup ? "..." : t.add}
              </button>
            </div>
          </form>
        )}

        {groups.length === 0 && !showAddGroup ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            {t.noGroupsYet}
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{group.name}</div>
                  <div className="text-xs text-muted-foreground">{fmtMoney(group.monthlyFee)} / oy</div>
                </div>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="size-7 rounded-full text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage meter + plan */}
      {(() => {
        const plan: Plan = trainer?.plan ?? "FREE";
        const limits = planLimits(plan);
        const sFinite = Number.isFinite(limits.maxStudents);
        const gFinite = Number.isFinite(limits.maxGroups);
        const sPct = sFinite ? Math.min((activeStudents / limits.maxStudents) * 100, 100) : 0;
        const gPct = gFinite ? Math.min((groups.length / limits.maxGroups) * 100, 100) : 0;
        const atStudent = sFinite && activeStudents >= limits.maxStudents;
        const nearStudent = sFinite && activeStudents / limits.maxStudents >= 0.8;
        return (
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-foreground">{t.yourPlan}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLORS[plan]}`}>
                {t.planLabels[plan]}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t.students}</span>
                <span className={`font-medium ${atStudent ? "text-destructive" : "text-foreground"}`}>
                  {activeStudents} / {limitText(limits.maxStudents)}
                </span>
              </div>
              {sFinite && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${atStudent ? "bg-destructive" : nearStudent ? "bg-orange-500" : "bg-primary"}`}
                    style={{ width: `${sPct}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t.groups}</span>
                <span className="font-medium text-foreground">
                  {groups.length} / {limitText(limits.maxGroups)}
                </span>
              </div>
              {gFinite && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${gPct}%` }} />
                </div>
              )}
            </div>

            {(nearStudent || atStudent) && plan !== "PRO" && (
              <div className="text-xs text-orange-700 bg-orange-50 rounded-xl px-3 py-2">
                {atStudent
                  ? `${t.limitFull} ${t.planLabels[nextPlanFor(plan)]} ${t.upgradeToInfo}`
                  : `${t.limitNear} ${t.planLabels[nextPlanFor(plan)]}`}
              </div>
            )}
          </div>
        );
      })()}

      {/* Plan comparison / upgrade */}
      {(trainer?.plan ?? "FREE") !== "PRO" ? (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <div className="font-semibold text-foreground">{t.planUpgradeTitle}</div>
            <div className="text-sm text-muted-foreground">{t.planUpgradeSub}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="text-sm font-semibold text-foreground">{t.planLabels.BASIC}</div>
              <div className="font-bold text-foreground">{fmtMoney(PLAN_PRICE.BASIC)}<span className="text-xs font-normal text-muted-foreground">{t.perMonth}</span></div>
              <div className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{t.basicMini}</div>
            </div>
            <div className="bg-card border border-amber-200 rounded-xl p-3 relative">
              <span className="absolute -top-2 right-2 text-[9px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full">TOP</span>
              <div className="text-sm font-semibold text-foreground">{t.planLabels.PRO}</div>
              <div className="font-bold text-foreground">{fmtMoney(PLAN_PRICE.PRO)}<span className="text-xs font-normal text-muted-foreground">{t.perMonth}</span></div>
              <div className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{t.proMini}</div>
            </div>
          </div>
          <a
            href={BOT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center"
          >
            {t.upgradeCta}
          </a>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="font-semibold text-foreground text-sm">{t.proActive}</div>
            <div className="text-xs text-muted-foreground">{t.proActiveSub}</div>
          </div>
        </div>
      )}

      {/* Attendance toggle (PRO only) */}
      {trainer?.plan === "PRO" && (
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-sm text-foreground">{t.attendanceToggle}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t.attendanceToggleSub}</div>
          </div>
          <button
            onClick={toggleAttendance}
            role="switch"
            aria-checked={attendanceOn}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              attendanceOn ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block size-4 transform rounded-full bg-white shadow transition-transform ${
                attendanceOn ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full py-3 rounded-2xl border border-destructive/30 text-destructive font-medium text-sm flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors disabled:opacity-50"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        {loggingOut ? t.loggingOut : t.logout}
      </button>
    </div>
  );
}
