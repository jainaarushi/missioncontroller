"use client";

import { useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function ArticleOutput({ output, agentColor }: OutputProps) {
  const { headline, subtitle, byline, sections, pullQuotes } = useMemo(() => parseArticle(output), [output]);

  return (
    <div style={{
      fontFamily: "Georgia, 'Times New Roman', serif",
      maxWidth: 680,
    }}>
      {/* Headline */}
      {headline && (
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: P.text,
          lineHeight: 1.2, margin: "0 0 8px",
          letterSpacing: "-0.02em",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}>
          {headline}
        </h1>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p style={{
          fontSize: 17, color: P.textSec, lineHeight: 1.5,
          margin: "0 0 16px", fontStyle: "italic",
        }}>
          {subtitle}
        </p>
      )}

      {/* Byline + divider */}
      {byline && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: agentColor }}>{byline}</div>
          <div style={{ height: 3, width: 48, backgroundColor: agentColor, marginTop: 10, borderRadius: 2 }} />
        </div>
      )}

      {!byline && headline && (
        <div style={{ height: 3, width: 48, backgroundColor: agentColor, marginBottom: 20, borderRadius: 2 }} />
      )}

      {/* Body sections */}
      {sections.map((section, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          {section.heading && (
            <h2 style={{
              fontSize: section.level === 1 ? 22 : 18,
              fontWeight: 700, color: P.text,
              margin: "0 0 10px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              borderBottom: section.level === 1 ? `1px solid ${P.border}` : "none",
              paddingBottom: section.level === 1 ? 8 : 0,
            }}>
              {section.heading}
            </h2>
          )}

          {/* Check for pull quote */}
          {pullQuotes.includes(i) && section.content && (
            <blockquote style={{
              borderLeft: `3px solid ${agentColor}`,
              margin: "16px 0", padding: "12px 20px",
              fontSize: 18, fontStyle: "italic",
              color: agentColor, lineHeight: 1.5,
              backgroundColor: agentColor + "06",
              borderRadius: "0 8px 8px 0",
            }}>
              {section.content.split("\n")[0]}
            </blockquote>
          )}

          <div
            style={{
              fontSize: 15, lineHeight: 1.8, color: P.text,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
            dangerouslySetInnerHTML={{ __html: formatArticle(section.content) }}
          />
        </div>
      ))}
    </div>
  );
}

function formatArticle(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#1e8e3e;text-decoration:underline;text-decoration-color:#1e8e3e33">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #e2e8f0;padding-left:16px;margin:12px 0;color:#64748B;font-style:italic">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin:12px 0">')
    .replace(/^/, '<p style="margin:0">')
    .replace(/$/, '</p>');
}

function parseArticle(output: string): {
  headline: string;
  subtitle: string;
  byline: string;
  sections: Array<{ heading: string; content: string; level: number }>;
  pullQuotes: number[];
} {
  let headline = "";
  let subtitle = "";
  let byline = "";
  const sections: Array<{ heading: string; content: string; level: number }> = [];
  const pullQuotes: number[] = [];

  const lines = output.split("\n");
  let currentHeading = "";
  let currentContent = "";
  let currentLevel = 0;
  let foundFirstHeading = false;

  for (const line of lines) {
    // Detect h1 as headline
    const h1 = line.match(/^# (.+)$/);
    if (h1 && !foundFirstHeading) {
      headline = h1[1].replace(/\*\*/g, "");
      foundFirstHeading = true;
      continue;
    }

    // Detect subtitle (italic line right after headline, before any h2)
    if (foundFirstHeading && !subtitle && sections.length === 0 && !currentHeading) {
      const italicLine = line.match(/^\*(.+)\*$/);
      if (italicLine) {
        subtitle = italicLine[1];
        continue;
      }
      // Detect byline
      const bylineMatch = line.match(/^(?:By|Written by|Author:?)\s+(.+)$/i);
      if (bylineMatch) {
        byline = bylineMatch[1].replace(/\*\*/g, "");
        continue;
      }
    }

    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### (.+)$/);

    if (h1 || h2 || h3) {
      if (currentContent.trim() || currentHeading) {
        sections.push({ heading: currentHeading, content: currentContent.trim(), level: currentLevel });
      }
      currentHeading = (h1?.[1] || h2?.[1] || h3?.[1] || "").replace(/\*\*/g, "");
      currentLevel = h1 ? 1 : h2 ? 1 : 2;
      currentContent = "";
      continue;
    }

    // Detect blockquotes that could be pull quotes
    if (line.startsWith("> ") && line.length > 40) {
      pullQuotes.push(sections.length);
    }

    currentContent += line + "\n";
  }

  if (currentContent.trim() || currentHeading) {
    sections.push({ heading: currentHeading, content: currentContent.trim(), level: currentLevel });
  }

  return { headline, subtitle, byline, sections, pullQuotes };
}
