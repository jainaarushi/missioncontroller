"use client";

import { useState, useCallback } from "react";
import { P } from "@/lib/palette";
import type { AgentInputConfig, InputField } from "@/lib/agent-ui/input-registry";

interface AgentInputFormProps {
  config: AgentInputConfig;
  agentColor: string;
  onValuesChange: (values: Record<string, unknown>) => void;
  values: Record<string, unknown>;
}

export function AgentInputForm({ config, agentColor, onValuesChange, values }: AgentInputFormProps) {
  const setValue = useCallback((id: string, val: unknown) => {
    onValuesChange({ ...values, [id]: val });
  }, [values, onValuesChange]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {config.fields.map((field) => (
        <div key={field.id} style={{ width: field.fullWidth ? "100%" : undefined }}>
          <FieldRenderer
            field={field}
            value={values[field.id]}
            onChange={(val) => setValue(field.id, val)}
            agentColor={agentColor}
          />
        </div>
      ))}
    </div>
  );
}

function FieldRenderer({ field, value, onChange, agentColor }: {
  field: InputField;
  value: unknown;
  onChange: (val: unknown) => void;
  agentColor: string;
}) {
  switch (field.type) {
    case "text":
      return <TextInput field={field} value={(value as string) || ""} onChange={onChange} agentColor={agentColor} />;
    case "textarea":
      return <TextAreaInput field={field} value={(value as string) || ""} onChange={onChange} agentColor={agentColor} />;
    case "select":
      return <SelectInput field={field} value={(value as string) || field.defaultValue as string || ""} onChange={onChange} agentColor={agentColor} />;
    case "multi-select":
      return <MultiSelectInput field={field} value={(value as string[]) || []} onChange={onChange} agentColor={agentColor} />;
    case "radio":
      return <RadioInput field={field} value={(value as string) || field.defaultValue as string || ""} onChange={onChange} agentColor={agentColor} />;
    case "slider":
      return <SliderInput field={field} value={(value as number) ?? field.defaultValue as number ?? 5} onChange={onChange} agentColor={agentColor} />;
    case "chips":
      return <ChipsInput field={field} value={(value as string[]) || []} onChange={onChange} agentColor={agentColor} />;
    case "url-list":
      return <UrlListInput field={field} value={(value as string[]) || []} onChange={onChange} agentColor={agentColor} />;
    default:
      return null;
  }
}

// ── Field Components ──────────────────────────────────────────

const inputBaseStyle = (agentColor: string) => ({
  width: "100%",
  padding: "10px 14px",
  borderRadius: 10,
  border: `1.5px solid ${P.border}`,
  fontSize: 13,
  color: P.text,
  outline: "none",
  backgroundColor: P.card,
  fontFamily: "inherit",
  transition: "border-color 0.2s",
});

function FieldLabel({ field }: { field: InputField }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: P.textSec }}>
        {field.label}
        {field.required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
      </label>
      {field.helpText && (
        <div style={{ fontSize: 11, color: P.textTer, marginTop: 2 }}>{field.helpText}</div>
      )}
    </div>
  );
}

