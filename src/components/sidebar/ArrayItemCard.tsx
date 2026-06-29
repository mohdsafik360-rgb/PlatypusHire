import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrayItemCardProps {
  title: string;
  subtitle?: string;
  isHidden?: boolean;
  onToggleVisibility?: () => void;
  onRemove?: () => void;
  children?: React.ReactNode;
  className?: string;
  /** Pass true when there's no drag handle */
  noDragHandle?: boolean;
  onClick?: () => void;
  /** @hello-pangea/dnd — spread onto the grip handle button */
  dragHandleProps?: object;
  /** @hello-pangea/dnd — apply dragging visual state */
  isDragging?: boolean;
}

/**
 * ArrayItemCard — wraps each work/education/project entry in the sidebar.
 * Shows a drag handle, title, subtitle, optional hide toggle, and trash button.
 * Teal-style: white card with subtle shadow, compact, outline design system.
 */
export function ArrayItemCard({
  title,
  subtitle,
  isHidden,
  onToggleVisibility,
  onRemove,
  children,
  className,
  noDragHandle,
  onClick,
  dragHandleProps,
  isDragging,
}: ArrayItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group/item rounded-lg border bg-white shadow-sm",
        "transition-all duration-150",
        "hover:shadow-md hover:border-muted-foreground/20",
        onClick && "cursor-pointer",
        isDragging
          ? "shadow-lg ring-2 ring-primary/20 border-primary/30 rotate-[0.5deg] scale-[1.01]"
          : "border-border",
        className
      )}
    >
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {!noDragHandle && (
          <button
            type="button"
            {...dragHandleProps}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted/80 cursor-grab active:cursor-grabbing transition-colors touch-none"
            aria-label={`Drag ${title || "item"} to reorder`}
          >
            <GripVertical
              className="size-3.5"
              strokeWidth={1.5}
            />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate leading-tight">
            {title || "Untitled"}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {onToggleVisibility && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors",
              isHidden
                ? "text-muted-foreground/40 hover:text-muted-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
            title={isHidden ? "Show on resume" : "Hide from resume"}
          >
            {isHidden ? (
              <EyeOff className="size-3.5" strokeWidth={1.5} />
            ) : (
              <Eye className="size-3.5" strokeWidth={1.5} />
            )}
            <span className="hidden sm:inline">{isHidden ? "Hidden" : "Visible"}</span>
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground/0 group-hover/item:text-muted-foreground/50 hover:!text-destructive hover:!bg-destructive/10 transition-all duration-150"
            title="Remove"
            aria-label={`Remove ${title || "item"}`}
          >
            <Trash2 className="size-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* ─── Expandable body ──────────────────────────────────── */}
      {children && (
        <div className="border-t border-border/80 px-3 py-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
