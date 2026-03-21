"use client";

import { useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function TravelOutput({ output, agentColor }: OutputProps) {
  const { days, otherSections } = useMemo(() => parseTravelPlan(output), [output]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Day Cards */}
      {days.map((day, i) => (
        <DayCard key={i} day={day} index={i} color={agentColor} />
      ))}

      {/* Other sections (budget, packing, tips) */}
      {otherSections.map((section, i) => (
        <div key={i}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: P.text, margin: "0 0 8px" }}>
            {section.title}
          </h3>
          <div
            style={{ fontSize: 13, lineHeight: 1.7, color: P.text }}
            dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
          />
        </div>
      ))}
    </div>
  );
}

function DayCard({ day, index, color }: { day: { title: string; activities: string[] }; index: number; color: string }) {
  const pastelColors = ["#F5D5E0", "#E8D5F5", "#F5E6D5", "#D5F5E8", "#D5E8F5", "#F5F0D5", "#F5D5D5"];
  const bgColor = pastelColors[index % pastelColors.length];

  return (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      border: `1.5px solid ${P.border}`,
    }}>
      <div style={{
        padding: "12px 18px", backgroundColor: bgColor,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: color,
        }}>
          {index + 1}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: P.text }}>{day.title}</div>
      </div>
      <div style={{ padding: "12px 18px", backgroundColor: P.card }}>
        {day.activities.map((activity, j) => (
          <div key={j} style={{
            padding: "8px 0",
            borderBottom: j < day.activities.length - 1 ? `1px solid ${P.border}` : "none",
            fontSize: 13, lineHeight: 1.6, color: P.text,
          }}
            dangerouslySetInnerHTML={{ __html: formatContent(activity) }}
          />
        ))}
      </div>
    </div>
  );
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#1e8e3e;text-decoration:none">$1</a>')
    .replace(/^- (.+)$/gm, '<div style="padding-left:12px;position:relative"><span style="position:absolute;left:0">-</span> $1</div>')
    .replace(/\$[\d,.]+/g, '<span style="font-weight:600;color:#059669">$&</span>')
    .replace(/\n\n/g, '<br/>');
}

function parseTravelPlan(output: string): {
  days: Array<{ title: string; activities: string[] }>;
  otherSections: Array<{ title: string; content: string }>;
} {
  const days: Array<{ title: string; activities: string[] }> = [];
  const otherSections: Array<{ title: string; content: string }> = [];

  const sections = output.split(/^##\s+/gm).filter(Boolean);

  for (const section of sections) {
    const lines = section.split("\n");
    const title = (lines[0] || "").replace(/\*\*/g, "").trim();
    const content = lines.slice(1).join("\n").trim();

    // Check if this is a day section
    if (/^day\s+\d/i.test(title) || /^(morning|afternoon|evening)/i.test(title)) {
      const activities = content.split(/\n(?=[-•*]|\d+\.)/).filter(a => a.trim());
      days.push({ title, activities });
    } else if (title) {
      otherSections.push({ title, content });
    }
  }

  // If no day sections found, try h3 headings
  if (days.length === 0) {
    const h3Sections = output.split(/^###\s+/gm).filter(Boolean);
    for (const section of h3Sections) {
      const lines = section.split("\n");
      const title = (lines[0] || "").replace(/\*\*/g, "").trim();
      const content = lines.slice(1).join("\n").trim();

      if (/^day\s+\d/i.test(title)) {
        const activities = content.split(/\n(?=[-•*]|\d+\.)/).filter(a => a.trim());
        days.push({ title, activities });
      }
    }
  }

  return { days, otherSections };
}
