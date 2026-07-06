import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Link, Image } from "@react-pdf/renderer";
import type { ResumeData } from "@/types/resume";

// Register Inter font to match web preview
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf", fontWeight: 500 },
    { src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf", fontWeight: 700 },
  ],
});

// Dimensions (A4 at standard 72 DPI is 595 x 842 points)
const PHOTO_W_PT = 105; 
const PHOTO_H_PT = 135;



const LINK_RE = /((?:https?:\/\/|www\.)[^\s<>()]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>()]*)?)/g;

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function trimTrailingPunctuation(value: string): string {
  return value.replace(/[.,;:!?]+$/, "");
}

// A component to render text with clickable links
function LinkifiedTextPDF({ text, style }: { text: string; style?: any }) {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  let last = 0;
  
  // matchAll requires modern TS/JS, or we can use exec in a loop
  const matches = Array.from(text.matchAll(LINK_RE));
  
  for (const match of matches) {
    const value = match[0];
    const index = match.index ?? 0;
    
    if (index > last) {
      parts.push(<Text key={`text-${last}`} style={style}>{text.slice(last, index)}</Text>);
    }
    
    const cleanUrl = trimTrailingPunctuation(value);
    const trailing = value.slice(cleanUrl.length);
    
    parts.push(
      <Text key={`link-${index}`} style={style}>
        <Link src={normalizeUrl(cleanUrl)} style={{ color: "inherit", textDecoration: "underline" }}>
          {cleanUrl}
        </Link>
        {trailing}
      </Text>
    );
    last = index + value.length;
  }
  
  if (last < text.length) {
    parts.push(<Text key={`text-${last}`} style={style}>{text.slice(last)}</Text>);
  }
  
  return <Text style={style}>{parts}</Text>;
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return "";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function getVisibleBullets(text: string, hiddenIndices: number[]): string[] {
  if (!text.trim()) return [];
  return text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0).filter((_, i) => !hiddenIndices.includes(i));
}

function hasContent(item: object): boolean {
  const strFields = Object.values(item).filter((v): v is string => typeof v === "string");
  return strFields.some((value) => value.trim().length > 0);
}

