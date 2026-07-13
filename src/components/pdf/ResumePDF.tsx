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

// Match the preview's logical A4 canvas (630 x 891 px) to PDF points.
const A4_W_PT = 595.28;
const A4_W_PX = 210 * 3;
const PX_TO_PT = A4_W_PT / A4_W_PX;
const px = (value: number) => value * PX_TO_PT;
const PHOTO_W_PT = px(105);
const PHOTO_H_PT = px(135);

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
      fontSize: px(11) * scale,
      lineHeight: 1.45,
      paddingTop: px(40) * scale,
      paddingBottom: px(6) * scale, // Preview has no explicit bottom padding
    },
    header: {
      paddingHorizontal: px(40) * scale,
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 0,
    },
    headerContent: {
      flex: 1,
      paddingRight: px(16) * scale,
    },
    photo: {
      width: PHOTO_W_PT * photoScale * scale,
      height: PHOTO_H_PT * photoScale * scale,
      objectFit: "cover",
      borderRadius: px(4) * scale,
      borderWidth: px(1) * scale,
      borderColor: "#e5e7eb", // border-gray-200
    },
    name: {
      fontSize: px(22) * scale,
      fontWeight: 700,
      color: "#111827", // text-gray-900
      lineHeight: 1.15,
    },
    jobTitle: {
      fontSize: px(12) * scale,
      fontWeight: 500,
      color: "#6b7280", // text-gray-500
      marginTop: px(4) * scale,
    },
    contactList: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: px(12) * scale,
      rowGap: px(4) * scale,
      columnGap: px(16) * scale,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      fontSize: px(10) * scale,
      color: "#4b5563", // text-gray-600
    },
    contactLink: {
      color: "#4b5563",
      textDecoration: "underline",
    },
    section: {
      paddingHorizontal: px(40) * scale,
      paddingTop: px(20) * scale * density,
    },
    sectionTitle: {
      fontSize: px(11) * scale,
      fontWeight: 700,
      color: "#111827",
      textTransform: "uppercase",
      letterSpacing: px(0.88) * scale,
      borderBottomWidth: px(1.5) * scale,
      borderBottomColor: "#e5e7eb",
      paddingBottom: px(4) * scale,
      marginBottom: 0, // Preview has no margin-bottom on section title; spacing comes from child mt-*
    },
    summaryText: {
      fontSize: px(11) * scale,
      color: "#374151",
      lineHeight: 1.55,
      marginTop: px(8) * scale, // Matches preview's mt-2 on summary paragraph
    },
    entryContainer: {
      marginTop: px(12) * scale, // Matches preview's mt-3 on entry container
    },
    entry: {
      marginBottom: px(16) * scale * density,
    },
    lastEntry: {
      marginBottom: 0,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start", // react-pdf doesn't support baseline; flex-start is closest
    },
    entryTitleContainer: {
      flex: 1,
      paddingRight: px(8) * scale,
    },
    entryTitle: {
      fontSize: px(12) * scale,
      fontWeight: 600,
      color: "#111827",
      lineHeight: 1.25,
    },
    entrySubtitle: {
      fontSize: px(11) * scale,
      color: "#4b5563",
      marginTop: px(2) * scale,
    },
    entryDate: {
      fontSize: px(10) * scale,
      color: "#6b7280",
    },
    bulletList: {
      marginTop: px(6) * scale,
      paddingLeft: px(18) * scale, // Matches preview's .resume-bullet-list padding-left: 18px
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: px(2) * scale,
    },
    bulletPoint: {
      width: px(10) * scale,
      fontSize: px(11) * scale,
      color: "#374151",
    },
    bulletText: {
      flex: 1,
      fontSize: px(11) * scale,
      color: "#374151",
      lineHeight: 1.5,
    },
    skillContainer: {
      marginTop: px(8) * scale, // Matches preview's mt-2 on skills list
    },
    skillItem: {
      flexDirection: "row",
      marginBottom: px(6) * scale,
      fontSize: px(11) * scale,
    },
    skillCategory: {
      fontWeight: 600,
      color: "#111827",
      marginRight: px(8) * scale,
    },
    skillText: {
      color: "#374151",
      flex: 1,
    },
    projectTech: {
      fontSize: px(10) * scale,
      color: "#6b7280",
      marginTop: px(2) * scale,
    },
    projectUrl: {
      fontSize: px(10) * scale,
      color: "#9ca3af", // text-gray-400
      marginTop: px(2) * scale,
    },
    certContainer: {
      marginTop: px(8) * scale, // Matches preview's mt-2 on cert list
    },
    certItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: px(6) * scale,
      fontSize: px(11) * scale,
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
            <View style={styles.entryContainer}>
              {workExperience.filter(hasContent).map((exp, index, items) => {
                const visibleBullets = getVisibleBullets(exp.description, exp.hiddenBulletIndices);
                return (
                  <View key={exp.id} style={index === items.length - 1 ? [styles.entry, styles.lastEntry] : styles.entry} wrap={false}>
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
          </View>
        )}

        {/* EDUCATION */}
        {hasEdu && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.entryContainer}>
              {education.filter(hasContent).map((edu, index, items) => {
                const visibleBullets = getVisibleBullets(edu.highlights, edu.hiddenBulletIndices);
                const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
                return (
                  <View key={edu.id} style={index === items.length - 1 ? [styles.entry, styles.lastEntry] : styles.entry} wrap={false}>
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
          </View>
        )}

        {/* SKILLS */}
        {hasSkills && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillContainer}>
              {skillCategories.filter((c) => c.skills.trim().length > 0).map((cat, index, items) => (
                <View key={cat.id} style={index === items.length - 1 ? [styles.skillItem, styles.lastEntry] : styles.skillItem}>
                  <Text style={styles.skillCategory}>{cat.name || "Category"}:</Text>
                  <Text style={styles.skillText}><LinkifiedTextPDF text={cat.skills} /></Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PROJECTS */}
        {hasProjects && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <View style={styles.entryContainer}>
              {projects.filter(hasContent).map((proj, index, items) => {
                const visibleBullets = getVisibleBullets(proj.description, proj.hiddenBulletIndices);
                return (
                  <View key={proj.id} style={index === items.length - 1 ? [styles.entry, styles.lastEntry] : styles.entry} wrap={false}>
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
          </View>
        )}

        {/* CERTIFICATIONS */}
        {hasCerts && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.certContainer}>
              {certifications.filter((c) => c.name.trim().length > 0).map((cert, index, items) => (
                <View key={cert.id} style={index === items.length - 1 ? [styles.certItem, styles.lastEntry] : styles.certItem}>
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
          </View>
        )}

      </Page>
    </Document>
  );
}
