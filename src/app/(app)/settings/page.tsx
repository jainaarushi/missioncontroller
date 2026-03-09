"use client";

import { useState, useEffect } from "react";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { P } from "@/lib/palette";

export default function SettingsPage() {
  const router = useRouter();
  const supabaseEnabled = isSupabaseEnabled();

  const [apiKey, setApiKey] = useState("");
  const [savedKeyInfo, setSavedKeyInfo] = useState<{ hasKey: boolean; maskedKey: string | null; encryption: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Fetch current key status
  useEffect(() => {
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then(setSavedKeyInfo)
      .catch(() => {});
  }, []);

  async function handleSaveKey() {
    if (!apiKey.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSavedKeyInfo({ hasKey: true, maskedKey: data.maskedKey, encryption: data.encryption });
        setApiKey("");
        setShowKey(false);
        setMessage({ type: "success", text: "API key saved and encrypted successfully" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save key" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteKey() {
    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/api-key", { method: "DELETE" });
      if (res.ok) {
        setSavedKeyInfo({ hasKey: false, maskedKey: null, encryption: "" });
        setMessage({ type: "success", text: "API key removed" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove key" });
    } finally {
      setDeleting(false);
    }
  }

  async function handleSignOut() {
    if (supabaseEnabled) {
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
    }
    router.push("/login");
  }

  return (
    <>
      <div style={{ marginBottom: 28, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, color: P.text, margin: "0 0 6px",
          letterSpacing: "-0.04em",
        }}>
          Settings
        </h1>
      </div>

      {/* API Key Section */}
      <div style={{
        padding: "22px 24px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>🔑</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>
            Anthropic API Key
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: P.textSec, lineHeight: 1.6, marginBottom: 16 }}>
          Your API key powers the AI agents. Each agent uses Claude to generate real output.
          Get your key at{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
            style={{ color: P.indigo, fontWeight: 600, textDecoration: "none" }}>
            console.anthropic.com
          </a>
        </p>

        {/* Current key status */}
        {savedKeyInfo?.hasKey && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: 12,
            backgroundColor: "#ECFDF5", border: "1.5px solid #A7F3D0",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                backgroundColor: P.emerald,
                boxShadow: `0 0 8px ${P.emerald}50`,
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>
                  Key active
                </div>
                <div style={{
                  fontSize: 12, color: "#047857",
                  fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                }}>
                  {savedKeyInfo.maskedKey}
                </div>
              </div>
            </div>
            <button
              onClick={handleDeleteKey}
              disabled={deleting}
              style={{
                padding: "6px 14px", borderRadius: 8,
                border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2",
                color: "#DC2626", fontSize: 12, fontWeight: 600,
                cursor: deleting ? "not-allowed" : "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? "Removing..." : "Remove"}
            </button>
          </div>
        )}

        {/* Key input */}
        {!savedKeyInfo?.hasKey && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  style={{
                    width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10,
                    border: `1.5px solid ${P.border}`, fontSize: 13.5, color: P.text,
                    fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                    outline: "none", backgroundColor: P.card,
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = P.indigo + "60"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveKey(); }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, color: P.textTer, padding: "4px",
                  }}
                >
                  {showKey ? "🙈" : "👁️"}
                </button>
              </div>
              <button
                onClick={handleSaveKey}
                disabled={saving || !apiKey.trim()}
                style={{
                  padding: "11px 20px", borderRadius: 10, border: "none",
                  background: apiKey.trim() ? P.coralGrad : P.border,
                  color: apiKey.trim() ? "#fff" : P.textTer,
                  fontSize: 13.5, fontWeight: 700, cursor: saving || !apiKey.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                  boxShadow: apiKey.trim() ? "0 3px 10px rgba(249,112,102,0.3)" : "none",
                  whiteSpace: "nowrap",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Key"}
              </button>
            </div>
          </div>
        )}

        {/* Trust & encryption info */}
        <div style={{
          padding: "14px 16px", borderRadius: 12,
          backgroundColor: P.sidebar, border: `1px solid ${P.border}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.textSec, marginBottom: 10 }}>
            🔒 Security
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "🛡️", text: "Encrypted with AES-256-GCM", detail: "Military-grade encryption standard" },
              { icon: "🔐", text: "Key never leaves our server", detail: "Stored encrypted in database, decrypted only at execution time" },
              { icon: "🚫", text: "We never log or store your key in plaintext", detail: "Zero access to your raw key" },
              { icon: "🗑️", text: "Delete anytime", detail: "Instantly removes all traces from our database" },
              { icon: "💰", text: "You control your costs", detail: "Your key, your Anthropic account, your billing" },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: P.text }}>{item.text}</div>
                  <div style={{ fontSize: 11.5, color: P.textTer }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 10,
            backgroundColor: message.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${message.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            fontSize: 13, color: message.type === "success" ? "#065F46" : "#DC2626",
            fontWeight: 500,
            animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)",
          }}>
            {message.type === "success" ? "✓ " : "✕ "}{message.text}
          </div>
        )}
      </div>

      {/* Mode indicator */}
      <div style={{
        padding: "18px 22px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
          Status
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              backgroundColor: supabaseEnabled ? P.emerald : P.amber,
              boxShadow: `0 0 8px ${supabaseEnabled ? P.emerald : P.amber}40`,
            }} />
            <span style={{ fontSize: 13.5, color: P.text }}>
              Database: <strong>{supabaseEnabled ? "Connected" : "Demo mode"}</strong>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              backgroundColor: savedKeyInfo?.hasKey ? P.emerald : P.textGhost,
              boxShadow: savedKeyInfo?.hasKey ? `0 0 8px ${P.emerald}40` : "none",
            }} />
            <span style={{ fontSize: 13.5, color: P.text }}>
              AI: <strong>{savedKeyInfo?.hasKey ? "Your key active" : "No key — agents run in demo mode"}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Account */}
      <div style={{
        padding: "18px 22px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
          Account
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "9px 20px", borderRadius: 10,
            border: `1.5px solid #FECACA`,
            backgroundColor: "#FEF2F2", color: "#DC2626",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEE2E2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
