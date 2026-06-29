"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { TopNav } from "@/components/layout/TopNav";
import { ResumeBuilderLayout } from "@/components/layout/ResumeBuilderLayout";

/**
 * /builder — the main resume editor.
 * Wrapped in a framer-motion page transition (fade + slide up).
 */
export default function BuilderPage() {
  const resumeRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex min-h-screen flex-col"
    >
      <TopNav contentRef={resumeRef} />
      <main className="flex-1">
        <ResumeBuilderLayout resumeRef={resumeRef} />
      </main>
    </motion.div>
  );
}
