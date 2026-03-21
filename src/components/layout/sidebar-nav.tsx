"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { P, F } from "@/lib/palette";

interface SidebarNavProps {
  reviewCount: number;
  doneTasks?: number;
}

const NAV_ITEMS = [
  { href: "/today", icon: "\u25A6", label: "Dashboard" },
  { href: "/agents", icon: "\u263A", label: "Agents", badgeKey: "review" as const },
  { href: "/templates", icon: "\uD83D\uDCC1", label: "Templates" },
  { href: "/analytics", icon: "\uD83D\uDCCA", label: "Analytics" },
  { href: "/settings", icon: "\u2699\uFE0F", label: "Settings" },
];

const BOTTOM_ITEMS = [
  { href: "/help", icon: "\u2753", label: "Help" },
  { action: "logout", icon: "\u2192", label: "Logout" },
];

export function SidebarNav({ reviewCount }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.badgeKey === "review" && reviewCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px",
                borderRadius: 0,
                cursor: "pointer", fontSize: 13, fontFamily: F,
                position: "relative", textDecoration: "none",
                background: isActive ? "rgba(30,142,62,0.08)" : "transparent",
                color: isActive ? "#1e8e3e" : "#4b5563",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "3px solid #22c55e" : "3px solid transparent",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.color = P.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#4b5563";
                }
              }}
            >
              <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {showBadge && (
                <span style={{
                  background: "#1e8e3e", color: "#fff",
                  fontSize: 9, padding: "1px 6px", borderRadius: 100, fontWeight: 700,
                  minWidth: 18, textAlign: "center",
                }}>
                  {reviewCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div style={{
        height: 1, background: P.border, margin: "12px 14px",
      }} />

      {/* Bottom nav items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {BOTTOM_ITEMS.map((item) => {
          if (item.action === "logout") {
            return (
              <div
                key="logout"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px",
                  cursor: "pointer", fontSize: 13, fontFamily: F,
                  color: "#4b5563",
                  borderLeft: "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.color = P.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#4b5563";
                }}
              >
                <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px",
                cursor: "pointer", fontSize: 13, fontFamily: F,
                textDecoration: "none",
                color: "#4b5563",
                borderLeft: "3px solid transparent",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.color = P.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#4b5563";
              }}
            >
              <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
