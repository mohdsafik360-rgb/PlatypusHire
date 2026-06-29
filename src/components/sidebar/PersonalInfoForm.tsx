"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";
import { Camera, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { useResumeStore } from "@/stores/useResumeStore";
import { FormField } from "./FormField";
import { LinkField } from "./LinkField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PASSPORT_ASPECT = 35 / 45; // width / height

// ─── Types ───────────────────────────────────────────────────────────
interface CropState {
  src: string;
  naturalW: number;
  naturalH: number;
  /** Zoom multiplier (1 = cover the frame exactly) */
  zoom: number;
  /** Pixel offset of the image origin relative to the canvas origin */
  offsetX: number;
  offsetY: number;
}

// ─── PersonalInfoForm ─────────────────────────────────────────────────
export function PersonalInfoForm() {
  const basics = useResumeStore((s) => s.basics);
  const updateBasics = useResumeStore((s) => s.updateBasics);

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-3 py-2">
        <PhotoDropzone
          value={basics.passportPhotoUrl}
          includePhoto={basics.includePassportPhoto !== false}
          photoScale={basics.passportPhotoScale || 1}
          onPhotoChange={(b64) =>
            updateBasics({
              passportPhotoUrl: b64,
              includePassportPhoto: b64 ? true : basics.includePassportPhoto,
            })
          }
          onIncludeChange={(includePassportPhoto) => updateBasics({ includePassportPhoto })}
          onScaleChange={(scale) => updateBasics({ passportPhotoScale: scale })}
        />
        <p className="text-[11px] text-muted-foreground text-center max-w-[240px]">
          Drag, scroll to zoom, then confirm. The preview keeps a dedicated image column.
        </p>
      </div>

      <FormField label="Full Name" placeholder="John Doe" value={basics.fullName} onChange={(v) => updateBasics({ fullName: v })} />
      <FormField label="Job Title" placeholder="Senior Software Engineer" value={basics.jobTitle} onChange={(v) => updateBasics({ jobTitle: v })} />
      <FormField label="Email" type="email" placeholder="john@example.com" value={basics.email} onChange={(v) => updateBasics({ email: v })} />
      <FormField label="Phone" type="tel" placeholder="+1 (555) 123-4567" value={basics.phone} onChange={(v) => updateBasics({ phone: v })} />
      <FormField label="Location" placeholder="San Francisco, CA" value={basics.location} onChange={(v) => updateBasics({ location: v })} />
      <LinkField
        label="Website / Portfolio"
        labelValue={basics.websiteLabel}
        urlValue={basics.website}
        labelPlaceholder="Portfolio"
        urlPlaceholder="https://johndoe.dev"
        onLabelChange={(v) => updateBasics({ websiteLabel: v })}
        onUrlChange={(v) => updateBasics({ website: v })}
      />
      <LinkField
        label="LinkedIn"
        labelValue={basics.linkedinLabel}
        urlValue={basics.linkedin}
        labelPlaceholder="LinkedIn"
        urlPlaceholder="linkedin.com/in/johndoe"
        onLabelChange={(v) => updateBasics({ linkedinLabel: v })}
        onUrlChange={(v) => updateBasics({ linkedin: v })}
      />
      <LinkField
        label="GitHub"
        labelValue={basics.githubLabel}
        urlValue={basics.github}
        labelPlaceholder="GitHub"
        urlPlaceholder="github.com/johndoe"
        onLabelChange={(v) => updateBasics({ githubLabel: v })}
        onUrlChange={(v) => updateBasics({ github: v })}
      />

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Professional Summary</label>
        <textarea
          placeholder="A brief summary of your professional background and career goals…"
          value={basics.summary}
          onChange={(e) => updateBasics({ summary: e.target.value })}
          rows={4}
          className={cn(
            "w-full rounded-md border border-border bg-white px-3 py-2 text-sm",
            "placeholder:text-muted-foreground/60 shadow-xs",
            "focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
            "outline-none transition-colors resize-none"
          )}
        />
      </div>
    </div>
  );
}

