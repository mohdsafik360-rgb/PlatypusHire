"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SectionAccordion — a collapsible card with an icon, label, optional badge count,
 * and content area. Matches Teal's sidebar section behavior.
 * Uses framer-motion for smooth height-animated expand/collapse.
 */
export function SectionAccordion({
  icon: Icon,
  label,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  label: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(defaultOpen ? "auto" : 0);

  // Measure content height when open state changes
  useEffect(() => {
    if (open) {
      const el = contentRef.current;
      if (el) {
        const h = el.scrollHeight;
        setHeight(h);
        // After animation completes, switch to auto for dynamic content
        const timer = setTimeout(() => setHeight("auto"), 250);
        return () => clearTimeout(timer);
      }
    } else {
      // Before closing, read current height for animation start point
      const el = contentRef.current;
      if (el) {
        setHeight(el.scrollHeight);
        // Then collapse to 0 on next frame
        requestAnimationFrame(() => setHeight(0));
      } else {
        setHeight(0);
      }
    }
  }, [open]);

  return (
    <div className="group">
      {/* ─── Trigger ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
          "bg-white border border-border hover:border-muted-foreground/30",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "shadow-sm",
          open && "border-l-2 border-l-primary/60 border-t-primary/20 border-r-primary/20 border-b-primary/20"
        )}
      >
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-200",
            "bg-muted/60 text-muted-foreground",
            open && "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-3.5" strokeWidth={1.5} />
        </div>
        <span className="flex-1 text-left">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium transition-colors duration-150",
              "bg-muted text-muted-foreground",
              open && "bg-primary/10 text-primary"
            )}
          >
            {badge}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground/70 transition-transform duration-300",
            open && "rotate-180"
          )}
          strokeWidth={1.5}
        />
      </button>

      {/* ─── Animated Content ─────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div ref={contentRef} className="pt-1.5 pb-1 space-y-1.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
