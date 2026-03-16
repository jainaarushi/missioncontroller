"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, FileText, BarChart3, CheckCircle2, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SidebarNavProps {
  reviewCount: number;
  doneTasks?: number;
}

const NAV_ITEMS: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/today", icon: Home, label: "Home" },
  { href: "/agents", icon: Layers, label: "Agents" },
  { href: "/templates", icon: FileText, label: "Templates" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/completed", icon: CheckCircle2, label: "Completed" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function SidebarNav({ reviewCount }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const showBadge = item.href === "/today" && reviewCount > 0;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "10px 6px 8px",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.2s ease",
              textDecoration: "none",
              backgroundColor: isActive ? "rgba(139,61,255,0.15)" : "transparent",
              color: isActive ? "#B794F6" : "rgba(255,255,255,0.4)",
              width: "100%",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              }
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.6} />
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.02em",
            }}>
              {item.label}
            </span>
            {showBadge && (
              <span style={{
                position: "absolute", top: 4, right: 8,
                fontSize: 9, fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(135deg, #FF3399, #f5576c)",
                padding: "2px 6px", borderRadius: 10,
                minWidth: 16, textAlign: "center",
                lineHeight: "14px",
                boxShadow: "0 2px 8px rgba(255,51,153,0.4)",
              }}>
                {reviewCount}
              </span>
            )}
            {isActive && (
              <div style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: 20,
                borderRadius: "0 3px 3px 0",
                background: "linear-gradient(180deg, #8B3DFF, #667eea)",
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
