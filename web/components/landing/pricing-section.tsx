"use client";

import { useState } from "react";
import { fmtMoney } from "@/lib/utils";

type PlanMeta = {
  monthly: number;
  yearly: number;
  primary: boolean;
  feats: Record<string, boolean>;
};

type PlanText = { name: string; students: string; groups: string };

type Dict = {
  pricingTitle: string;
  pricingSub: string;
  popular: string;
  free: string;
  perMonth: string;
  choose: string;
  billMonthly: string;
  billYearly: string;
  billYearlyBadge: string;
  billedYearly: string; // contains {x}
  billSave: string; // contains {n}
  plans: readonly PlanText[];
  feat: Record<string, string>;
};

export function PricingSection({
  dict,
  plans,
  featKeys,
  applyHref,
}: {
  dict: Dict;
  plans: readonly PlanMeta[];
  featKeys: readonly string[];
  applyHref: string;
}) {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="bg-card border-y border-border px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-foreground mb-2">{dict.pricingTitle}</h2>
        <p className="text-center text-muted-foreground text-sm mb-6">{dict.pricingSub}</p>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !yearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {dict.billMonthly}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                yearly ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {dict.billYearly}
              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {dict.billYearlyBadge}
              </span>
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 items-start">
          {plans.map((plan, i) => {
            const meta = dict.plans[i];
            const isFree = plan.monthly === 0;
            // Yearly billing shown as the equivalent per-month figure (the marketing hook).
            const perMonthYearly = Math.round(plan.yearly / 12);
            const displayed = yearly ? perMonthYearly : plan.monthly;
            const savePct =
              plan.monthly > 0 ? Math.round((1 - plan.yearly / (plan.monthly * 12)) * 100) : 0;

            return (
              <div
                key={meta.name}
                className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                  plan.primary
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 relative"
                    : "border-border bg-background"
                }`}
              >
                {plan.primary && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                    {dict.popular}
                  </span>
                )}
                <div>
                  <div className="font-semibold text-foreground">{meta.name}</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {isFree ? dict.free : fmtMoney(displayed)}
                    {!isFree && (
                      <span className="text-sm font-normal text-muted-foreground">{dict.perMonth}</span>
                    )}
                  </div>
                  {/* Subline: yearly → total + savings; monthly → spacer keeps cards aligned */}
                  {!isFree && yearly ? (
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs text-muted-foreground">
                        {dict.billedYearly.replace("{x}", fmtMoney(plan.yearly))}
                      </span>
                      {savePct > 0 && (
                        <span className="text-xs font-semibold text-green-600">
                          {dict.billSave.replace("{n}", String(savePct))}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 h-4" />
                  )}
                </div>

                <ul className="flex flex-col gap-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <span className="text-green-600 shrink-0">✓</span> {meta.students}
                  </li>
                  <li className="flex items-center gap-2 text-foreground font-medium">
                    <span className="text-green-600 shrink-0">✓</span> {meta.groups}
                  </li>
                  {featKeys.map((key) => {
                    const has = plan.feats[key];
                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-2 ${has ? "text-muted-foreground" : "text-slate-400"}`}
                      >
                        <span className={`shrink-0 font-bold ${has ? "text-green-600" : "text-red-500"}`}>
                          {has ? "✓" : "✕"}
                        </span>
                        {dict.feat[key]}
                      </li>
                    );
                  })}
                </ul>

                <a
                  href={applyHref}
                  className={`mt-auto h-10 rounded-xl font-medium text-sm flex items-center justify-center transition-colors ${
                    plan.primary
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {dict.choose}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
