"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { P, F } from "@/lib/palette";

interface SidebarNavProps {
  reviewCount: number;
  doneTasks?: number;
}

const NAV_ITEMS = [
  { href: "/today", icon: "⚡", label: "Today" },
  { href: "/analytics", icon: "🎯", label: "My Jobs", badgeKey: "review" as const },
  { href: "/templates", icon: "🗂️", label: "Templates" },
  { href: "/agents", icon: "🤝", label: "Specialists" },
  { href: "/completed", icon: "📊", label: "Analytics", disabled: true },
];

export function SidebarNav({ reviewCount }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase" as const,
        color: P.textTer, padding: "10px 10px 5px", fontFamily: F,
      }}>
        Workspace
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.badgeKey === "review" && reviewCount > 0;

          if (item.disabled) {
            return (
              <div
                key={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "8px 10px", borderRadius: 8,
                  fontSize: 12, fontFamily: F,
                  color: P.textTer, opacity: 0.5,
                  cursor: "default", position: "relative",
                }}
              >
                <span style={{ width: 16, textAlign: "center", fontSize: 13 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px", borderRadius: 8,
                cursor: "pointer", fontSize: 12, fontFamily: F,
                position: "relative", textDecoration: "none",
                background: isActive ? "rgba(30,142,62,0.10)" : "transparent",
                color: isActive ? P.lime : P.textSec,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = P.bg3;
                  e.currentTarget.style.color = P.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = P.textSec;
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: "absolute", left: 0, width: 2.5, height: 14,
                  background: P.lime, borderRadius: 100,
                }} />
              )}
              <span style={{ width: 16, textAlign: "center", fontSize: 13 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {showBadge && (
                <span style={{
                  background: P.violet, color: "#fff",
                  fontSize: 9, padding: "1px 6px", borderRadius: 100, fontWeight: 700,
                }}>
                  {reviewCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
