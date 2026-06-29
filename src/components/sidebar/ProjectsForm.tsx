"use client";

import { useResumeStore } from "@/stores/useResumeStore";
import { ArrayItemCard } from "./ArrayItemCard";
import { FormField } from "./FormField";
import { BulletEditor } from "./BulletEditor";
import { AddItemButton } from "./AddItemButton";
import { SortableList } from "./SortableList";
import { SectionEmptyState } from "./SectionEmptyState";
import { FolderKanban } from "lucide-react";

/**
 * ProjectsForm — project entries with name, description bullets, URL, tech stack.
 * Supports drag-and-drop reordering.
 */
export function ProjectsForm() {
  const projects = useResumeStore((s) => s.projects);
  const addProject = useResumeStore((s) => s.addProject);
  const updateProject = useResumeStore((s) => s.updateProject);
  const removeProject = useResumeStore((s) => s.removeProject);
  const toggleProjectBulletVisibility = useResumeStore((s) => s.toggleProjectBulletVisibility);
  const reorderProjects = useResumeStore((s) => s.reorderProjects);

  return (
    <div className="space-y-2">
      {projects.length === 0 ? (
        <SectionEmptyState
          icon={FolderKanban}
          title="No projects added"
          description="Showcase your best work with project entries"
        />
      ) : (
        <SortableList
          droppableId="projects"
          items={projects}
          onReorder={reorderProjects}
          renderItem={(proj, _index, { dragHandleProps, isDragging }) => (
            <ArrayItemCard
              key={proj.id}
              title={proj.name || "New Project"}
              subtitle={proj.technologies || "No tech stack"}
              onRemove={() => removeProject(proj.id)}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <FormField
                label="Project Name"
                placeholder="My Awesome App"
                value={proj.name}
                onChange={(v) => updateProject(proj.id, { name: v })}
              />
              <FormField
                label="URL"
                placeholder="https://github.com/user/project"
                value={proj.url}
                onChange={(v) => updateProject(proj.id, { url: v })}
              />
              <FormField
                label="Technologies (comma-separated)"
                placeholder="React, Node.js, PostgreSQL"
                value={proj.technologies}
                onChange={(v) => updateProject(proj.id, { technologies: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Start Date"
                  placeholder="2023-01"
                  value={proj.startDate}
                  onChange={(v) => updateProject(proj.id, { startDate: v })}
                />
                <FormField
                  label="End Date"
                  placeholder="2023-06"
                  value={proj.endDate}
                  onChange={(v) => updateProject(proj.id, { endDate: v })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Description</label>
                <BulletEditor
                  value={proj.description}
                  onChange={(v) => updateProject(proj.id, { description: v })}
                  hiddenIndices={proj.hiddenBulletIndices}
                  onToggleHidden={(i) => toggleProjectBulletVisibility(proj.id, i)}
                  onHiddenIndicesChange={(indices) => updateProject(proj.id, { hiddenBulletIndices: indices })}
                  placeholder="Describe what you built…"
                />
              </div>
            </ArrayItemCard>
          )}
        />
      )}

      <AddItemButton label="Add Project" onClick={addProject} />
    </div>
  );
}
