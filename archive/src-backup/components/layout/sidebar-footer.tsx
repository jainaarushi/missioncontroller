"use client";

import { P } from "@/lib/palette";

export function SidebarFooter() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      paddingTop: 8, borderTop: `1px solid ${P.border}`,
    }}>
      <kbd style={{
        fontSize: 9, padding: "3px 6px", borderRadius: 5,
        border: `1px solid ${P.border}`, backgroundColor: P.sidebar,
        color: P.textTer,
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
      }}>
        ⌘K
      </kbd>
    </div>
  );
}
