"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { P } from "@/lib/palette";
import { PRIORITY_CONFIG } from "@/lib/utils/constants";
import type { TaskWithAgent } from "@/lib/types/task";
import type { Agent } from "@/lib/types/agent";

interface CommandPaletteProps {
  tasks: TaskWithAgent[];
  agents: Agent[];
}

type CommandItem = {
  id: string;
  type: "task" | "agent" | "nav" | "action";
  label: string;
  sublabel?: string;
  icon?: string;
  color?: string;
  gradient?: string;
  slug?: string;
  href?: string;
  action?: () => void;
};

export function CommandPalette({ tasks, agents }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setActiveIndex(0);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const navItems: CommandItem[] = [
    { id: "nav-today", type: "nav", label: "Go to Today", icon: "☀️", href: "/today" },
    { id: "nav-agents", type: "nav", label: "Go to Agents", icon: "🤖", href: "/agents" },
    { id: "nav-completed", type: "nav", label: "Go to Completed", icon: "✅", href: "/completed" },
    { id: "nav-analytics", type: "nav", label: "Go to Analytics", icon: "📈", href: "/analytics" },
    { id: "nav-settings", type: "nav", label: "Go to Settings", icon: "⚙️", href: "/settings" },
  ];

  const taskItems: CommandItem[] = tasks.map((t) => ({
    id: `task-${t.id}`,
    type: "task" as const,
    label: t.title,
    sublabel: `${t.status} ${t.priority !== "normal" ? `· ${PRIORITY_CONFIG[t.priority].label}` : ""}`,
    icon: t.agent?.icon,
    color: t.agent?.color,
    gradient: t.agent?.gradient,
  }));

  const agentItems: CommandItem[] = agents.map((a) => ({
    id: `agent-${a.id}`,
    type: "agent" as const,
    label: a.name,
    sublabel: a.description || "",
    icon: a.icon,
    color: a.color,
    gradient: a.gradient,
    slug: a.slug,
    href: "/agents",
  }));

  const allItems = [...navItems, ...taskItems, ...agentItems];
  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.sublabel?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 12);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      setQuery("");
      if (item.href) router.push(item.href);
      if (item.action) item.action();
    },
    [router]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function handleNav(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        handleSelect(filtered[activeIndex]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleNav);
    return () => window.removeEventListener("keydown", handleNav);
  }, [open, filtered, activeIndex, handleSelect]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[activeIndex] as HTMLElement;
    if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const grouped = {
    nav: filtered.filter((i) => i.type === "nav"),
    task: filtered.filter((i) => i.type === "task"),
    agent: filtered.filter((i) => i.type === "agent"),
  };

  let globalIndex = -1;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        paddingTop: "18vh",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
          animation: "fadeIn 0.15s ease",
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 92vw)",
          maxHeight: 420,
          backgroundColor: P.bg2,
          borderRadius: 16,
          border: `1px solid ${P.border2}`,
          boxShadow: P.shadowFloat,
          position: "relative",
          animation: "modalIn 0.2s cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderBottom: `1px solid ${P.border}`,
          }}
        >
          <span style={{ fontSize: 16, color: P.textTer }}>&#128269;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, agents, or navigate..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              color: P.text,
              backgroundColor: "transparent",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          />
          <kbd
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 5,
              border: `1px solid ${P.border}`,
              color: P.textTer,
              backgroundColor: P.sidebar,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: "auto", padding: "6px" }}>
          {filtered.length === 0 && (
            <div
              style={{
                padding: "30px 0",
                textAlign: "center",
                color: P.textTer,
                fontSize: 14,
              }}
            >
              No results found
            </div>
          )}

          {(["nav", "task", "agent"] as const).map((group) => {
            const items = grouped[group];
            if (items.length === 0) return null;
            const groupLabel =
              group === "nav" ? "Navigate" : group === "task" ? "Tasks" : "Agents";

            return (
              <div key={group}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: P.textGhost,
                    padding: "8px 12px 4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {groupLabel.toUpperCase()}
                </div>
                {items.map((item) => {
                  globalIndex++;
                  const idx = globalIndex;
                  const isActive = idx === activeIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: 10,
                        cursor: "pointer",
                        backgroundColor: isActive ? P.sidebarActive : "transparent",
                        transition: "background-color 0.1s",
                      }}
                    >
                      {item.gradient ? (
                        <AgentAvatar
                          icon={item.icon || ""}
                          color={item.color || ""}
                          gradient={item.gradient}
                          size={24}
                          slug={item.slug}
                        />
                      ) : (
                        <span style={{ fontSize: 15, width: 24, textAlign: "center" }}>
                          {item.icon || "📄"}
                        </span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 550,
                            color: P.text,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: P.textTer,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <span
                          style={{
                            fontSize: 11,
                            color: P.textTer,
                            fontFamily:
                              "'JetBrains Mono', var(--font-mono), monospace",
                          }}
                        >
                          ↵
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: "8px 18px",
            borderTop: `1px solid ${P.border}`,
            display: "flex",
            gap: 14,
            fontSize: 11,
            color: P.textTer,
          }}
        >
          <span>
            <kbd style={{ fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>↑↓</kbd>{" "}
            navigate
          </span>
          <span>
            <kbd style={{ fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>↵</kbd>{" "}
            select
          </span>
          <span>
            <kbd style={{ fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>esc</kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
