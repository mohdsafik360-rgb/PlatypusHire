"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulletEditorProps {
  /** Newline-separated bullet text */
  value: string;
  onChange: (value: string) => void;
  /** Indices of hidden bullets */
  hiddenIndices: number[];
  onToggleHidden: (index: number) => void;
  onHiddenIndicesChange?: (indices: number[]) => void;
  placeholder?: string;
}

/**
 * BulletEditor — Teal-style per-bullet editor.
 * Each bullet has its own text input, a visibility toggle, and a delete button.
 * A "+" button at the bottom adds a new empty bullet.
 */
export function BulletEditor({
  value,
  onChange,
  hiddenIndices,
  onToggleHidden,
  onHiddenIndicesChange,
  placeholder = "Add a bullet point…",
}: BulletEditorProps) {
  const bullets = splitBullets(value);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const updateBullet = useCallback(
    (index: number, text: string) => {
      const next = [...bullets];
      next[index] = text;
      onChange(next.join("\n"));
    },
    [bullets, onChange]
  );

  const addBullet = useCallback(() => {
    const next = [...bullets, ""];
    onChange(next.join("\n"));
    // Focus the new input on next render
    requestAnimationFrame(() => {
      refs.current[next.length - 1]?.focus();
    });
  }, [bullets, onChange]);

  const removeBullet = useCallback(
    (index: number) => {
      const next = bullets.filter((_, i) => i !== index);
      const nextHidden = hiddenIndices
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i));
      onChange(next.join("\n"));
      onHiddenIndicesChange?.(nextHidden);
    },
    [bullets, hiddenIndices, onChange, onHiddenIndicesChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addBullet();
      }
      // Backspace on empty bullet deletes it
      if (e.key === "Backspace" && bullets[index] === "" && bullets.length > 1) {
        e.preventDefault();
        removeBullet(index);
        // Focus previous
        requestAnimationFrame(() => {
          refs.current[Math.max(0, index - 1)]?.focus();
        });
      }
    },
    [addBullet, bullets, removeBullet]
  );

  return (
    <div className="space-y-1.5">
      {bullets.map((bullet, i) => {
        const isHidden = hiddenIndices.includes(i);
        return (
          <div key={i} className="group/bullet flex items-start gap-1.5">
            {/* Visibility toggle */}
            <button
              type="button"
              onClick={() => onToggleHidden(i)}
              className={cn(
                "mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
                isHidden
                  ? "text-muted-foreground/40 hover:text-muted-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={isHidden ? "Show on resume" : "Hide from resume"}
              aria-label={isHidden ? "Show bullet on resume" : "Hide bullet from resume"}
            >
              {isHidden ? (
                <EyeOff className="size-3.5" strokeWidth={1.5} />
              ) : (
                <Eye className="size-3.5" strokeWidth={1.5} />
              )}
            </button>

            {/* Text input */}
            <input
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              placeholder={placeholder}
              value={bullet}
              onChange={(e) => updateBullet(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={cn(
                "flex-1 h-8 rounded-md border bg-white px-2.5 text-sm shadow-xs outline-none",
                "transition-colors placeholder:text-muted-foreground/60",
                "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
                "border-border",
                isHidden && "opacity-50 text-muted-foreground line-through"
              )}
            />

            {/* Delete bullet */}
            {bullets.length > 1 && (
              <button
                type="button"
                onClick={() => removeBullet(i)}
                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/0 group-hover/bullet:text-muted-foreground/60 hover:!text-destructive hover:!bg-destructive/10 transition-all"
                title="Remove bullet"
                aria-label="Remove bullet"
              >
                <X className="size-3" strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}

      {/* Add bullet button */}
      <button
        type="button"
        onClick={addBullet}
        className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Add bullet point"
      >
        <Plus className="size-3" strokeWidth={2} />
        Add bullet point
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────
function splitBullets(text: string): string[] {
  if (!text.trim()) return [""];
  return text.split("\n");
}
