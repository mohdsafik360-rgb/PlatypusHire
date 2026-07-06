"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import { ShieldCheck, FileText, GripVertical, ArrowRight } from "lucide-react";

import { PlatypusLogo } from "@/components/layout/PlatypusLogo";

// ── Feature card with 3-D tilt ────────────────────────────────────────────────

const features = [
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description:
      "Everything stays in your browser. Zero uploads, zero servers, zero tracking. Your data never leaves your device.",
  },
  {
    icon: FileText,
    title: "ATS Optimized",
    description:
      "Semantic HTML, proper heading hierarchy, and clean text export. Your resume passes every Applicant Tracking System.",
  },
  {
    icon: GripVertical,
    title: "Drag-and-Drop Editor",
    description:
      "Reorder sections, toggle bullet points, and preview changes in real-time. Intuitive, fast, and frustration-free.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: (typeof features)[0] & { index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-60, 60], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-60, 60], [-8, 8]), { stiffness: 300, damping: 30 });
  const glareX = useTransform(x, [-60, 60], [0, 100]);
  const glareY = useTransform(y, [-60, 60], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18) 0%, transparent 70%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "36px 28px",
          textAlign: "center",
          background: "#fff",
          position: "relative",
          overflow: "hidden",
          cursor: "default",
        }}
        whileHover={{ boxShadow: "0 12px 40px rgba(0,0,0,0.09)" }}
        transition={{ duration: 0.25 }}
      >
        {/* Glare overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: glare,
            pointerEvents: "none",
            borderRadius: 16,
          }}
        />

        {/* Icon */}
        <motion.div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
          whileHover={{ scale: 1.08, borderColor: "#0a0a0a" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Icon size={20} color="#374151" strokeWidth={1.7} />
        </motion.div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0a0a0a", margin: "0 0 10px", position: "relative" }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, margin: 0, position: "relative" }}>
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Animated headline — word-by-word ─────────────────────────────────────────

function AnimatedHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.h1
      style={{
        fontSize: "clamp(2.4rem, 6vw, 4rem)",
        fontWeight: 800,
        letterSpacing: "-0.04em",
        lineHeight: 1.1,
        color: "#0a0a0a",
        maxWidth: 680,
        margin: "0 0 20px",
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", marginRight: "0.25em" }}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.55,
            delay: 0.3 + i * 0.07,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

// ── Scroll-linked parallax wrapper ────────────────────────────────────────────

function ParallaxSection({ children, offset = 40 }: { children: React.ReactNode; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <div ref={ref}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

export default function OriginalLandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Scroll progress bar */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "#0a0a0a",
          scaleX,
          transformOrigin: "0%",
          zIndex: 100,
        }}
      />

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          borderBottom: "1px solid #e5e7eb",
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "#fff",
          zIndex: 50,
        }}
      >
        <PlatypusLogo />
        <motion.a
          href="/builder"
          whileHover={{ scale: 1.03, borderColor: "#0a0a0a" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid #d1d5db",
            borderRadius: 10,
            padding: "8px 18px",
            fontSize: 14,
            fontWeight: 600,
            color: "#0a0a0a",
            textDecoration: "none",
            background: "#fff",
          }}
        >
          Open Builder
          <motion.span
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            style={{ display: "flex" }}
          >
            <ArrowRight size={14} strokeWidth={2} />
          </motion.span>
        </motion.a>
      </motion.header>

      <main style={{ flex: 1 }}>
        {/* ── Hero ── */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "80px 24px 96px",
          }}
        >

          {/* Word-by-word headline */}
          <AnimatedHeadline text="Build an ATS-Friendly Resume in Minutes." />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            style={{ fontSize: 16, color: "#6b7280", margin: "0 0 36px", maxWidth: 480 }}
          >
            100% private. Serverless.
          </motion.p>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.05, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ marginBottom: 16 }}
          >
            <motion.a
              href="/builder"
              whileHover={{ scale: 1.04, opacity: 0.9 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0a0a0a",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: 9999,
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Start Building
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                style={{ display: "flex" }}
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </motion.span>
            </motion.a>
          </motion.div>

          {/* Caption */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}
          >
            No sign-up required. Your data stays in your browser.
          </motion.p>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: "0 24px 96px" }}>
          <ParallaxSection offset={24}>
            <div
              style={{
                maxWidth: 1000,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {features.map((f, i) => (
                <FeatureCard key={f.title} {...f} index={i} />
              ))}
            </div>
          </ParallaxSection>
        </section>

        {/* ── CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: "center", padding: "80px 24px 96px" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: "#0a0a0a",
              margin: "0 0 16px",
            }}
          >
            Ready to build your resume?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: 16, color: "#6b7280", margin: "0 0 36px" }}
          >
            It takes less than 5 minutes to get started.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 280, damping: 22 }}
          >
            <motion.a
              href="/builder"
              whileHover={{ scale: 1.05, opacity: 0.9 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0a0a0a",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: 9999,
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Start Building — Free
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                style={{ display: "flex" }}
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </motion.span>
            </motion.a>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          borderTop: "1px solid #e5e7eb",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ opacity: 0.45 }}>
          <PlatypusLogo />
        </div>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          PlatypusHire — 100% client-side, forever free.
        </p>
      </motion.footer>
    </div>
  );
}
