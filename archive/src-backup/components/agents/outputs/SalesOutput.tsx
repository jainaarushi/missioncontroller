"use client";

import { useState, useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function SalesOutput({ output, agentColor }: OutputProps) {
  const { emails, companyInfo, sections } = useMemo(() => parseSalesReport(output), [output]);
  const [activeEmail, setActiveEmail] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyEmail = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Company Info Card */}
      {companyInfo && (
        <div style={{
          padding: "16px 20px", borderRadius: 14,
          backgroundColor: agentColor + "06", border: `1.5px solid ${agentColor}20`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: agentColor, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Company Snapshot
          </div>
          <div
            style={{ fontSize: 13, lineHeight: 1.7, color: P.text }}
            dangerouslySetInnerHTML={{ __html: formatContent(companyInfo) }}
          />
        </div>
      )}

      {/* Email Sequence */}
      {emails.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: P.text, margin: "0 0 10px" }}>Email Sequence</h3>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {emails.map((email, i) => (
              <button
                key={i}
                onClick={() => setActiveEmail(i)}
                style={{
                  padding: "7px 14px", borderRadius: 8,
                  border: `2px solid ${activeEmail === i ? agentColor : P.border}`,
                  backgroundColor: activeEmail === i ? agentColor + "10" : P.card,
                  color: activeEmail === i ? agentColor : P.textSec,
                  fontSize: 12, fontWeight: activeEmail === i ? 700 : 400,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {email.label || `Email ${i + 1}`}
              </button>
            ))}
          </div>

          {/* Active Email */}
          {emails[activeEmail] && (
            <div style={{
              borderRadius: 12, border: `1.5px solid ${P.border}`,
              overflow: "hidden",
            }}>
              {/* Subject line */}
              {emails[activeEmail].subject && (
                <div style={{
                  padding: "10px 16px", backgroundColor: P.sidebar,
                  borderBottom: `1px solid ${P.border}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: P.textTer }}>Subject:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{emails[activeEmail].subject}</span>
                </div>
              )}

              {/* Body */}
              <div style={{ padding: "14px 16px", backgroundColor: P.card }}>
                <div style={{
                  fontSize: 13, lineHeight: 1.7, color: P.text, whiteSpace: "pre-wrap",
                }}>
                  {emails[activeEmail].body}
                </div>
              </div>

              {/* Copy button */}
              <div style={{
                padding: "8px 16px", backgroundColor: P.sidebar,
                borderTop: `1px solid ${P.border}`,
                display: "flex", justifyContent: "flex-end",
              }}>
                <button
                  onClick={() => copyEmail(
                    (emails[activeEmail].subject ? `Subject: ${emails[activeEmail].subject}\n\n` : "") +
                    emails[activeEmail].body,
                    activeEmail,
                  )}
                  style={{
                    padding: "5px 12px", borderRadius: 7,
                    border: `1.5px solid ${agentColor}30`,
                    backgroundColor: agentColor + "08",
                    color: agentColor, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {copiedIndex === activeEmail ? "Copied!" : "Copy Email"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Sections */}
      {sections.map((section, i) => (
        <div key={i}>
          {section.title && (
            <h3 style={{ fontSize: 14, fontWeight: 700, color: P.text, margin: "0 0 8px" }}>
              {section.title}
            </h3>
          )}
          <div
            style={{ fontSize: 13.5, lineHeight: 1.7, color: P.text }}
            dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
          />
        </div>
      ))}
    </div>
  );
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/\n\n/g, '<br/><br/>');
}

function parseSalesReport(output: string) {
  const emails: Array<{ label: string; subject: string; body: string }> = [];
  let companyInfo: string | null = null;
  const sections: Array<{ title: string; content: string }> = [];

  const allSections = output.split(/^##\s+/gm).filter(Boolean);

  for (const section of allSections) {
    const lines = section.split("\n");
    const title = (lines[0] || "").replace(/\*\*/g, "").trim();
    const content = lines.slice(1).join("\n").trim();

    // Detect company snapshot
    if (/company\s*snapshot|company\s*overview|prospect\s*profile/i.test(title)) {
      companyInfo = content;
      continue;
    }

    // Detect email sections
    if (/email\s*\d|cold\s*email|follow.?up|initial\s*outreach|breakup|sequence/i.test(title)) {
      // Try to find individual emails within
      const emailBlocks = content.split(/(?=(?:###?\s*)?(?:Email\s*\d|Subject|Initial|Follow|Breakup))/i).filter(b => b.trim());

      if (emailBlocks.length > 1) {
        for (const block of emailBlocks) {
          const subjectMatch = block.match(/subject(?:\s*line)?:\s*(.+)/i);
          const bodyLines = block.split("\n").filter(l =>
            !l.match(/^#+/) && !l.match(/^subject/i) && l.trim()
          );
          emails.push({
            label: block.match(/^(?:###?\s*)?(.+)/)?.[1]?.replace(/\*\*/g, "").trim().slice(0, 30) || `Email ${emails.length + 1}`,
            subject: subjectMatch?.[1]?.replace(/\*\*/g, "").trim() || "",
            body: bodyLines.join("\n").trim(),
          });
        }
      } else {
        const subjectMatch = content.match(/subject(?:\s*line)?:\s*(.+)/i);
        const bodyLines = content.split("\n").filter(l =>
          !l.match(/^subject/i) && l.trim()
        );
        emails.push({
          label: title.slice(0, 30),
          subject: subjectMatch?.[1]?.replace(/\*\*/g, "").trim() || "",
          body: bodyLines.join("\n").trim(),
        });
      }
      continue;
    }

    sections.push({ title, content });
  }

  return { emails, companyInfo, sections };
}
