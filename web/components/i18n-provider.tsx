"use client";

import { createContext, useContext } from "react";
import { dashboard, type Locale, type DashboardDict } from "@/lib/i18n";

const I18nContext = createContext<DashboardDict>(dashboard.uz);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={dashboard[locale]}>{children}</I18nContext.Provider>;
}

/** Translation dictionary for dashboard client components. */
export function useT(): DashboardDict {
  return useContext(I18nContext);
}
