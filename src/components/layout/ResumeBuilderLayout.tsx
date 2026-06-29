"use client";

import { useEffect, type RefObject } from "react";
import { useResumeStore } from "@/stores/useResumeStore";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarSections } from "@/components/sidebar/SidebarSections";
import { A4ScalingContainer } from "@/components/preview/A4ScalingContainer";
import { ResumePreview } from "@/components/preview/ResumePreview";

interface ResumeBuilderLayoutProps {
  resumeRef: RefObject<HTMLDivElement | null>;
}

export function ResumeBuilderLayout({ resumeRef }: ResumeBuilderLayoutProps) {
  const hydrate = useResumeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* ─── Left Sidebar: Form Editor ─────────────────────────────── */}
        <ResizablePanel defaultSize={42} minSize={30} maxSize={55}>
          <ScrollArea className="h-full bg-gray-50">
            <nav
              data-no-print
              className="flex flex-col gap-2 p-4 md:p-6"
              aria-label="Resume sections"
            >
              <SidebarSections />
            </nav>
          </ScrollArea>
        </ResizablePanel>

        {/* ─── Resize Handle ────────────────────────────────────────── */}
        <ResizableHandle withHandle data-no-print />

        {/* ─── Right Panel: Live Preview ────────────────────────────── */}
        <ResizablePanel defaultSize={58} minSize={40}>
          <div data-no-print className="h-full overflow-auto bg-muted/30">
            <A4ScalingContainer ref={resumeRef}>
              <ResumePreview />
            </A4ScalingContainer>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
