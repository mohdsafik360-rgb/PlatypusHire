import { Plus } from "lucide-react";

/**
 * AddItemButton — the Teal-style "Add New" button at the bottom of array sections.
 * Dashed border outline, subtle hover animation, and icon+label layout.
 */
export function AddItemButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/25 bg-white/60 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:bg-primary/10 transition-all duration-150 cursor-pointer"
    >
      <Plus className="size-4" strokeWidth={1.5} />
      {label}
    </button>
  );
}
