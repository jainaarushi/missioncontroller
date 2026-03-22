"use client";

import { useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function DataOutput({ output, agentColor }: OutputProps) {
  const { metrics, tables, textSections } = useMemo(() => parseDataReport(output), [output]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Metric Cards */}
      {metrics.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          {metrics.map((m, i) => (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: 12,
              backgroundColor: agentColor + "08", border: `1.5px solid ${agentColor}15`,
            }}>
              <div style={{ fontSize: 11, color: P.textTer, marginBottom: 4, fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: P.text, letterSpacing: "-0.03em" }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content sections */}
      {textSections.map((section, i) => (
        <div key={`text-${i}`}>
          {section.title && (
            <h3 style={{ fontSize: 15, fontWeight: 700, color: P.text, margin: "0 0 8px" }}>
              {section.title}
            </h3>
          )}
          <div
            style={{ fontSize: 13.5, lineHeight: 1.7, color: P.text }}
            dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
          />
        </div>
      ))}

      {/* Tables */}
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
                      const isNum = /^[\$\-+]?\d/.test(cell.trim());
                      return (
                        <td key={k} style={{
                          padding: "8px 14px", borderBottom: `1px solid ${P.border}`,
                          color: P.text, fontWeight: isNum ? 600 : 400,
                          fontFamily: isNum ? "'JetBrains Mono', var(--font-mono), monospace" : "inherit",
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
    </div>
  );
}

function formatContent(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 5px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:2px 0">$1</li>')
    .replace(/\n\n/g, '<br/><br/>');
}

function parseDataReport(output: string): {
  metrics: Array<{ label: string; value: string }>;
  tables: Array<{ headers: string[]; rows: string[][] }>;
  textSections: Array<{ title: string; content: string }>;
} {
  const metrics: Array<{ label: string; value: string }> = [];
  const tables: Array<{ headers: string[]; rows: string[][] }> = [];
  const textSections: Array<{ title: string; content: string }> = [];

  const lines = output.split("\n");
  let currentTitle = "";
  let currentContent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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

      const headers: string[] = [];
      const rows: string[][] = [];

      // Parse header
      headers.push(...line.split("|").map(c => c.trim()).filter(c => c));
      i++; // Skip separator

      // Parse rows
      while (i + 1 < lines.length && lines[i + 1].includes("|")) {
        i++;
        const cells = lines[i].split("|").map(c => c.trim()).filter(c => c);
        rows.push(cells);
      }

      tables.push({ headers, rows });

      // Extract metrics from small tables (2 columns, few rows)
      if (headers.length === 2 && rows.length <= 8) {
        for (const row of rows) {
          if (row[0] && row[1]) {
            const value = row[1].trim();
            if (/[\d$%]/.test(value)) {
              metrics.push({ label: row[0], value });
            }
          }
        }
      }
      continue;
    }

    currentContent += line + "\n";
  }

  if (currentContent.trim()) {
    textSections.push({ title: currentTitle, content: currentContent.trim() });
  }

  return { metrics: metrics.slice(0, 8), tables, textSections };
}
