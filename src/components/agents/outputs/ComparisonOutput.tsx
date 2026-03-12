"use client";

import { useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function ComparisonOutput({ output, agentColor }: OutputProps) {
  const { swots, tables, textSections } = useMemo(() => parseComparison(output), [output]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Text sections */}
      {textSections.map((section, i) => (
        <div key={`text-${i}`}>
          {section.title && (
            <h2 style={{ fontSize: 16, fontWeight: 800, color: P.text, margin: "0 0 8px" }}>
              {section.title}
            </h2>
          )}
          <div
            style={{ fontSize: 13.5, lineHeight: 1.7, color: P.text }}
            dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
          />
        </div>
      ))}

      {/* Comparison Tables */}
      {tables.map((table, i) => (
        <div key={`table-${i}`} style={{ overflowX: "auto" }}>
          <div style={{ borderRadius: 12, border: `1.5px solid ${P.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ backgroundColor: agentColor + "08" }}>
                  {table.headers.map((h, j) => (
                    <th key={j} style={{
                      padding: "10px 14px", textAlign: "left", fontWeight: 700,
                      color: P.text, borderBottom: `1.5px solid ${P.border}`, fontSize: 12,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, j) => (
                  <tr key={j} style={{ backgroundColor: j % 2 === 0 ? "transparent" : P.sidebar }}>
                    {row.map((cell, k) => {
                      const hasCheck = cell.includes("✓") || cell.includes("Yes") || cell.toLowerCase() === "yes";
                      const hasCross = cell.includes("✗") || cell.includes("No") || cell.toLowerCase() === "no";
                      return (
                        <td key={k} style={{
                          padding: "8px 14px", borderBottom: `1px solid ${P.border}`,
                          color: hasCheck ? "#10B981" : hasCross ? "#EF4444" : P.text,
                          fontWeight: hasCheck || hasCross ? 600 : 400,
                        }}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* SWOT Analyses */}
      {swots.map((swot, i) => (
        <div key={`swot-${i}`}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: P.text, margin: "0 0 10px" }}>
            SWOT: {swot.company}
          </h3>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
          }}>
            <SWOTCard title="Strengths" items={swot.strengths} bgColor="#ECFDF5" borderColor="#A7F3D0" textColor="#065F46" />
            <SWOTCard title="Weaknesses" items={swot.weaknesses} bgColor="#FEF2F2" borderColor="#FECACA" textColor="#991B1B" />
            <SWOTCard title="Opportunities" items={swot.opportunities} bgColor="#EFF6FF" borderColor="#BFDBFE" textColor="#1E40AF" />
            <SWOTCard title="Threats" items={swot.threats} bgColor="#FFF7ED" borderColor="#FED7AA" textColor="#9A3412" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SWOTCard({ title, items, bgColor, borderColor, textColor }: {
  title: string; items: string[]; bgColor: string; borderColor: string; textColor: string;
}) {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 10,
      backgroundColor: bgColor, border: `1.5px solid ${borderColor}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: textColor, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {title}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ fontSize: 12, color: textColor, lineHeight: 1.5, marginBottom: 2 }}>
          - {item}
        </div>
      ))}
      {items.length === 0 && (
        <div style={{ fontSize: 12, color: textColor + "80", fontStyle: "italic" }}>No data</div>
      )}
    </div>
  );
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/\n\n/g, '<br/><br/>');
}

function parseComparison(output: string) {
  const tables: Array<{ headers: string[]; rows: string[][] }> = [];
  const swots: Array<{ company: string; strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }> = [];
  const textSections: Array<{ title: string; content: string }> = [];

  const lines = output.split("\n");
  let currentTitle = "";
  let currentContent = "";
  let inSwot = false;
  let currentSwot: { company: string; strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] } | null = null;
  let currentSwotSection = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect SWOT sections
    if (/swot/i.test(line) && /#{1,3}/.test(line)) {
      if (currentContent.trim()) {
        textSections.push({ title: currentTitle, content: currentContent.trim() });
        currentContent = "";
      }
      if (currentSwot) swots.push(currentSwot);
      const company = line.replace(/^#+\s*/, "").replace(/SWOT\s*(Analysis)?:?\s*/i, "").replace(/\*\*/g, "").trim();
      currentSwot = { company, strengths: [], weaknesses: [], opportunities: [], threats: [] };
      inSwot = true;
      continue;
    }

    if (inSwot && currentSwot) {
      const sectionMatch = line.match(/^(?:#+\s*)?(?:\*\*)?(strengths?|weaknesses?|opportunities?|threats?)(?:\*\*)?:?\s*$/i);
      if (sectionMatch) {
        const s = sectionMatch[1].toLowerCase();
        currentSwotSection = s.startsWith("s") ? "strengths" : s.startsWith("w") ? "weaknesses" : s.startsWith("o") ? "opportunities" : "threats";
        continue;
      }

      if (currentSwotSection && /^[-•*]\s/.test(line)) {
        const item = line.replace(/^[-•*]\s+/, "").replace(/\*\*/g, "").trim();
        if (item) (currentSwot as unknown as Record<string, string[]>)[currentSwotSection].push(item);
        continue;
      }

      // End of SWOT when hitting a new heading
      if (/^#{1,3}\s/.test(line) && !/swot/i.test(line)) {
        swots.push(currentSwot);
        currentSwot = null;
        inSwot = false;
        // Fall through to handle this heading normally
      } else {
        continue;
      }
    }

    // Detect heading
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (currentContent.trim()) {
        textSections.push({ title: currentTitle, content: currentContent.trim() });
      }
      currentTitle = heading[1].replace(/\*\*/g, "");
      currentContent = "";
      continue;
    }

    // Detect table
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      if (currentContent.trim()) {
        textSections.push({ title: currentTitle, content: currentContent.trim() });
        currentContent = "";
      }
      const headers = line.split("|").map(c => c.trim()).filter(c => c);
      const rows: string[][] = [];
      i++;
      while (i + 1 < lines.length && lines[i + 1].includes("|")) {
        i++;
        rows.push(lines[i].split("|").map(c => c.trim()).filter(c => c));
      }
      tables.push({ headers, rows });
      continue;
    }

    currentContent += line + "\n";
  }

  if (currentSwot) swots.push(currentSwot);
  if (currentContent.trim()) {
    textSections.push({ title: currentTitle, content: currentContent.trim() });
  }

  return { swots, tables, textSections };
}
