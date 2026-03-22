"use client";

import { useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function ResearchOutput({ output, agentColor }: OutputProps) {
  const { sections, sources } = useMemo(() => parseResearch(output), [output]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Table of Contents */}
      {sections.length > 2 && (
        <div style={{
          padding: "14px 18px", borderRadius: 12,
          backgroundColor: agentColor + "06", border: `1.5px solid ${agentColor}20`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: agentColor, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Contents
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sections.filter(s => s.level <= 2).map((s, i) => (
              <div key={i} style={{
                fontSize: 12.5, color: P.textSec, paddingLeft: s.level === 2 ? 16 : 0,
                cursor: "pointer",
              }}
                onClick={() => {
                  document.getElementById(`research-section-${i}`)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {s.level === 2 ? "→ " : ""}{s.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {sections.map((section, i) => (
        <div key={i} id={`research-section-${i}`}>
          {section.isCallout ? (
            <CalloutBox content={section.content} color={agentColor} title={section.title} />
          ) : (
            <div>
              {section.title && (
                <h2 style={{
                  fontSize: section.level === 1 ? 20 : section.level === 2 ? 16 : 14,
                  fontWeight: section.level <= 2 ? 800 : 700,
                  color: P.text,
                  margin: "0 0 8px",
                  letterSpacing: "-0.02em",
                }}>
                  {section.title}
                </h2>
              )}
              <div
                style={{ fontSize: 13.5, lineHeight: 1.75, color: P.text }}
                dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Sources */}
      {sources.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: P.text, marginBottom: 12 }}>Sources</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {sources.map((source, i) => (
              <SourceCard key={i} source={source} index={i + 1} color={agentColor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CalloutBox({ content, color, title }: { content: string; color: string; title: string }) {
  return (
    <div style={{
      padding: "16px 20px", borderRadius: 12,
      backgroundColor: color + "08",
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {title}
      </div>
      <div
        style={{ fontSize: 13.5, lineHeight: 1.7, color: P.text }}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
}

function SourceCard({ source, index, color }: { source: { title: string; url: string }; index: number; color: string }) {
  const domain = (() => {
    try { return new URL(source.url).hostname.replace("www.", ""); }
    catch { return source.url; }
  })();

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", gap: 10, padding: "10px 14px", borderRadius: 10,
        border: `1.5px solid ${P.border}`, backgroundColor: P.card,
        textDecoration: "none", transition: "border-color 0.2s",
      }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = color + "40"; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = P.border; }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 6, backgroundColor: color + "15",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color, flexShrink: 0,
      }}>
        {index}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600, color: P.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {source.title}
        </div>
        <div style={{ fontSize: 11, color: P.textTer, marginTop: 2 }}>{domain}</div>
      </div>
    </a>
  );
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#1e8e3e;text-decoration:none;font-weight:500">$1</a>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/\n\n/g, '<br/><br/>');
}

function parseResearch(output: string): {
  sections: Array<{ title: string; content: string; level: number; isCallout: boolean }>;
  sources: Array<{ title: string; url: string }>;
} {
  const sections: Array<{ title: string; content: string; level: number; isCallout: boolean }> = [];
  const sources: Array<{ title: string; url: string }> = [];

  // Extract URLs as sources
  const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(output)) !== null) {
    const m = match;
    if (!sources.find(s => s.url === m[2])) {
      sources.push({ title: m[1], url: m[2] });
    }
  }

  // Split into sections by headings
  const lines = output.split("\n");
  let currentTitle = "";
  let currentContent = "";
  let currentLevel = 0;

  for (const line of lines) {
    const h1 = line.match(/^# (.+)$/);
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);

    if (h1 || h2 || h3) {
      if (currentContent.trim() || currentTitle) {
        const isCallout = /key (takeaway|finding|insight)|executive summary|highlights/i.test(currentTitle);
        sections.push({ title: currentTitle, content: currentContent.trim(), level: currentLevel, isCallout });
      }
      currentTitle = (h1?.[1] || h2?.[1] || h3?.[1] || "").replace(/\*\*/g, "");
      currentLevel = h1 ? 1 : h2 ? 2 : 3;
      currentContent = "";
    } else {
      currentContent += line + "\n";
    }
  }

  if (currentContent.trim() || currentTitle) {
    const isCallout = /key (takeaway|finding|insight)|executive summary|highlights/i.test(currentTitle);
    sections.push({ title: currentTitle, content: currentContent.trim(), level: currentLevel, isCallout });
  }

  return { sections, sources };
}
