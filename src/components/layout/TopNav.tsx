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
    if (pending) return;
    setPending(true);

    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { ResumePDF } = await import("@/components/pdf/ResumePDF");
      
      const resumeData = useResumeStore.getState();
      
      const blob = await pdf(<ResumePDF data={resumeData} />).toBlob();
      
      const name = resumeData.basics.fullName?.trim() || "resume";
      const safeName = name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "resume";
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not generate the PDF. Please try again or check the console for details.");
    } finally {
      setPending(false);
    }
  };

  return (
    <header
      data-no-print
      className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6"
    >
      <Link href="/" className="flex items-center gap-2">
        <PlatypusLogo className="h-9 w-auto" />
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
