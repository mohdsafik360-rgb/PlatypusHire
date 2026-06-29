"use client";

import { useResumeStore } from "@/stores/useResumeStore";
import { ArrayItemCard } from "./ArrayItemCard";
import { FormField } from "./FormField";
import { AddItemButton } from "./AddItemButton";
import { SortableList } from "./SortableList";
import { SectionEmptyState } from "./SectionEmptyState";
import { Wrench } from "lucide-react";

/**
 * SkillsForm — categorized skill input with drag-to-reorder.
 * Each category has a name (e.g., "Programming Languages") and a comma-separated
 * list of skills.
 */
export function SkillsForm() {
  const skillCategories = useResumeStore((s) => s.skillCategories);
  const addSkillCategory = useResumeStore((s) => s.addSkillCategory);
  const updateSkillCategory = useResumeStore((s) => s.updateSkillCategory);
  const removeSkillCategory = useResumeStore((s) => s.removeSkillCategory);
  const reorderSkillCategories = useResumeStore((s) => s.reorderSkillCategories);

  return (
    <div className="space-y-2">
      {skillCategories.length === 0 ? (
        <SectionEmptyState
          icon={Wrench}
          title="No skills added"
          description="Add skill categories like Languages, Frameworks, and Tools"
        />
      ) : (
        <SortableList
          droppableId="skills"
          items={skillCategories}
          onReorder={reorderSkillCategories}
          renderItem={(cat, _index, { dragHandleProps, isDragging }) => (
            <ArrayItemCard
              key={cat.id}
              title={cat.name || "New Category"}
              subtitle={cat.skills || "No skills added"}
              onRemove={() => removeSkillCategory(cat.id)}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <FormField
                label="Category Name"
                placeholder="e.g. Programming Languages"
                value={cat.name}
                onChange={(v) => updateSkillCategory(cat.id, { name: v })}
              />
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Skills (comma-separated)</label>
                <textarea
                  placeholder="JavaScript, TypeScript, Python, Go"
                  value={cat.skills}
                  onChange={(e) => updateSkillCategory(cat.id, { skills: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground/60 shadow-xs focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 outline-none transition-colors resize-none"
                />
              </div>
            </ArrayItemCard>
          )}
        />
      )}

      <AddItemButton label="Add Skill Category" onClick={addSkillCategory} />
    </div>
  );
}
