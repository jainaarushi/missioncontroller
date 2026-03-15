"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { P } from "@/lib/palette";
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
    <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
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
              gap: 3,
              padding: "10px 6px 8px",
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.15s",
              textDecoration: "none",
              backgroundColor: isActive ? P.sidebarActive : "transparent",
              color: isActive ? P.indigo : P.textTer,
              width: "100%",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.6} />
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.01em",
            }}>
              {item.label}
            </span>
            {showBadge && (
              <span style={{
                position: "absolute", top: 6, right: 10,
                fontSize: 9, fontWeight: 700,
                color: "#fff",
                backgroundColor: P.coral,
                padding: "1px 5px", borderRadius: 10,
                minWidth: 16, textAlign: "center",
                lineHeight: "14px",
              }}>
                {reviewCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
