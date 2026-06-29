"use client";

import { useResumeStore } from "@/stores/useResumeStore";
import { ArrayItemCard } from "./ArrayItemCard";
import { FormField } from "./FormField";
import { BulletEditor } from "./BulletEditor";
import { AddItemButton } from "./AddItemButton";
import { SortableList } from "./SortableList";
import { SectionEmptyState } from "./SectionEmptyState";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Briefcase } from "lucide-react";

/**
 * WorkExperienceForm — lists all work experience entries as sortable cards.
 * Each card contains company, role, dates, and a BulletEditor with
 * per-bullet visibility toggle (the Teal hide/show feature).
 */
export function WorkExperienceForm() {
  const workExperience = useResumeStore((s) => s.workExperience);
  const addWorkExperience = useResumeStore((s) => s.addWorkExperience);
  const updateWorkExperience = useResumeStore((s) => s.updateWorkExperience);
  const removeWorkExperience = useResumeStore((s) => s.removeWorkExperience);
  const toggleBulletVisibility = useResumeStore((s) => s.toggleBulletVisibility);
  const reorderWorkExperience = useResumeStore((s) => s.reorderWorkExperience);

  return (
    <div className="space-y-2">
      {workExperience.length === 0 ? (
        <SectionEmptyState
          icon={Briefcase}
          title="No work experience yet"
          description="Add your work history to build a strong resume"
        />
      ) : (
        <SortableList
          droppableId="work-experience"
          items={workExperience}
          onReorder={reorderWorkExperience}
          renderItem={(exp, _index, { dragHandleProps, isDragging }) => (
            <WorkExperienceItem
              key={exp.id}
              id={exp.id}
              company={exp.company}
              position={exp.position}
              location={exp.location}
              startDate={exp.startDate}
              endDate={exp.endDate}
              isCurrent={exp.isCurrent}
              description={exp.description}
              hiddenBulletIndices={exp.hiddenBulletIndices}
              onUpdate={(patch) => updateWorkExperience(exp.id, patch)}
              onRemove={() => removeWorkExperience(exp.id)}
              onToggleBullet={(i) => toggleBulletVisibility(exp.id, i)}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            />
          )}
        />
      )}

      <AddItemButton label="Add Work Experience" onClick={addWorkExperience} />
    </div>
  );
}

// ─── Single Work Experience Item ──────────────────────────────────────

function WorkExperienceItem({
  id,
  company,
  position,
  location,
  startDate,
  endDate,
  isCurrent,
  description,
  hiddenBulletIndices,
  onUpdate,
  onRemove,
  onToggleBullet,
  dragHandleProps,
  isDragging,
}: {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  hiddenBulletIndices: number[];
  onUpdate: (patch: Record<string, unknown>) => void;
  onRemove: () => void;
  onToggleBullet: (index: number) => void;
  dragHandleProps?: object;
  isDragging: boolean;
}) {
  const displayTitle = position || company || "New Position";
  const displaySubtitle = [company, location].filter(Boolean).join(" · ") || undefined;

  return (
    <ArrayItemCard
      title={displayTitle}
      subtitle={displaySubtitle}
      onRemove={onRemove}
      dragHandleProps={dragHandleProps}
      isDragging={isDragging}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Company"
          placeholder="Google"
          value={company}
          onChange={(v) => onUpdate({ company: v })}
        />
        <FormField
          label="Role / Title"
          placeholder="Senior Engineer"
          value={position}
          onChange={(v) => onUpdate({ position: v })}
        />
        <FormField
          label="Location"
          placeholder="Mountain View, CA"
          value={location}
          onChange={(v) => onUpdate({ location: v })}
        />
        <div className="space-y-1">
          <FormField
            label="Start Date"
            placeholder="2020-01"
            value={startDate}
            onChange={(v) => onUpdate({ startDate: v })}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <FormField
                label="End Date"
                placeholder="2024-06"
                value={isCurrent ? "Present" : endDate}
                onChange={(v) => onUpdate({ endDate: v })}
                className={cn(isCurrent && "opacity-50")}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={`current-${id}`}
              checked={isCurrent}
              onCheckedChange={(checked) => onUpdate({ isCurrent: checked, endDate: "present" })}
              className="scale-75 origin-left"
            />
            <Label
              htmlFor={`current-${id}`}
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Currently working here
            </Label>
          </div>
        </div>
      </div>

      {/* ─── Bullet Points ────────────────────────────────────── */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs text-muted-foreground">Key Achievements</label>
        <BulletEditor
          value={description}
          onChange={(v) => onUpdate({ description: v })}
          hiddenIndices={hiddenBulletIndices}
          onToggleHidden={onToggleBullet}
          onHiddenIndicesChange={(indices) => onUpdate({ hiddenBulletIndices: indices })}
          placeholder="Describe an achievement…"
        />
      </div>
    </ArrayItemCard>
  );
}
