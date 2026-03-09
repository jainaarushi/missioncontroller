"use client";

import { useState, useEffect } from "react";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { P } from "@/lib/palette";

type Provider = "gemini" | "anthropic";

interface KeyInfo {
  hasKey: boolean;
  maskedKey: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabaseEnabled = isSupabaseEnabled();

  const [activeProvider, setActiveProvider] = useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [anthropicInfo, setAnthropicInfo] = useState<KeyInfo | null>(null);
  const [geminiInfo, setGeminiInfo] = useState<KeyInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then((data) => {
        setAnthropicInfo(data.anthropic);
        setGeminiInfo(data.gemini);
        if (data.provider) setActiveProvider(data.provider);
      })
      .catch(() => {});
  }, []);

  const currentInfo = activeProvider === "gemini" ? geminiInfo : anthropicInfo;

  async function handleSaveKey() {
    if (!apiKey.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey.trim(), provider: activeProvider }),
      });
      const data = await res.json();

      if (res.ok) {
        const info = { hasKey: true, maskedKey: data.maskedKey };
        if (activeProvider === "gemini") setGeminiInfo(info);
        else setAnthropicInfo(info);
        setApiKey("");
        setShowKey(false);
        setMessage({ type: "success", text: `${activeProvider === "gemini" ? "Gemini" : "Anthropic"} key saved and encrypted` });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save key" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteKey(provider: Provider) {
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/user/api-key?provider=${provider}`, { method: "DELETE" });
      if (res.ok) {
        if (provider === "gemini") setGeminiInfo(null);
        else setAnthropicInfo(null);
        setMessage({ type: "success", text: "Key removed" });
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

  const providers = [
    {
      id: "gemini" as Provider,
      name: "Google Gemini",
      icon: "✨",
      color: "#4285F4",
      gradient: "linear-gradient(135deg, #4285F4, #34A853)",
      placeholder: "AIza...",
      description: "Free tier available — 15 req/min, no expiration",
      link: "https://aistudio.google.com/apikey",
      linkText: "Get free key at aistudio.google.com",
      badge: "Free",
      badgeColor: "#10B981",
    },
    {
      id: "anthropic" as Provider,
      name: "Anthropic Claude",
      icon: "🤖",
      color: "#D97706",
      gradient: "linear-gradient(135deg, #D97706, #F59E0B)",
      placeholder: "sk-ant-api03-...",
      description: "Most capable — requires $5 minimum credits",
      link: "https://console.anthropic.com/settings/keys",
      linkText: "Get key at console.anthropic.com",
      badge: "Paid",
      badgeColor: "#D97706",
    },
  ];

  const activeProviderConfig = providers.find((p) => p.id === activeProvider)!;

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

      {/* AI Provider Section */}
      <div style={{
        padding: "22px 24px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 18 }}>🔑</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>AI Provider</div>
        </div>

        {/* Provider tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {providers.map((p) => {
            const isActive = activeProvider === p.id;
            const info = p.id === "gemini" ? geminiInfo : anthropicInfo;
            return (
              <div
                key={p.id}
                onClick={() => { setActiveProvider(p.id); setApiKey(""); setMessage(null); }}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                  border: `2px solid ${isActive ? p.color + "50" : P.border}`,
                  backgroundColor: isActive ? p.color + "08" : P.card,
                  transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: P.text }}>{p.name}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: "#fff",
                    backgroundColor: p.badgeColor, padding: "2px 6px",
                    borderRadius: 4, marginLeft: "auto",
                  }}>
                    {p.badge}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: P.textTer, lineHeight: 1.4 }}>
                  {p.description}
                </div>
                {info?.hasKey && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5, marginTop: 8,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      backgroundColor: P.emerald,
                      boxShadow: `0 0 6px ${P.emerald}50`,
                    }} />
                    <span style={{
                      fontSize: 10.5, color: P.emerald, fontWeight: 600,
                      fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                    }}>
                      {info.maskedKey}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active key status */}
        {currentInfo?.hasKey && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderRadius: 12,
            backgroundColor: "#ECFDF5", border: "1.5px solid #A7F3D0",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: P.emerald, boxShadow: `0 0 6px ${P.emerald}50` }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>
                {activeProviderConfig.name} key active
              </span>
            </div>
            <button
              onClick={() => handleDeleteKey(activeProvider)}
              disabled={deleting}
              style={{
                padding: "5px 12px", borderRadius: 7,
                border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2",
                color: "#DC2626", fontSize: 11, fontWeight: 600,
                cursor: deleting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {deleting ? "..." : "Remove"}
            </button>
          </div>
        )}

        {/* Key input */}
        {!currentInfo?.hasKey && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, color: P.textSec, marginBottom: 8 }}>
              <a href={activeProviderConfig.link} target="_blank" rel="noopener noreferrer"
                style={{ color: activeProviderConfig.color, fontWeight: 600, textDecoration: "none" }}>
                {activeProviderConfig.linkText} →
              </a>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={activeProviderConfig.placeholder}
                  style={{
                    width: "100%", padding: "11px 38px 11px 14px", borderRadius: 10,
                    border: `1.5px solid ${P.border}`, fontSize: 13, color: P.text,
                    fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                    outline: "none", backgroundColor: P.card,
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = activeProviderConfig.color + "60"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveKey(); }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: P.textTer, padding: "2px",
                  }}
                >
                  {showKey ? "🙈" : "👁️"}
                </button>
              </div>
              <button
                onClick={handleSaveKey}
                disabled={saving || !apiKey.trim()}
                style={{
                  padding: "11px 18px", borderRadius: 10, border: "none",
                  background: apiKey.trim() ? activeProviderConfig.gradient : P.border,
                  color: apiKey.trim() ? "#fff" : P.textTer,
                  fontSize: 13, fontWeight: 700, cursor: saving || !apiKey.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Security info */}
        <div style={{
          padding: "12px 14px", borderRadius: 12,
          backgroundColor: P.sidebar, border: `1px solid ${P.border}`,
        }}>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: P.textTer }}>
            <span>🛡️ AES-256-GCM encrypted</span>
            <span>🔐 Decrypted only at execution</span>
            <span>🗑️ Delete anytime</span>
            <span>💰 Your key, your billing</span>
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
          }}>
            {message.type === "success" ? "✓ " : "✕ "}{message.text}
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{
        padding: "18px 22px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 10 }}>Status</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: supabaseEnabled ? P.emerald : P.amber }} />
            <span style={{ fontSize: 13, color: P.text }}>Database: <strong>{supabaseEnabled ? "Connected" : "Demo"}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: (geminiInfo?.hasKey || anthropicInfo?.hasKey) ? P.emerald : P.textGhost }} />
            <span style={{ fontSize: 13, color: P.text }}>
              AI: <strong>{geminiInfo?.hasKey ? "Gemini active" : anthropicInfo?.hasKey ? "Claude active" : "No key — demo mode"}</strong>
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
        <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 10 }}>Account</div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 18px", borderRadius: 9,
            border: `1.5px solid #FECACA`, backgroundColor: "#FEF2F2",
            color: "#DC2626", fontSize: 12.5, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
