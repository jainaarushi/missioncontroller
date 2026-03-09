"use client";

import { useState, useRef, useEffect } from "react";
import { P } from "@/lib/palette";

interface NewTaskInputProps {
  onSubmit: (title: string) => void;
}

export function NewTaskInput({ onSubmit }: NewTaskInputProps) {
  const [value, setValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        setShowInput(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    setShowInput(false);
  }

  if (showInput) {
    return (
      <div style={{ marginBottom: 20, animation: "inputReveal 0.25s ease" }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "center",
          padding: "13px 16px", backgroundColor: P.card, borderRadius: 14,
          border: `2px solid ${P.indigo}40`,
          boxShadow: `0 4px 20px ${P.indigo}10`,
        }}>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") { setShowInput(false); setValue(""); }
            }}
            placeholder="What needs to get done?"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 15, color: P.text, backgroundColor: "transparent",
              fontWeight: 500, fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              padding: "7px 16px", borderRadius: 9, border: "none",
              background: P.coralGrad, color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 3px 10px rgba(249,112,102,0.3)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setShowInput(true)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = P.indigo + "40";
        e.currentTarget.style.color = P.textSec;
        e.currentTarget.style.backgroundColor = P.indigoSoft;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = P.border;
        e.currentTarget.style.color = P.textGhost;
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      style={{
        marginBottom: 20, padding: "14px 18px", borderRadius: 14,
        border: `2px dashed ${P.border}`,
        fontSize: 14.5, color: P.textGhost,
        cursor: "pointer", transition: "all 0.2s",
        fontWeight: 500,
      }}
    >
      + Add a new task...
    </div>
  );
}
