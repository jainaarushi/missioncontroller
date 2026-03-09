"use client";

import { P } from "@/lib/palette";

interface SidebarFooterProps {
  stats: {
    working: number;
    review: number;
    spent: number;
  };
}

export function SidebarFooter({ stats }: SidebarFooterProps) {
  const items = [
    { label: "Working", value: stats.working, color: P.indigo, mono: false },
    { label: "Review", value: stats.review, color: P.coral, mono: false },
    { label: "Spent", value: `$${stats.spent.toFixed(2)}`, color: null, mono: true },
  ];

  return (
    <div style={{ padding: "12px 10px 4px", borderTop: `1px solid ${P.border}` }}>
      {items.map((s) => (
        <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 11.5, color: P.textTer }}>{s.label}</span>
          <span style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: s.color || P.text,
            fontFamily: s.mono ? "'JetBrains Mono', var(--font-mono), monospace" : "inherit",
          }}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
