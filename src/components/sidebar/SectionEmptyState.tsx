import type { LucideIcon } from "lucide-react";

interface SectionEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * SectionEmptyState — friendly empty-state placeholder shown when a
 * section has zero items. Matches Teal's design: outline icon in a
 * soft circle, muted text, centered within the section area.
 */
export function SectionEmptyState({
  icon: Icon,
  title,
  description,
}: SectionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/15 bg-muted/20 py-10 px-4 text-center animate-in fade-in-0 duration-300">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-muted-foreground/15 bg-white shadow-sm">
        <Icon
          className="size-5 text-muted-foreground/40"
          strokeWidth={1.5}
        />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-muted-foreground/80">{title}</p>
        <p className="text-xs text-muted-foreground/50 max-w-[200px] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
