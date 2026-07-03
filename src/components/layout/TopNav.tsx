"use client";

import { useEffect, useState, type RefObject } from "react";
import Link from "next/link";
import { PlatypusLogo } from "./PlatypusLogo";
import { ATSScoreIndicator } from "./ATSScoreIndicator";
import { Button } from "@/components/ui/button";
import { Download, Loader2, RotateCcw } from "lucide-react";
import { useResumeStore } from "@/stores/useResumeStore";
import { cn } from "@/lib/utils";

interface TopNavProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

export function TopNav({ contentRef }: TopNavProps) {
  const [pending, setPending] = useState(false);
  const resetResume = useResumeStore((s) => s.resetResume);

  const handleResetResume = () => {
    const confirmed = window.confirm(
      "Reset your resume? This will clear all saved resume data from this browser."
    );
    if (!confirmed) return;
    resetResume();
  };

  const handleDownloadPdf = async () => {
    const node = contentRef.current;
    if (!node || pending) return;

    setPending(true);

    // Snapshot all inline styles we'll temporarily override
    const saved = {
      transform: node.style.transform,
      marginBottom: node.style.marginBottom,
      marginRight: node.style.marginRight,
      width: node.style.width,
      height: node.style.height,
    };

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Strip any CSS transform + explicit dimensions so html2canvas captures
      // the element at its natural A4 pixel size, not the scaled-to-fit preview.
      node.style.transform = "none";
      node.style.marginBottom = "0";
      node.style.marginRight = "0";
      node.style.width = "";
      node.style.height = "";

      // Two rAFs: first lets the style mutation flush, second waits for the
      // browser to finish the resulting layout pass before we measure.
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      const W = node.scrollWidth;
      const H = node.scrollHeight;
      const PIXEL_RATIO = Math.min(3, window.devicePixelRatio || 2);

      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale: PIXEL_RATIO,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: W,
        height: H,
        windowWidth: W,
        windowHeight: H,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDocument) => {
          prepareHtml2CanvasClone(clonedDocument);
        },
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      // Fit the captured image to exactly one A4 page (210 × 297 mm)
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      addPdfLinkAnnotations(pdf, node);
      pdf.save(`${safeFileName(documentTitleFromResume(node))}.pdf`);
    } catch (error) {
      // Surface the real error in the console so it's debuggable.
      // Do NOT fall back to window.print() — that opens the system print
      // dialog, which is confusing and looks like a bug to the user.
      console.error("PDF generation failed:", error);
      alert("Could not generate the PDF. Please try again or check the console for details.");
    } finally {
      // Always restore original styles
      node.style.transform = saved.transform;
      node.style.marginBottom = saved.marginBottom;
      node.style.marginRight = saved.marginRight;
      node.style.width = saved.width;
      node.style.height = saved.height;
      setPending(false);
    }
  };

  return (
    <header
      data-no-print
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6"
    >
      <Link href="/" className="flex items-center gap-2">
        <PlatypusLogo className="h-7 w-auto" />
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <FitStatusIndicator />
        <ATSScoreIndicator />
        <Button
          size="sm"
          className="gap-2 bg-black text-white hover:bg-neutral-800 hover:text-white"
          onClick={handleResetResume}
          title="Reset resume"
        >
          <RotateCcw className="size-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPdf} disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" strokeWidth={1.5} />}
          <span className="hidden sm:inline">{pending ? "Preparing…" : "Download PDF"}</span>
        </Button>
      </div>
    </header>
  );
}

type FitStatus = "spacious" | "balanced" | "dense" | "critical" | "overflow";

function FitStatusIndicator() {
  const [status, setStatus] = useState<FitStatus>("balanced");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ status?: FitStatus; scale?: number }>).detail;
      if (detail?.status) setStatus(detail.status);
      if (typeof detail?.scale === "number") setScale(detail.scale);
    };
    window.addEventListener("platypushire:resume-fit", handler);
    return () => window.removeEventListener("platypushire:resume-fit", handler);
  }, []);

  const label = status === "spacious"
    ? "Spacious"
    : status === "dense"
      ? "Dense"
      : status === "critical"
        ? "Tiny text"
        : status === "overflow"
          ? "Overflow"
          : "Fit OK";

  const detail = status === "dense" || status === "critical"
    ? `${Math.round(scale * 100)}% scale`
    : "One page";

  return (
    <div
      className="hidden md:flex items-center gap-2 cursor-default select-none"
      title={status === "critical" ? "Resume is being heavily compressed. Hide bullets or use compact spacing." : "One-page fit status"}
    >
      <span
        className={cn(
          "size-2.5 rounded-full",
          status === "critical" || status === "overflow" ? "bg-red-400" : status === "dense" ? "bg-amber-400" : "bg-emerald-500"
        )}
      />
      <div className="hidden xl:flex flex-col">
        <span className="text-xs font-medium leading-tight text-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground leading-tight">{detail}</span>
      </div>
    </div>
  );
}

