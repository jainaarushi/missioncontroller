"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { P } from "@/lib/palette";

interface SidebarNavProps {
  reviewCount: number;
  doneTasks?: number;
}

const NAV_ITEMS = [
  { href: "/today", icon: "☀️", label: "Today" },
  { href: "/agents", icon: "🤖", label: "Agents" },
  { href: "/analytics", icon: "📈", label: "Analytics" },
  { href: "/completed", icon: "✅", label: "Completed" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export function SidebarNav({ reviewCount }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const showBadge = item.href === "/today" && reviewCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.15s",
              textDecoration: "none",
              backgroundColor: isActive ? P.sidebarActive : "transparent",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? P.text : P.textSec,
              fontSize: 14,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.025)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
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
