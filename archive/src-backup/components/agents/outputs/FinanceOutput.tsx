"use client";

import { useMemo } from "react";
import { P } from "@/lib/palette";

interface OutputProps {
  output: string;
  agentColor: string;
}

export default function FinanceOutput({ output, agentColor }: OutputProps) {
  const sections = useMemo(() => parseSections(output), [output]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {sections.map((section, i) => (
        <div key={i}>
          {section.type === "metric-cards" ? (
            <MetricCards metrics={section.data} color={agentColor} />
          ) : section.type === "table" ? (
            <StyledTable rows={section.data} color={agentColor} />
          ) : section.type === "recommendation" ? (
            <RecommendationBadge text={section.data} color={agentColor} />
          ) : (
            <MarkdownSection content={section.data} />
          )}
        </div>
      ))}
    </div>
  );
}

function MetricCards({ metrics, color }: { metrics: Array<{ label: string; value: string; change?: string }>; color: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
      {metrics.map((m, i) => {
        const isPositive = m.change?.startsWith("+") || m.change?.includes("up");
        const isNegative = m.change?.startsWith("-") || m.change?.includes("down");
        return (
          <div key={i} style={{
            padding: "14px 16px", borderRadius: 12,
            backgroundColor: color + "08", border: `1.5px solid ${color}20`,
          }}>
            <div style={{ fontSize: 11, color: P.textTer, marginBottom: 4, fontWeight: 500 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: P.text, letterSpacing: "-0.03em" }}>{m.value}</div>
            {m.change && (
              <div style={{
                fontSize: 11, fontWeight: 600, marginTop: 4,
                color: isPositive ? "#10B981" : isNegative ? "#EF4444" : P.textTer,
              }}>
                {m.change}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StyledTable({ rows, color }: { rows: string[][]; color: string }) {
  if (rows.length === 0) return null;
  const headers = rows[0];
  const body = rows.slice(1);

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: `1.5px solid ${P.border}` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ backgroundColor: color + "08" }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "10px 14px", textAlign: "left", fontWeight: 700,
                color: P.text, borderBottom: `1.5px solid ${P.border}`,
                fontSize: 12,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "transparent" : P.sidebar }}>
              {row.map((cell, j) => {
                const isNum = /^[\$\-+]?\d/.test(cell.trim());
                const isPositive = cell.includes("+") || cell.toLowerCase().includes("buy") || cell.toLowerCase().includes("strong");
                const isNegative = cell.includes("-") && isNum;
                return (
                  <td key={j} style={{
                    padding: "9px 14px",
                    borderBottom: `1px solid ${P.border}`,
                    color: isPositive ? "#10B981" : isNegative ? "#EF4444" : P.text,
                    fontWeight: isNum ? 600 : 400,
                    fontFamily: isNum ? "'JetBrains Mono', var(--font-mono), monospace" : "inherit",
                    fontSize: 12.5,
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
  );
}

function RecommendationBadge({ text, color }: { text: string; color: string }) {
  const lower = text.toLowerCase();
  const isBuy = lower.includes("buy") || lower.includes("bullish");
  const isSell = lower.includes("sell") || lower.includes("bearish");
  const badgeColor = isBuy ? "#10B981" : isSell ? "#EF4444" : color;

  return (
    <div style={{
      padding: "16px 20px", borderRadius: 14,
      backgroundColor: badgeColor + "10", border: `2px solid ${badgeColor}30`,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: badgeColor + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {isBuy ? "↗" : isSell ? "↘" : "→"}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: badgeColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Recommendation
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: P.text, marginTop: 2 }}>{text}</div>
      </div>
    </div>
  );
}

function MarkdownSection({ content }: { content: string }) {
  // Simple markdown rendering for non-structured sections
  const html = content
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;margin:16px 0 8px;color:#1a1a2e">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:800;margin:20px 0 10px;color:#1a1a2e">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:800;margin:24px 0 12px;color:#1a1a2e">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
    .replace(/\n\n/g, '<br/><br/>');

  return (
    <div
      style={{ fontSize: 13.5, lineHeight: 1.7, color: P.text }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Parse the markdown output into renderable sections
function parseSections(output: string): Array<{ type: string; data: any }> {
  const sections: Array<{ type: string; data: any }> = [];
  const lines = output.split("\n");
  let currentText = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect markdown table
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      if (currentText.trim()) {
        sections.push({ type: "text", data: currentText.trim() });
        currentText = "";
      }

      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        if (!lines[i].includes("---")) {
          const cells = lines[i].split("|").map(c => c.trim()).filter(c => c);
          tableRows.push(cells);
        }
        i++;
      }
      i--;
      sections.push({ type: "table", data: tableRows });
      continue;
    }

    // Detect recommendation lines
    if (/^(recommendation|bottom line|verdict|rating)/i.test(line.replace(/^#+\s*/, "").replace(/\*\*/g, ""))) {
      if (currentText.trim()) {
        sections.push({ type: "text", data: currentText.trim() });
        currentText = "";
      }
      // Gather the recommendation text
      const recText = lines.slice(i, i + 3).join(" ").replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
      sections.push({ type: "recommendation", data: recText });
      i += 2;
      continue;
    }

    currentText += line + "\n";
  }

  if (currentText.trim()) {
    sections.push({ type: "text", data: currentText.trim() });
  }

  return sections;
}
