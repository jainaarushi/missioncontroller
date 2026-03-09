"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { P } from "@/lib/palette";
import { CalendarDays, Bot, BarChart3, CheckCircle2, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SidebarNavProps {
  reviewCount: number;
  doneTasks?: number;
}

const NAV_ITEMS: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/today", icon: CalendarDays, label: "Today" },
  { href: "/agents", icon: Bot, label: "Agents" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/completed", icon: CheckCircle2, label: "Completed" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function SidebarNav({ reviewCount }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.15s",
              textDecoration: "none",
              backgroundColor: isActive ? P.sidebarActive : "transparent",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? P.text : P.textSec,
              fontSize: 13.5,
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? P.text : P.textTer} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {showBadge && (
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: P.coral,
                backgroundColor: P.coral + "12",
                padding: "1px 7px", borderRadius: 6,
                minWidth: 20, textAlign: "center",
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
