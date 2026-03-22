"use client";

import { useState, useRef } from "react";
import { P } from "@/lib/palette";
import type { AgentInputConfig, InputField } from "@/lib/agent-ui/input-registry";

interface AgentInputFormProps {
  config: AgentInputConfig;
  agentColor: string;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function AgentInputForm({ config, agentColor, values, onChange }: AgentInputFormProps) {
  const update = (id: string, value: unknown) => {
    onChange({ ...values, [id]: value });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {config.fields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={(v) => update(field.id, v)}
          color={agentColor}
        />
      ))}
    </div>
  );
}

function FieldRenderer({ field, value, onChange, color }: {
  field: InputField;
  value: unknown;
  onChange: (v: unknown) => void;
  color: string;
}) {
  const labelStyle = {
    fontSize: 12, fontWeight: 700 as const, color: P.text,
    marginBottom: 5, display: "block" as const,
  };

  const helpStyle = {
    fontSize: 11, color: P.textTer, marginTop: 3,
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 9,
    border: `1.5px solid ${P.border}`, backgroundColor: P.card,
    fontSize: 13, color: P.text, fontFamily: "inherit",
    outline: "none", transition: "border-color 0.2s",
  };

  switch (field.type) {
    case "text":
      return (
        <div>
          <label style={labelStyle}>{field.label}{field.required && <span style={{ color: "#EF4444" }}> *</span>}</label>
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = color; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
          />
          {field.helpText && <div style={helpStyle}>{field.helpText}</div>}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label style={labelStyle}>{field.label}{field.required && <span style={{ color: "#EF4444" }}> *</span>}</label>
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" as const, minHeight: 72 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = color; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
          />
          {field.helpText && <div style={helpStyle}>{field.helpText}</div>}
        </div>
      );

    case "select":
      return (
        <div>
          <label style={labelStyle}>{field.label}</label>
          <select
            value={(value as string) || field.defaultValue || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div>
          <label style={labelStyle}>{field.label}{field.required && <span style={{ color: "#EF4444" }}> *</span>}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {field.options?.map((opt) => {
              const selected = (value || field.defaultValue) === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  style={{
                    padding: "7px 14px", borderRadius: 8,
                    border: `2px solid ${selected ? color : P.border}`,
                    backgroundColor: selected ? color + "10" : P.card,
                    color: selected ? color : P.textSec,
                    fontSize: 12, fontWeight: selected ? 700 : 500,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );

    case "multi-select":
      return <MultiSelect field={field} value={value} onChange={onChange} color={color} />;

    case "slider":
      return <SliderInput field={field} value={value} onChange={onChange} color={color} />;

    case "chips":
      return <ChipsInput field={field} value={value} onChange={onChange} color={color} />;

    case "url-list":
      return <ChipsInput field={field} value={value} onChange={onChange} color={color} />;

    case "file":
      return <FileInput field={field} value={value} onChange={onChange} color={color} />;

    default:
      return null;
  }
}

function MultiSelect({ field, value, onChange, color }: {
  field: InputField; value: unknown; onChange: (v: unknown) => void; color: string;
}) {
  const selected = (value as string[]) || [];
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 5, display: "block" }}>
        {field.label}
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {field.options?.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              style={{
                padding: "6px 12px", borderRadius: 7,
                border: `1.5px solid ${isSelected ? color + "50" : P.border}`,
                backgroundColor: isSelected ? color + "12" : P.card,
                color: isSelected ? color : P.textSec,
                fontSize: 12, fontWeight: isSelected ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              {isSelected ? "✓ " : ""}{opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderInput({ field, value, onChange, color }: {
  field: InputField; value: unknown; onChange: (v: unknown) => void; color: string;
}) {
  const num = (value as number) ?? field.defaultValue ?? field.min ?? 0;

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 5, display: "flex", justifyContent: "space-between" }}>
        <span>{field.label}</span>
        <span style={{ color, fontWeight: 800, fontSize: 14 }}>{num}</span>
      </label>
      <input
        type="range"
        min={field.min} max={field.max} step={field.step}
        value={num}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }}
      />
      {field.helpText && <div style={{ fontSize: 11, color: P.textTer, marginTop: 3 }}>{field.helpText}</div>}
    </div>
  );
}

function ChipsInput({ field, value, onChange, color }: {
  field: InputField; value: unknown; onChange: (v: unknown) => void; color: string;
}) {
  const [input, setInput] = useState("");
  const chips = (value as string[]) || [];

  const addChip = () => {
    const trimmed = input.trim();
    if (trimmed && !chips.includes(trimmed)) {
      onChange([...chips, trimmed]);
      setInput("");
    }
  };

  const removeChip = (chip: string) => {
    onChange(chips.filter((c) => c !== chip));
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 5, display: "block" }}>
        {field.label}{field.required && <span style={{ color: "#EF4444" }}> *</span>}
      </label>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
        padding: "8px 10px", borderRadius: 9,
        border: `1.5px solid ${P.border}`, backgroundColor: P.card,
        minHeight: 38,
      }}>
        {chips.map((chip) => (
          <span key={chip} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 10px", borderRadius: 6,
            backgroundColor: color + "12", color,
            fontSize: 12, fontWeight: 600,
          }}>
            {chip}
            <span onClick={() => removeChip(chip)} style={{ cursor: "pointer", fontSize: 10, opacity: 0.7 }}>✕</span>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addChip(); }
          }}
          placeholder={chips.length === 0 ? field.placeholder : ""}
          style={{
            flex: 1, minWidth: 100, border: "none", outline: "none",
            fontSize: 12, color: P.text, backgroundColor: "transparent",
            fontFamily: "inherit", padding: "2px 0",
          }}
        />
      </div>
      {field.helpText && <div style={{ fontSize: 11, color: P.textTer, marginTop: 3 }}>{field.helpText}</div>}
    </div>
  );
}

function FileInput({ field, value, onChange, color }: {
  field: InputField; value: unknown; onChange: (v: unknown) => void; color: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const fileData = value as { filename: string; textContent: string } | null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large (max 10MB).");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        onChange({ filename: data.file.filename, textContent: data.file.textContent });
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 5, display: "block" }}>
        {field.label}{field.required && <span style={{ color: "#EF4444" }}> *</span>}
      </label>
      <input ref={fileRef} type="file" onChange={handleUpload} style={{ display: "none" }} />
      {fileData ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 12px", borderRadius: 9,
          border: `1.5px solid ${color}20`, backgroundColor: color + "06",
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: P.text, flex: 1 }}>
            {fileData.filename}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: P.textTer, fontSize: 11, fontFamily: "inherit",
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            width: "100%", padding: "20px 16px", borderRadius: 9,
            border: `2px dashed ${P.border}`, backgroundColor: P.sidebar,
            cursor: "pointer", fontFamily: "inherit",
            fontSize: 12, color: P.textSec, fontWeight: 500,
            transition: "all 0.15s",
          }}
        >
          {uploading ? "Uploading..." : "Click to upload a file"}
        </button>
      )}
      {field.helpText && <div style={{ fontSize: 11, color: P.textTer, marginTop: 3 }}>{field.helpText}</div>}
    </div>
  );
}