/**
 * html2canvas 1.4.x cannot parse modern CSS color functions such as
 * oklch()/lab(). Tailwind v4 may expose those through generated CSS even
 * when the resume itself is mostly grayscale. During PDF export, sanitize
 * the cloned document before html2canvas reads computed styles:
 * 1. remove global stylesheets that can contain unsupported color functions;
 * 2. inject a small print-safe stylesheet for the resume subtree only;
 * 3. force inline hex/RGB colors on the cloned resume nodes.
 */
function prepareHtml2CanvasClone(clonedDocument: Document) {
  clonedDocument
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((element) => element.remove());

  // Remove ALL SVG elements from the cloned DOM.
  // html2canvas 1.4.x parses computed styles on every node—including hidden
  // ones—and crashes on modern CSS color functions (oklch, lab, lch) that
  // Tailwind v4 may apply via utility classes like fill-emerald-700.
  // Physically removing SVGs prevents the parser from ever encountering them.
  clonedDocument.querySelectorAll("svg").forEach((svg) => svg.remove());

  const style = clonedDocument.createElement("style");
  style.textContent = HTML2CANVAS_SAFE_RESUME_CSS;
  clonedDocument.head.appendChild(style);

  const clonedNode = clonedDocument.getElementById("resume-print-root");
  if (clonedNode instanceof HTMLElement) {
    applyHtml2CanvasSafeResumeColors(clonedNode);
  }
}

const HTML2CANVAS_SAFE_RESUME_CSS = `
  html, body { margin: 0; padding: 0; background: #ffffff; color: #111827; }
  #resume-print-root,
  .a4-scaling-wrapper {
    width: 630px !important;
    height: 891px !important;
    min-height: 891px !important;
    max-height: 891px !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
    transform-origin: top left !important;
    overflow: hidden !important;
    background: #ffffff !important;
    border: 0 !important;
    box-shadow: none !important;
  }
  .resume-page {
    --resume-fit-scale: 1;
    --resume-density: 1;
    width: 630px !important;
    height: 891px !important;
    overflow: hidden !important;
    position: relative !important;
    background: #ffffff !important;
    color: #374151 !important;
    font-family: Inter, Segoe UI, Arial, sans-serif !important;
    font-size: 11px !important;
    line-height: 1.45 !important;
  }
  .resume-content-fitter {
    transform: scale(var(--resume-fit-scale)) !important;
    transform-origin: top left !important;
    width: calc(100% / var(--resume-fit-scale)) !important;
    min-height: calc(100% / var(--resume-fit-scale)) !important;
  }
  .resume-header { padding: 40px 40px 0 40px !important; }
  .resume-header-grid { display: grid !important; grid-template-columns: minmax(0, 1fr) !important; align-items: start !important; gap: 16px !important; }
  .resume-header-grid--with-photo { grid-template-columns: minmax(0, 1fr) 105px !important; }
  .resume-header-content { min-width: 0 !important; overflow-wrap: anywhere !important; }
  .resume-photo { justify-self: end !important; width: 105px !important; min-width: 105px !important; max-width: 105px !important; }
  .resume-photo img { display: block !important; width: 105px; height: 135px; max-width: 100%; object-fit: cover; border: 1px solid #e5e7eb; border-radius: 4px; }
  section { padding-left: 40px !important; padding-right: 40px !important; padding-top: calc(20px * var(--resume-density)) !important; }
  h1 { margin: 0 !important; color: #111827 !important; font-size: 22px !important; line-height: 1.15 !important; font-weight: 700 !important; letter-spacing: -0.025em !important; overflow-wrap: anywhere !important; }
  h2.resume-section-title { margin: 0 !important; padding-bottom: 4px !important; border-bottom: 1.5px solid #e5e7eb !important; color: #111827 !important; font-size: 11px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; }
  h3 { margin: 0 !important; color: #111827 !important; font-size: 12px !important; line-height: 1.25 !important; font-weight: 600 !important; }
  p { margin: 0 !important; color: #4b5563 !important; }
  ul { margin: 0 !important; }
  .resume-body-text { margin-top: 8px !important; color: #374151 !important; font-size: 11px !important; line-height: 1.55 !important; }
  .resume-bullet-list { list-style: disc !important; padding-left: 18px !important; margin-top: 6px !important; color: #374151 !important; }
  .resume-bullet-list li { margin-bottom: 2px !important; padding-left: 2px !important; color: #374151 !important; font-size: 11px !important; line-height: 1.5 !important; }
  .resume-link { color: inherit !important; text-decoration: underline !important; text-decoration-thickness: 0.06em !important; text-underline-offset: 0.12em !important; }
  .resume-entry { break-inside: avoid !important; }
  .flex { display: flex !important; }
  .grid { display: grid !important; }
  .hidden { display: none !important; }
  .min-w-0 { min-width: 0 !important; }
  .shrink-0 { flex-shrink: 0 !important; }
  .items-center { align-items: center !important; }
  .items-baseline { align-items: baseline !important; }
  .justify-between { justify-content: space-between !important; }
  .flex-wrap { flex-wrap: wrap !important; }
  .gap-1 { gap: 4px !important; }
  .gap-2 { gap: 8px !important; }
  .gap-x-4 { column-gap: 16px !important; }
  .gap-y-1 { row-gap: 4px !important; }
  .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: calc(16px * var(--resume-density)) !important; }
  .space-y-1\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 6px !important; }
  .mt-0\.5 { margin-top: 2px !important; }
  .mt-1 { margin-top: 4px !important; }
  .mt-1\.5 { margin-top: 6px !important; }
  .mt-2 { margin-top: 8px !important; }
  .mt-3 { margin-top: 12px !important; }
  .pt-5 { padding-top: calc(20px * var(--resume-density)) !important; }
  .px-10 { padding-left: 40px !important; padding-right: 40px !important; }
  .pt-10 { padding-top: 40px !important; }
  .text-gray-300 { color: #d1d5db !important; }
  .text-gray-400 { color: #9ca3af !important; }
  .text-gray-500 { color: #6b7280 !important; }
  .text-gray-600 { color: #4b5563 !important; }
  .text-gray-700 { color: #374151 !important; }
  .text-gray-800 { color: #1f2937 !important; }
  .text-gray-900 { color: #111827 !important; }
  .font-medium { font-weight: 500 !important; }
  .font-semibold { font-weight: 600 !important; }
  .font-bold { font-weight: 700 !important; }
  .break-all { overflow-wrap: anywhere !important; word-break: break-word !important; }
  .break-words { overflow-wrap: break-word !important; }
  .whitespace-nowrap { white-space: nowrap !important; }
  .list-none { list-style: none !important; }
  .p-0 { padding: 0 !important; }
  .m-0 { margin: 0 !important; }
  svg { display: none !important; }
`;

