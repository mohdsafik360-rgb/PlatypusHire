"use client";

import { useResumeStore } from "@/stores/useResumeStore";
import { ArrayItemCard } from "./ArrayItemCard";
import { FormField } from "./FormField";
import { BulletEditor } from "./BulletEditor";
import { AddItemButton } from "./AddItemButton";
import { SortableList } from "./SortableList";
import { SectionEmptyState } from "./SectionEmptyState";
import { GraduationCap } from "lucide-react";

/**
 * EducationForm — lists all education entries as sortable cards.
 * Same Teal-style pattern as WorkExperience with bullet editor.
 */
export function EducationForm() {
  const education = useResumeStore((s) => s.education);
  const addEducation = useResumeStore((s) => s.addEducation);
  const updateEducation = useResumeStore((s) => s.updateEducation);
  const removeEducation = useResumeStore((s) => s.removeEducation);
  const toggleHighlightVisibility = useResumeStore((s) => s.toggleHighlightVisibility);
  const reorderEducation = useResumeStore((s) => s.reorderEducation);

  return (
    <div className="space-y-2">
      {education.length === 0 ? (
        <SectionEmptyState
          icon={GraduationCap}
          title="No education added"
          description="Add your educational background and highlights"
        />
      ) : (
        <SortableList
          droppableId="education"
          items={education}
          onReorder={reorderEducation}
          renderItem={(edu, _index, { dragHandleProps, isDragging }) => (
            <EducationItem
              key={edu.id}
              id={edu.id}
              institution={edu.institution}
              degree={edu.degree}
              field={edu.field}
              location={edu.location}
              startDate={edu.startDate}
              endDate={edu.endDate}
              gpa={edu.gpa}
              highlights={edu.highlights}
              hiddenBulletIndices={edu.hiddenBulletIndices}
              onUpdate={(patch) => updateEducation(edu.id, patch)}
              onRemove={() => removeEducation(edu.id)}
              onToggleBullet={(i) => toggleHighlightVisibility(edu.id, i)}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            />
          )}
        />
      )}

      <AddItemButton label="Add Education" onClick={addEducation} />
    </div>
  );
}

// ─── Single Education Item ───────────────────────────────────────────

function EducationItem({
  id,
  institution,
  degree,
  field,
  location,
  startDate,
  endDate,
  gpa,
  highlights,
  hiddenBulletIndices,
  onUpdate,
  onRemove,
  onToggleBullet,
  dragHandleProps,
  isDragging,
}: {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  highlights: string;
  hiddenBulletIndices: number[];
  onUpdate: (patch: Record<string, unknown>) => void;
  onRemove: () => void;
  onToggleBullet: (index: number) => void;
  dragHandleProps?: object;
  isDragging: boolean;
}) {
  const displayTitle = institution || "New Institution";
  const displaySubtitle = [degree, field].filter(Boolean).join(" in ") || undefined;

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
          label="Institution"
          placeholder="MIT"
          value={institution}
          onChange={(v) => onUpdate({ institution: v })}
        />
        <FormField
          label="Degree"
          placeholder="Bachelor of Science"
          value={degree}
          onChange={(v) => onUpdate({ degree: v })}
        />
        <FormField
          label="Field of Study"
          placeholder="Computer Science"
          value={field}
          onChange={(v) => onUpdate({ field: v })}
        />
        <FormField
          label="Location"
          placeholder="Cambridge, MA"
          value={location}
          onChange={(v) => onUpdate({ location: v })}
        />
        <FormField
          label="Start Date"
          placeholder="2016-09"
          value={startDate}
          onChange={(v) => onUpdate({ startDate: v })}
        />
        <FormField
          label="End Date"
          placeholder="2020-06"
          value={endDate}
          onChange={(v) => onUpdate({ endDate: v })}
        />
        <FormField
          label="GPA"
          placeholder="3.8 / 4.0"
          value={gpa}
          onChange={(v) => onUpdate({ gpa: v })}
        />
      </div>

      {/* ─── Highlights / Bullet Points ─────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">Highlights</label>
        <BulletEditor
          value={highlights}
          onChange={(v) => onUpdate({ highlights: v })}
          hiddenIndices={hiddenBulletIndices}
          onToggleHidden={onToggleBullet}
          onHiddenIndicesChange={(indices) => onUpdate({ hiddenBulletIndices: indices })}
          placeholder="Add a highlight…"
        />
      </div>
    </ArrayItemCard>
  );
}