function TextInput({ field, value, onChange, agentColor }: { field: InputField; value: string; onChange: (v: string) => void; agentColor: string }) {
  return (
    <div>
      <FieldLabel field={field} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={inputBaseStyle(agentColor)}
        onFocus={(e) => { e.currentTarget.style.borderColor = agentColor + "60"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
      />
    </div>
  );
}

function TextAreaInput({ field, value, onChange, agentColor }: { field: InputField; value: string; onChange: (v: string) => void; agentColor: string }) {
  return (
    <div>
      <FieldLabel field={field} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        style={{ ...inputBaseStyle(agentColor), resize: "vertical" as const, minHeight: 70 }}
        onFocus={(e) => { e.currentTarget.style.borderColor = agentColor + "60"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
      />
    </div>
  );
}

function SelectInput({ field, value, onChange, agentColor }: { field: InputField; value: string; onChange: (v: string) => void; agentColor: string }) {
  return (
    <div>
      <FieldLabel field={field} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputBaseStyle(agentColor),
          cursor: "pointer",
          appearance: "none" as const,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: 36,
        }}
      >
        <option value="">Select...</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function MultiSelectInput({ field, value, onChange, agentColor }: { field: InputField; value: string[]; onChange: (v: string[]) => void; agentColor: string }) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div>
      <FieldLabel field={field} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {field.options?.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1.5px solid ${selected ? agentColor + "50" : P.border}`,
                backgroundColor: selected ? agentColor + "10" : P.card,
                color: selected ? agentColor : P.textSec,
                fontSize: 12,
                fontWeight: selected ? 600 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
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
}

function RadioInput({ field, value, onChange, agentColor }: { field: InputField; value: string; onChange: (v: string) => void; agentColor: string }) {
  return (
    <div>
      <FieldLabel field={field} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {field.options?.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                padding: "7px 14px",
                borderRadius: 9,
                border: `2px solid ${selected ? agentColor : P.border}`,
                backgroundColor: selected ? agentColor + "12" : P.card,
                color: selected ? agentColor : P.textSec,
                fontSize: 12,
                fontWeight: selected ? 700 : 400,
                cursor: "pointer",
                fontFamily: "inherit",
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
}

function SliderInput({ field, value, onChange, agentColor }: { field: InputField; value: number; onChange: (v: number) => void; agentColor: string }) {
  return (
    <div>
      <FieldLabel field={field} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="range"
          min={field.min || 1}
          max={field.max || 10}
          step={field.step || 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: agentColor }}
        />
        <span style={{
          fontSize: 14, fontWeight: 700, color: agentColor,
          minWidth: 28, textAlign: "center",
        }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function ChipsInput({ field, value, onChange, agentColor }: { field: InputField; value: string[]; onChange: (v: string[]) => void; agentColor: string }) {
  const [input, setInput] = useState("");

  const addChip = () => {
    const trimmed = input.trim().toUpperCase();
    if (trimmed && !value.includes(trimmed) && value.length < 10) {
      onChange([...value, trimmed]);
      setInput("");
    }
  };

  const removeChip = (chip: string) => {
    onChange(value.filter((v) => v !== chip));
  };

  return (
    <div>
      <FieldLabel field={field} />
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {value.map((chip) => (
            <span
              key={chip}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 7,
                backgroundColor: agentColor + "15", color: agentColor,
                fontSize: 12, fontWeight: 600,
              }}
            >
              {chip}
              <button
                type="button"
                onClick={() => removeChip(chip)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: agentColor, fontSize: 14, padding: 0, lineHeight: 1,
                  fontFamily: "inherit",
                }}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={field.placeholder}
        style={inputBaseStyle(agentColor)}
        onFocus={(e) => { e.currentTarget.style.borderColor = agentColor + "60"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); addChip(); }
        }}
      />
    </div>
  );
}

function UrlListInput({ field, value, onChange, agentColor }: { field: InputField; value: string[]; onChange: (v: string[]) => void; agentColor: string }) {
  const [input, setInput] = useState("");

  const addUrl = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed) && value.length < 5) {
      onChange([...value, trimmed]);
      setInput("");
    }
  };

  return (
    <div>
      <FieldLabel field={field} />
      {value.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
          {value.map((url, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px", borderRadius: 8,
              backgroundColor: P.sidebar, border: `1px solid ${P.border}`,
              fontSize: 12, color: P.textSec,
              fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#EF4444", fontSize: 12, padding: "0 2px",
                  fontFamily: "inherit",
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={field.placeholder}
          style={{ ...inputBaseStyle(agentColor), flex: 1 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = agentColor + "60"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addUrl(); }
          }}
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!input.trim()}
          style={{
            padding: "8px 14px", borderRadius: 9, border: "none",
            background: input.trim() ? agentColor : P.border,
            color: input.trim() ? "#fff" : P.textTer,
            fontSize: 12, fontWeight: 600, cursor: input.trim() ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