function applyHtml2CanvasSafeResumeColors(root: HTMLElement) {
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];

  for (const element of all) {
    const tagName = element.tagName.toLowerCase();

    element.style.setProperty("color", "#374151", "important");
    element.style.setProperty("background-color", "transparent", "important");
    element.style.setProperty("border-color", "#e5e7eb", "important");
    element.style.setProperty("text-decoration-color", "currentColor", "important");
    element.style.setProperty("box-shadow", "none", "important");
    element.style.setProperty("text-shadow", "none", "important");

    if (element.classList.contains("resume-page") || element.classList.contains("a4-scaling-wrapper")) {
      element.style.setProperty("background", "#ffffff", "important");
      element.style.setProperty("background-color", "#ffffff", "important");
    }

    if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
      element.style.setProperty("color", "#111827", "important");
    }

    if (tagName === "p") {
      element.style.setProperty("color", "#4b5563", "important");
    }

    if (tagName === "li" || tagName === "span") {
      element.style.setProperty("color", "#374151", "important");
    }

    if (element.classList.contains("resume-section-title")) {
      element.style.setProperty("color", "#111827", "important");
      element.style.setProperty("border-bottom-color", "#e5e7eb", "important");
    }

    if (tagName === "a") {
      element.style.setProperty("color", "inherit", "important");
    }

    if (tagName === "svg") {
      element.style.setProperty("display", "none", "important");
    }
  }
}

type PdfWithLinks = {
  link: (x: number, y: number, width: number, height: number, options: { url: string }) => void;
};

function addPdfLinkAnnotations(pdf: PdfWithLinks, root: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  const scaleX = 210 / rootRect.width;
  const scaleY = 297 / rootRect.height;

  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
    const href = anchor.href;
    if (!href) return;
    const rects = Array.from(anchor.getClientRects());
    rects.forEach((rect) => {
      if (rect.width <= 0 || rect.height <= 0) return;
      pdf.link(
        (rect.left - rootRect.left) * scaleX,
        (rect.top - rootRect.top) * scaleY,
        rect.width * scaleX,
        rect.height * scaleY,
        { url: href }
      );
    });
  });
}

function documentTitleFromResume(root: HTMLElement): string {
  const name = root.querySelector("h1")?.textContent?.trim();
  return name && name !== "Your Name" ? `${name} Resume` : "resume";
}

function safeFileName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "resume";
}
