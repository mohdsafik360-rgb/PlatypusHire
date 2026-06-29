import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * LinkField — paired display label + URL inputs for contact links.
 * The label is optional; preview falls back to the URL when it is blank.
 */
export function LinkField({
  label,
  labelValue,
  urlValue,
  labelPlaceholder,
  urlPlaceholder,
  onLabelChange,
  onUrlChange,
  className,
}: {
  label: string;
  labelValue: string;
  urlValue: string;
  labelPlaceholder?: string;
  urlPlaceholder?: string;
  onLabelChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] gap-2">
        <Input
          type="text"
          placeholder={labelPlaceholder || "Label"}
          value={labelValue}
          onChange={(e) => onLabelChange(e.target.value)}
          className="h-8 bg-white text-sm border-border focus-visible:border-ring"
          aria-label={`${label} display label`}
        />
        <Input
          type="url"
          placeholder={urlPlaceholder || "URL"}
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
          className="h-8 bg-white text-sm border-border focus-visible:border-ring"
          aria-label={`${label} URL`}
        />
      </div>
    </div>
  );
}
