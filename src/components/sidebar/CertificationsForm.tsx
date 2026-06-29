"use client";

import { useResumeStore } from "@/stores/useResumeStore";
import { ArrayItemCard } from "./ArrayItemCard";
import { FormField } from "./FormField";
import { AddItemButton } from "./AddItemButton";
import { SortableList } from "./SortableList";
import { SectionEmptyState } from "./SectionEmptyState";
import { Award } from "lucide-react";

/**
 * CertificationsForm — simple entries: name, issuer, date, URL, credential ID.
 * Supports drag-and-drop reordering.
 */
export function CertificationsForm() {
  const certifications = useResumeStore((s) => s.certifications);
  const addCertification = useResumeStore((s) => s.addCertification);
  const updateCertification = useResumeStore((s) => s.updateCertification);
  const removeCertification = useResumeStore((s) => s.removeCertification);
  const reorderCertifications = useResumeStore((s) => s.reorderCertifications);

  return (
    <div className="space-y-2">
      {certifications.length === 0 ? (
        <SectionEmptyState
          icon={Award}
          title="No certifications yet"
          description="Add professional certifications to strengthen your profile"
        />
      ) : (
        <SortableList
          droppableId="certifications"
          items={certifications}
          onReorder={reorderCertifications}
          renderItem={(cert, _index, { dragHandleProps, isDragging }) => (
            <ArrayItemCard
              key={cert.id}
              title={cert.name || "New Certification"}
              subtitle={cert.issuer || "No issuer"}
              onRemove={() => removeCertification(cert.id)}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            >
              <FormField
                label="Certification Name"
                placeholder="AWS Solutions Architect"
                value={cert.name}
                onChange={(v) => updateCertification(cert.id, { name: v })}
              />
              <FormField
                label="Issuer"
                placeholder="Amazon Web Services"
                value={cert.issuer}
                onChange={(v) => updateCertification(cert.id, { issuer: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Date"
                  placeholder="2024-03"
                  value={cert.date}
                  onChange={(v) => updateCertification(cert.id, { date: v })}
                />
                <FormField
                  label="Credential ID"
                  placeholder="ABC-12345"
                  value={cert.credentialId}
                  onChange={(v) => updateCertification(cert.id, { credentialId: v })}
                />
              </div>
              <FormField
                label="URL"
                placeholder="https://credential.example.com/verify"
                value={cert.url}
                onChange={(v) => updateCertification(cert.id, { url: v })}
              />
            </ArrayItemCard>
          )}
        />
      )}

      <AddItemButton label="Add Certification" onClick={addCertification} />
    </div>
  );
}
