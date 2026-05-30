"use client";

import { motion, MotionConfig } from "motion/react";

// template.tsx remounts on every navigation within /dashboard, so this entrance
// animation plays on each tab switch — giving smooth, app-like transitions.
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
