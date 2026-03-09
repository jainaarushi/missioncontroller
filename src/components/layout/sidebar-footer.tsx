"use client";

import { P } from "@/lib/palette";

export function SidebarFooter() {
  return (
    <div style={{ padding: "12px 10px 4px", borderTop: `1px solid ${P.border}` }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
      }}>
        <kbd style={{
          fontSize: 10, padding: "2px 5px", borderRadius: 4,
          border: `1px solid ${P.border}`, backgroundColor: P.sidebar,
          color: P.textTer,
          fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
        }}>
          ⌘K
        </kbd>
        <span style={{ fontSize: 10.5, color: P.textGhost }}>Search</span>
      </div>
    </div>
  );
}