export function ResumePDF({ 
  data, 
  density = 1, 
  scale = 1 
}: { 
  data: ResumeData; 
  density?: number; 
  scale?: number; 
}) {
  const {
    basics,
    workExperience,
    education,
    skillCategories,
    projects,
    certifications,
  } = data;

  const hasPhoto = basics.includePassportPhoto !== false && !!basics.passportPhotoUrl;
  const photoScale = Math.min(1.35, Math.max(0.7, basics.passportPhotoScale || 1));

  const styles = React.useMemo(() => StyleSheet.create({
    page: {
      fontFamily: "Inter",
      backgroundColor: "#ffffff",
      color: "#374151", // text-gray-700
      fontSize: 11 * scale,
      lineHeight: 1.45,
      paddingTop: 40 * scale,
      paddingBottom: 40 * scale,
    },
    header: {
      paddingHorizontal: 40 * scale,
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20 * scale * density,
    },
    headerContent: {
      flex: 1,
      paddingRight: 16 * scale,
    },
    photo: {
      width: PHOTO_W_PT * photoScale * scale,
      height: PHOTO_H_PT * photoScale * scale,
      objectFit: "cover",
      borderRadius: 4 * scale,
      borderWidth: 1 * scale,
      borderColor: "#e5e7eb", // border-gray-200
    },
    name: {
      fontSize: 22 * scale,
      fontWeight: 700,
      color: "#111827", // text-gray-900
      lineHeight: 1.15,
    },
    jobTitle: {
      fontSize: 12 * scale,
      fontWeight: 500,
      color: "#6b7280", // text-gray-500
      marginTop: 4 * scale,
    },
    contactList: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12 * scale,
      rowGap: 4 * scale,
      columnGap: 16 * scale,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      fontSize: 10 * scale,
      color: "#4b5563", // text-gray-600
    },
    contactLink: {
      color: "#4b5563",
      textDecoration: "underline",
    },
    section: {
      paddingHorizontal: 40 * scale,
      paddingTop: 20 * scale * density,
    },
    sectionTitle: {
      fontSize: 11 * scale,
      fontWeight: 700,
      color: "#111827",
      textTransform: "uppercase",
      letterSpacing: 0.8 * scale,
      borderBottomWidth: 1.5 * scale,
      borderBottomColor: "#e5e7eb",
      paddingBottom: 4 * scale,
      marginBottom: 12 * scale,
    },
    summaryText: {
      fontSize: 11 * scale,
      color: "#374151",
      lineHeight: 1.55,
    },
    entry: {
      marginBottom: 16 * scale * density,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    entryTitleContainer: {
      flex: 1,
      paddingRight: 8 * scale,
    },
    entryTitle: {
      fontSize: 12 * scale,
      fontWeight: 600,
      color: "#111827",
      lineHeight: 1.25,
    },
    entrySubtitle: {
      fontSize: 11 * scale,
      color: "#4b5563",
      marginTop: 2 * scale,
    },
    entryDate: {
      fontSize: 10 * scale,
      color: "#6b7280",
    },
    bulletList: {
      marginTop: 6 * scale,
      paddingLeft: 10 * scale,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2 * scale,
    },
    bulletPoint: {
      width: 10 * scale,
      fontSize: 11 * scale,
      color: "#374151",
    },
    bulletText: {
      flex: 1,
      fontSize: 11 * scale,
      color: "#374151",
      lineHeight: 1.5,
    },
    skillItem: {
      flexDirection: "row",
      marginBottom: 6 * scale,
      fontSize: 11 * scale,
    },
    skillCategory: {
      fontWeight: 600,
      color: "#111827",
      marginRight: 8 * scale,
    },
    skillText: {
      color: "#374151",
      flex: 1,
    },
    projectTech: {
      fontSize: 10 * scale,
      color: "#6b7280",
      marginTop: 2 * scale,
    },
    projectUrl: {
      fontSize: 10 * scale,
      color: "#9ca3af", // text-gray-400
      marginTop: 2 * scale,
    },
    certItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6 * scale,
      fontSize: 11 * scale,
    },
    certTitle: {
      fontWeight: 600,
      color: "#111827",
    },
    certText: {
      color: "#111827",
    },
  }), [density, scale, photoScale]);
  
  const hasSummary = basics.summary.trim().length > 0;
  const hasWork = workExperience.some(hasContent);
  const hasEdu = education.some(hasContent);
  const hasSkills = skillCategories.some((c) => c.skills.trim().length > 0);
  const hasProjects = projects.some(hasContent);
  const hasCerts = certifications.some((c) => c.name.trim().length > 0);

  return (
    <Document title={`${basics.fullName || "Resume"} - Resume`} author={basics.fullName}>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.name}>{basics.fullName || "Your Name"}</Text>
            {basics.jobTitle && (
              <Text style={styles.jobTitle}><LinkifiedTextPDF text={basics.jobTitle} /></Text>
            )}
            
            <View style={styles.contactList}>
              {basics.email && (
                <View style={styles.contactItem}>
                  <Link style={styles.contactLink} src={`mailto:${basics.email}`}>{basics.email}</Link>
                </View>
              )}
              {basics.phone && (
                <View style={styles.contactItem}>
                  <Text>{basics.phone}</Text>
                </View>
              )}
              {basics.location && (
                <View style={styles.contactItem}>
                  <Text>{basics.location}</Text>
                </View>
              )}
              {basics.website && (
                <View style={styles.contactItem}>
                  <Link style={styles.contactLink} src={normalizeUrl(basics.website)}>{basics.websiteLabel || basics.website}</Link>
                </View>
              )}
              {basics.linkedin && (
                <View style={styles.contactItem}>
                  <Link style={styles.contactLink} src={normalizeUrl(basics.linkedin)}>{basics.linkedinLabel || basics.linkedin}</Link>
                </View>
              )}
              {basics.github && (
                <View style={styles.contactItem}>
                  <Link style={styles.contactLink} src={normalizeUrl(basics.github)}>{basics.githubLabel || basics.github}</Link>
                </View>
              )}
            </View>
          </View>
          
          {hasPhoto && (
            <Image 
              src={basics.passportPhotoUrl} 
              style={styles.photo} 
            />
          )}
        </View>

        {/* SUMMARY */}
        {hasSummary && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <LinkifiedTextPDF text={basics.summary} style={styles.summaryText} />
          </View>
        )}

        {/* WORK EXPERIENCE */}
        {hasWork && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {workExperience.filter(hasContent).map((exp) => {
              const visibleBullets = getVisibleBullets(exp.description, exp.hiddenBulletIndices);
              return (
                <View key={exp.id} style={styles.entry} wrap={false}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryTitleContainer}>
                      <Text style={styles.entryTitle}><LinkifiedTextPDF text={exp.position || "Position"} /></Text>
                      <Text style={styles.entrySubtitle}><LinkifiedTextPDF text={`${exp.company}${exp.location ? ` · ${exp.location}` : ""}`} /></Text>
                    </View>
                    <Text style={styles.entryDate}>{formatDateRange(exp.startDate, exp.isCurrent ? "present" : exp.endDate)}</Text>
                  </View>
                  
                  {visibleBullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {visibleBullets.map((b, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <LinkifiedTextPDF text={b} style={styles.bulletText} />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* EDUCATION */}
        {hasEdu && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.filter(hasContent).map((edu) => {
              const visibleBullets = getVisibleBullets(edu.highlights, edu.hiddenBulletIndices);
              const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
              return (
                <View key={edu.id} style={styles.entry} wrap={false}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryTitleContainer}>
                      <Text style={styles.entryTitle}><LinkifiedTextPDF text={degreeLine || edu.institution || "Institution"} /></Text>
                      <Text style={styles.entrySubtitle}><LinkifiedTextPDF text={`${edu.institution}${edu.gpa ? ` · GPA: ${edu.gpa}` : ""}`} /></Text>
                    </View>
                    <Text style={styles.entryDate}>{formatDateRange(edu.startDate, edu.endDate)}</Text>
                  </View>
                  
                  {visibleBullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {visibleBullets.map((b, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <LinkifiedTextPDF text={b} style={styles.bulletText} />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* SKILLS */}
        {hasSkills && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skillCategories.filter((c) => c.skills.trim().length > 0).map((cat) => (
              <View key={cat.id} style={styles.skillItem}>
                <Text style={styles.skillCategory}>{cat.name || "Category"}:</Text>
                <Text style={styles.skillText}><LinkifiedTextPDF text={cat.skills} /></Text>
              </View>
            ))}
          </View>
        )}

        {/* PROJECTS */}
        {hasProjects && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.filter(hasContent).map((proj) => {
              const visibleBullets = getVisibleBullets(proj.description, proj.hiddenBulletIndices);
              return (
                <View key={proj.id} style={styles.entry} wrap={false}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryTitleContainer}>
                      <Text style={styles.entryTitle}><LinkifiedTextPDF text={proj.name || "Project"} /></Text>
                    </View>
                    <Text style={styles.entryDate}>{formatDateRange(proj.startDate, proj.endDate)}</Text>
                  </View>
                  {proj.technologies && <Text style={styles.projectTech}><LinkifiedTextPDF text={proj.technologies} /></Text>}
                  {proj.url && (
                    <Text style={styles.projectUrl}>
                      <Link src={normalizeUrl(proj.url)} style={{ color: "inherit", textDecoration: "underline" }}>{proj.url}</Link>
                    </Text>
                  )}
                  {visibleBullets.length > 0 && (
                    <View style={styles.bulletList}>
                      {visibleBullets.map((b, i) => (
                        <View key={i} style={styles.bulletItem}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <LinkifiedTextPDF text={b} style={styles.bulletText} />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* CERTIFICATIONS */}
        {hasCerts && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.filter((c) => c.name.trim().length > 0).map((cert) => (
              <View key={cert.id} style={styles.certItem}>
                <Text style={styles.certText}>
                  <Text style={styles.certTitle}>
                    {cert.url ? (
                      <Link src={normalizeUrl(cert.url)} style={{ color: "inherit", textDecoration: "underline" }}>{cert.name}</Link>
                    ) : (
                      <LinkifiedTextPDF text={cert.name} />
                    )}
                  </Text>
                  {cert.issuer ? <Text> — <LinkifiedTextPDF text={cert.issuer} /></Text> : ""}
                  {cert.credentialId ? <Text> ({cert.credentialId})</Text> : ""}
                </Text>
                <Text style={styles.entryDate}>{cert.date}</Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
}
