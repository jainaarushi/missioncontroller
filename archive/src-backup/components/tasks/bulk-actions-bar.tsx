"use client";

import { P } from "@/lib/palette";
import type { TaskPriority } from "@/lib/types/task";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkPriority: (priority: TaskPriority) => void;
  onBulkMove: (section: "today" | "week" | "later") => void;
  loading: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkPriority,
  onBulkMove,
  loading,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 400, animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 14,
        backgroundColor: P.text, color: "#fff",
        boxShadow: P.shadowFloat,
        fontSize: 13, fontWeight: 600,
        opacity: loading ? 0.7 : 1,
      }}>
        <span style={{
          backgroundColor: P.indigo, padding: "2px 8px",
          borderRadius: 6, fontSize: 12, fontWeight: 700,
        }}>
          {selectedCount}
        </span>
        <span>selected</span>

        <div style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.2)", margin: "0 4px" }} />

        {/* Priority dropdown */}
        <div style={{ position: "relative" }}>
          <select
            onChange={(e) => {
              if (e.target.value) onBulkPriority(e.target.value as TaskPriority);
              e.target.value = "";
            }}
            defaultValue=""
            disabled={loading}
            style={{
              padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.1)", color: "#fff",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", outline: "none",
              appearance: "none", WebkitAppearance: "none",
              paddingRight: 24,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            <option value="" disabled>Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Move dropdown */}
        <div style={{ position: "relative" }}>
          <select
            onChange={(e) => {
              if (e.target.value) onBulkMove(e.target.value as "today" | "week" | "later");
              e.target.value = "";
            }}
            defaultValue=""
            disabled={loading}
            style={{
              padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.1)", color: "#fff",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", outline: "none",
              appearance: "none", WebkitAppearance: "none",
              paddingRight: 24,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
            }}
          >
            <option value="" disabled>Move to</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="later">Later</option>
          </select>
        </div>

        {/* Delete */}
        <button
          onClick={onBulkDelete}
          disabled={loading}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "none",
            backgroundColor: "#DC2626", color: "#fff",
            fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EF4444"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#DC2626"; }}
        >
          Delete
        </button>

        <div style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.2)", margin: "0 4px" }} />

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          style={{
            padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
            backgroundColor: "transparent", color: "rgba(255,255,255,0.7)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
