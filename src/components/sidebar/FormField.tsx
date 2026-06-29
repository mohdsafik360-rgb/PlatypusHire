import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * FormField — a labeled input. Teal-style: compact, white background,
 * subtle border, tight vertical rhythm.
 */
export function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 bg-white text-sm border-border focus-visible:border-ring"
      />
    </div>
  );
}