// ─── PhotoDropzone ────────────────────────────────────────────────────
function PhotoDropzone({
  value,
  includePhoto,
  photoScale,
  onPhotoChange,
  onIncludeChange,
  onScaleChange,
}: {
  value: string;
  includePhoto: boolean;
  photoScale: number;
  onPhotoChange: (base64: string) => void;
  onIncludeChange: (include: boolean) => void;
  onScaleChange: (scale: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [crop, setCrop] = useState<CropState | null>(null);

  const THUMB_W = 80;
  const THUMB_H = Math.round(THUMB_W / PASSPORT_ASPECT);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = String(e.target?.result || "");
      if (!src) return;
      const img = new Image();
      img.onload = () => {
        // Start offset so image is centred in the crop frame
        setCrop({ src, naturalW: img.naturalWidth, naturalH: img.naturalHeight, zoom: 1, offsetX: 0, offsetY: 0 });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleRemove = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onPhotoChange("");
  }, [onPhotoChange]);

  const confirmCrop = useCallback(async () => {
    if (!crop) return;
    const base64 = await renderCrop(crop, 420);
    onPhotoChange(base64);
    setCrop(null);
  }, [crop, onPhotoChange]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed",
          "cursor-pointer transition-all",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
          value ? "border-transparent p-1" : "py-4 px-6"
        )}
        style={!value ? { width: THUMB_W + 48 } : undefined}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" aria-label="Upload passport photo" />

        {value ? (
          <>
            <img src={value} alt="Passport photo" className="rounded object-cover" style={{ width: THUMB_W, height: THUMB_H }} />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove passport photo"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
            >
              <X className="size-3" strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
            <div className="flex items-center justify-center rounded-full bg-muted" style={{ width: THUMB_W, height: THUMB_H }}>
              <Camera className="size-6" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-medium flex items-center gap-1"><Upload className="size-3" strokeWidth={1.5} />Upload</span>
          </div>
        )}
      </div>

      {value && (
        <div className="w-full space-y-2 px-2">
          <label className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span>Show photo on resume</span>
            <input
              type="checkbox"
              checked={includePhoto}
              onChange={(e) => onIncludeChange(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
          </label>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Photo size in resume</span>
              <span>{Math.round(photoScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.35"
              step="0.01"
              value={photoScale}
              onChange={(e) => onScaleChange(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Resize photo in resume preview"
              disabled={!includePhoto}
            />
          </div>
        </div>
      )}

      {crop && (
        <CropModal
          crop={crop}
          onChange={setCrop}
          onPickAnother={() => fileInputRef.current?.click()}
          onConfirm={confirmCrop}
          onClose={() => setCrop(null)}
        />
      )}
    </>
  );
}

// ─── CropModal ────────────────────────────────────────────────────────
// Canvas-based cropper: drag to pan, scroll/pinch to zoom, live preview.
const CANVAS_W = 280;
const CANVAS_H = Math.round(CANVAS_W / PASSPORT_ASPECT);
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;

function CropModal({
  crop,
  onChange,
  onPickAnother,
  onConfirm,
  onClose,
}: {
  crop: CropState;
  onChange: (c: CropState) => void;
  onPickAnother: () => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load the image once
  useEffect(() => {
    const img = new Image();
    img.onload = () => { imgRef.current = img; };
    img.src = crop.src;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop.src]);

  // ── Derived: base scale so image *covers* the canvas at zoom=1 ──
  const baseScale = useMemo(() => {
    const sw = CANVAS_W / crop.naturalW;
    const sh = CANVAS_H / crop.naturalH;
    return Math.max(sw, sh);
  }, [crop.naturalW, crop.naturalH]);

  // ── Clamp offsets so image always fills the canvas frame ──────────
  const clampOffset = useCallback((ox: number, oy: number, zoom: number) => {
    const scale = baseScale * zoom;
    const drawW = crop.naturalW * scale;
    const drawH = crop.naturalH * scale;
    const maxOx = 0;
    const minOx = CANVAS_W - drawW;
    const maxOy = 0;
    const minOy = CANVAS_H - drawH;
    return {
      ox: clamp(ox, minOx, maxOx),
      oy: clamp(oy, minOy, maxOy),
    };
  }, [baseScale, crop.naturalW, crop.naturalH]);

  // Centre image on first open
  useLayoutEffect(() => {
    const scale = baseScale * crop.zoom;
    const drawW = crop.naturalW * scale;
    const drawH = crop.naturalH * scale;
    const cx = (CANVAS_W - drawW) / 2;
    const cy = (CANVAS_H - drawH) / 2;
    const { ox, oy } = clampOffset(cx, cy, crop.zoom);
    onChange({ ...crop, offsetX: ox, offsetY: oy });
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draw canvas ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = baseScale * crop.zoom;
    const drawW = crop.naturalW * scale;
    const drawH = crop.naturalH * scale;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(img, crop.offsetX, crop.offsetY, drawW, drawH);

    // Subtle vignette border to show crop area
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);

    // Rule-of-thirds grid
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo((CANVAS_W / 3) * i, 0); ctx.lineTo((CANVAS_W / 3) * i, CANVAS_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, (CANVAS_H / 3) * i); ctx.lineTo(CANVAS_W, (CANVAS_H / 3) * i); ctx.stroke();
    }
  }, [crop, baseScale]);

  // ── Pointer drag ──────────────────────────────────────────────────
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; startOX: number; startOY: number } | null>(null);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startOX: crop.offsetX, startOY: crop.offsetY };
  }, [crop.offsetX, crop.offsetY]);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const { ox, oy } = clampOffset(d.startOX + dx, d.startOY + dy, crop.zoom);
    onChange({ ...crop, offsetX: ox, offsetY: oy });
  }, [crop, clampOffset, onChange]);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }, []);

  // ── Scroll / pinch zoom (zoom toward cursor) ──────────────────────
  const handleWheel = useCallback((e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newZoom = clamp(crop.zoom + delta * crop.zoom, ZOOM_MIN, ZOOM_MAX);

    // Zoom toward the cursor position on the canvas
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    const ratio = newZoom / crop.zoom;
    const newOX = cursorX - ratio * (cursorX - crop.offsetX);
    const newOY = cursorY - ratio * (cursorY - crop.offsetY);
    const { ox, oy } = clampOffset(newOX, newOY, newZoom);
    onChange({ ...crop, zoom: newZoom, offsetX: ox, offsetY: oy });
  }, [crop, clampOffset, onChange]);

  // Keyboard zoom
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "=" || e.key === "+") {
      const newZoom = clamp(crop.zoom + 0.1, ZOOM_MIN, ZOOM_MAX);
      const { ox, oy } = clampOffset(crop.offsetX, crop.offsetY, newZoom);
      onChange({ ...crop, zoom: newZoom, offsetX: ox, offsetY: oy });
    } else if (e.key === "-") {
      const newZoom = clamp(crop.zoom - 0.1, ZOOM_MIN, ZOOM_MAX);
      const { ox, oy } = clampOffset(crop.offsetX, crop.offsetY, newZoom);
      onChange({ ...crop, zoom: newZoom, offsetX: ox, offsetY: oy });
    }
  }, [crop, clampOffset, onChange]);

  const zoomPct = Math.round(((crop.zoom - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Crop passport photo"
    >
      <div className="w-full max-w-xs rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div>
            <h3 className="text-sm font-semibold leading-tight">Crop photo</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Drag to reposition · scroll to zoom</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Canvas crop area */}
        <div className="relative bg-black select-none" style={{ width: CANVAS_W, margin: "0 auto" }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="block cursor-grab active:cursor-grabbing touch-none"
            style={{ display: "block" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            aria-label="Drag to reposition, scroll or use +/- keys to zoom"
          />
        </div>

        {/* Zoom controls */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => {
                const newZoom = clamp(crop.zoom - 0.15, ZOOM_MIN, ZOOM_MAX);
                const { ox, oy } = clampOffset(crop.offsetX, crop.offsetY, newZoom);
                onChange({ ...crop, zoom: newZoom, offsetX: ox, offsetY: oy });
              }}
              className="rounded-md p-1 hover:bg-muted transition-colors text-muted-foreground"
            >
              <ZoomOut className="size-4" strokeWidth={1.5} />
            </button>
            <div className="relative flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary transition-none"
                style={{ width: `${zoomPct}%` }}
              />
              <input
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={0.01}
                value={crop.zoom}
                onChange={(e) => {
                  const newZoom = Number(e.target.value);
                  const { ox, oy } = clampOffset(crop.offsetX, crop.offsetY, newZoom);
                  onChange({ ...crop, zoom: newZoom, offsetX: ox, offsetY: oy });
                }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                aria-label="Zoom"
              />
            </div>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => {
                const newZoom = clamp(crop.zoom + 0.15, ZOOM_MIN, ZOOM_MAX);
                const { ox, oy } = clampOffset(crop.offsetX, crop.offsetY, newZoom);
                onChange({ ...crop, zoom: newZoom, offsetX: ox, offsetY: oy });
              }}
              className="rounded-md p-1 hover:bg-muted transition-colors text-muted-foreground"
            >
              <ZoomIn className="size-4" strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              const scale = baseScale * ZOOM_MIN;
              const drawW = crop.naturalW * scale;
              const drawH = crop.naturalH * scale;
              const { ox, oy } = clampOffset((CANVAS_W - drawW) / 2, (CANVAS_H - drawH) / 2, ZOOM_MIN);
              onChange({ ...crop, zoom: ZOOM_MIN, offsetX: ox, offsetY: oy });
            }}
            className="mt-1.5 text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 px-4 pb-4 pt-2">
          <Button type="button" variant="outline" onClick={onPickAnother}>
            Change photo
          </Button>
          <Button type="button" onClick={onConfirm}>
            Apply crop
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

async function renderCrop(crop: CropState, outW: number): Promise<string> {
  const img = await loadImage(crop.src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return crop.src;

  const outH = Math.round(outW / PASSPORT_ASPECT);
  canvas.width = outW;
  canvas.height = outH;

  // The live cropper shows the image at:
  //   drawW = naturalW * baseScale(canvas) * zoom  on a CANVAS_W-wide frame
  // We want the output canvas to show exactly the same crop but at outW resolution.
  // The correct approach: scale the canvas draw dimensions up to output resolution
  // using the ratio (outW / CANVAS_W) — do NOT re-derive baseScale at output size
  // and multiply by scaleToOut again, because that double-scales the draw dimensions.
  const baseScaleCanvas = Math.max(CANVAS_W / crop.naturalW, CANVAS_H / crop.naturalH);
  const scaleOnCanvas = baseScaleCanvas * crop.zoom;

  // Canvas-space draw dimensions → scale up to output dimensions
  const scaleToOut = outW / CANVAS_W;
  const drawW = crop.naturalW * scaleOnCanvas * scaleToOut;
  const drawH = crop.naturalH * scaleOnCanvas * scaleToOut;
  const dx = crop.offsetX * scaleToOut;
  const dy = crop.offsetY * scaleToOut;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(img, dx, dy, drawW, drawH);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
