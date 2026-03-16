"use client";

import { useState } from "react";
import { P } from "@/lib/palette";

interface AgentCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const ICON_OPTIONS = ["🤖", "🧠", "🔬", "🎯", "💡", "🛠️", "📝", "🎨", "🔍", "⚡", "🌐", "🏗️"];
const COLOR_OPTIONS = [
  { color: "#6366F1", gradient: "linear-gradient(135deg, #6366F1, #818CF8)" },
  { color: "#EC4899", gradient: "linear-gradient(135deg, #EC4899, #F472B6)" },
  { color: "#10B981", gradient: "linear-gradient(135deg, #10B981, #34D399)" },
  { color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B, #FBBF24)" },
  { color: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)" },
  { color: "#EF4444", gradient: "linear-gradient(135deg, #EF4444, #F87171)" },
  { color: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4, #22D3EE)" },
  { color: "#F97316", gradient: "linear-gradient(135deg, #F97316, #FB923C)" },
];
const MODEL_OPTIONS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", desc: "Fast & capable" },
  { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", desc: "Fastest & cheapest" },
];

export function AgentCreateModal({ open, onClose, onCreated }: AgentCreateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [icon, setIcon] = useState("🤖");
  const [colorIdx, setColorIdx] = useState(0);
  const [model, setModel] = useState(MODEL_OPTIONS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const selectedColor = COLOR_OPTIONS[colorIdx];

  async function handleCreate() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!systemPrompt.trim()) {
      setError("System prompt is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
          description: description.trim() || null,
          long_description: longDescription.trim() || null,
          icon,
          color: selectedColor.color,
          gradient: selectedColor.gradient,
          system_prompt: systemPrompt.trim(),
          model,
        }),
      });

      if (!res.ok) throw new Error("Failed to create agent");

      onCreated();
      onClose();
      // Reset form
      setName("");
      setDescription("");
      setLongDescription("");
      setSystemPrompt("");
      setIcon("🤖");
      setColorIdx(0);
      setModel(MODEL_OPTIONS[0].value);
    } catch {
      setError("Failed to create agent. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        display: "flex", justifyContent: "center", alignItems: "center",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(24,24,27,0.35)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }} />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 95vw)", maxHeight: "85vh", overflowY: "auto",
          backgroundColor: P.card, borderRadius: 20,
          boxShadow: P.shadowFloat, position: "relative",
          animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Top accent */}
        <div style={{ height: 5, background: selectedColor.gradient, borderRadius: "20px 20px 0 0" }} />

        <div style={{ padding: "26px 30px 30px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: P.text, margin: 0, letterSpacing: "-0.02em" }}>
              Create Agent
            </h2>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10,
                border: `1px solid ${P.border}`, backgroundColor: P.card,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16, color: P.textTer,
              }}
            >
              ×
            </button>
          </div>

          {/* Preview */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 24,
            padding: "16px", borderRadius: 14, backgroundColor: P.sidebar,
            border: `1px solid ${P.border}`,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: selectedColor.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              boxShadow: `0 4px 12px ${selectedColor.color}30`,
            }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: P.text }}>
                {name || "Agent Name"}
              </div>
              <div style={{ fontSize: 12.5, color: P.textTer }}>
                {description || "Agent description"}
              </div>
            </div>
          </div>

          {/* Icon picker */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: P.textSec, display: "block", marginBottom: 8 }}>
              Icon
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  style={{
                    width: 38, height: 38, borderRadius: 10, border: `2px solid ${icon === ic ? selectedColor.color : P.border}`,
                    backgroundColor: icon === ic ? selectedColor.color + "12" : P.card,
                    fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: P.textSec, display: "block", marginBottom: 8 }}>
              Color
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {COLOR_OPTIONS.map((c, i) => (
                <button
                  key={c.color}
                  onClick={() => setColorIdx(i)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: c.gradient, border: `3px solid ${colorIdx === i ? c.color : "transparent"}`,
                    cursor: "pointer", transition: "all 0.15s",
                    boxShadow: colorIdx === i ? `0 0 0 2px ${P.card}, 0 0 0 4px ${c.color}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: P.textSec, display: "block", marginBottom: 6 }}>
              Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Strategist"
              maxLength={100}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: `1.5px solid ${P.border}`, fontSize: 14, color: P.text,
                fontFamily: "inherit", outline: "none", backgroundColor: P.card,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = selectedColor.color + "60"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
            />
          </div>

          {/* Short description */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: P.textSec, display: "block", marginBottom: 6 }}>
              Short Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Strategy & Planning"
              maxLength={500}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: `1.5px solid ${P.border}`, fontSize: 14, color: P.text,
                fontFamily: "inherit", outline: "none", backgroundColor: P.card,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = selectedColor.color + "60"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
            />
          </div>

          {/* Long description */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: P.textSec, display: "block", marginBottom: 6 }}>
              Detailed Description
            </label>
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="What does this agent specialize in? What tasks is it best for?"
              rows={2}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: `1.5px solid ${P.border}`, fontSize: 14, color: P.text,
                fontFamily: "inherit", outline: "none", backgroundColor: P.card,
                resize: "vertical", lineHeight: 1.5,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = selectedColor.color + "60"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
            />
          </div>

          {/* System prompt */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: P.textSec, display: "block", marginBottom: 6 }}>
              System Prompt *
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={`You are [Agent Name], a specialist in [domain].\n\nRules:\n- ...\n- ...\n\nWhen working, follow this process:\n1. ...\n2. ...`}
              rows={6}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: `1.5px solid ${P.border}`, fontSize: 13, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                outline: "none", backgroundColor: P.sidebar, resize: "vertical",
                lineHeight: 1.6,
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = selectedColor.color + "60"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
            />
            <div style={{ fontSize: 11, color: P.textTer, marginTop: 4 }}>
              {systemPrompt.length}/10,000 characters
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
              fontSize: 13, color: "#F87171", marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleCreate}
              disabled={loading}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 12, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: selectedColor.gradient, color: "#fff",
                fontSize: 15, fontWeight: 700, fontFamily: "inherit",
                boxShadow: `0 4px 16px ${selectedColor.color}30`,
                transition: "all 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Creating..." : "Create Agent"}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "13px 24px", borderRadius: 12,
                border: `1.5px solid ${P.border}`, backgroundColor: P.card,
                color: P.text, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
