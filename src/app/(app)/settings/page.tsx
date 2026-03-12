"use client";

import { useState, useEffect } from "react";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { P } from "@/lib/palette";

type Provider = "openai" | "gemini" | "anthropic";

interface KeyInfo {
  hasKey: boolean;
  maskedKey: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const supabaseEnabled = isSupabaseEnabled();

  const [activeProvider, setActiveProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [openaiInfo, setOpenaiInfo] = useState<KeyInfo | null>(null);
  const [anthropicInfo, setAnthropicInfo] = useState<KeyInfo | null>(null);
  const [geminiInfo, setGeminiInfo] = useState<KeyInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [wisprKey, setWisprKey] = useState("");
  const [wisprInfo, setWisprInfo] = useState<KeyInfo | null>(null);
  const [wisprSaving, setWisprSaving] = useState(false);
  const [wisprMessage, setWisprMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tool API keys
  const [tavilyInfo, setTavilyInfo] = useState<KeyInfo | null>(null);
  const [firecrawlInfo, setFirecrawlInfo] = useState<KeyInfo | null>(null);
  const [serpInfo, setSerpInfo] = useState<KeyInfo | null>(null);
  const [toolKeyInputs, setToolKeyInputs] = useState<Record<string, string>>({ tavily: "", firecrawl: "", serp: "" });
  const [toolSaving, setToolSaving] = useState<string | null>(null);
  const [toolMessage, setToolMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/api-key")
      .then((r) => r.json())
      .then((data) => {
        setOpenaiInfo(data.openai);
        setAnthropicInfo(data.anthropic);
        setGeminiInfo(data.gemini);
        if (data.wispr) setWisprInfo(data.wispr);
        if (data.tavily) setTavilyInfo(data.tavily);
        if (data.firecrawl) setFirecrawlInfo(data.firecrawl);
        if (data.serp) setSerpInfo(data.serp);
        if (data.provider) setActiveProvider(data.provider);
      })
      .catch(() => {});
  }, []);

  const currentInfo = activeProvider === "openai" ? openaiInfo : activeProvider === "gemini" ? geminiInfo : anthropicInfo;

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
        if (activeProvider === "openai") setOpenaiInfo(info);
        else if (activeProvider === "gemini") setGeminiInfo(info);
        else setAnthropicInfo(info);
        setApiKey("");
        setShowKey(false);
        const providerNames: Record<string, string> = { openai: "OpenAI", gemini: "Gemini", anthropic: "Anthropic" };
        setMessage({ type: "success", text: `${providerNames[activeProvider]} key saved and encrypted` });
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
        if (provider === "openai") setOpenaiInfo(null);
        else if (provider === "gemini") setGeminiInfo(null);
        else setAnthropicInfo(null);
        setMessage({ type: "success", text: "Key removed" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove key" });
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveWispr() {
    if (!wisprKey.trim()) return;
    setWisprSaving(true);
    setWisprMessage(null);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: wisprKey.trim(), provider: "wispr" }),
      });
      const data = await res.json();
      if (res.ok) {
        setWisprInfo({ hasKey: true, maskedKey: data.maskedKey });
        setWisprKey("");
        setWisprMessage({ type: "success", text: "Wispr key saved and encrypted" });
      } else {
        setWisprMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setWisprMessage({ type: "error", text: "Network error" });
    } finally {
      setWisprSaving(false);
    }
  }

  async function handleSaveToolKey(providerId: string, providerName: string, setInfo: (info: KeyInfo | null) => void) {
    const key = toolKeyInputs[providerId]?.trim();
    if (!key) return;
    setToolSaving(providerId);
    setToolMessage(null);
    try {
      const res = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: key, provider: providerId }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfo({ hasKey: true, maskedKey: data.maskedKey });
        setToolKeyInputs(prev => ({ ...prev, [providerId]: "" }));
        setToolMessage({ type: "success", text: `${providerName} key saved and encrypted` });
      } else {
        setToolMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setToolMessage({ type: "error", text: "Network error" });
    } finally {
      setToolSaving(null);
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
      id: "openai" as Provider,
      name: "OpenAI",
      icon: "🟢",
      color: "#10A37F",
      gradient: "linear-gradient(135deg, #10A37F, #1A7F64)",
      placeholder: "sk-...",
      description: "GPT-4o Mini — fast, affordable, widely used",
      link: "https://platform.openai.com/api-keys",
      linkText: "Get key at platform.openai.com",
      badge: "Popular",
      badgeColor: "#10A37F",
    },
    {
      id: "gemini" as Provider,
      name: "Google Gemini",
      icon: "✨",
      color: "#4285F4",
      gradient: "linear-gradient(135deg, #4285F4, #34A853)",
      placeholder: "AIza...",
      description: "Gemini 2.5 Flash — fast, affordable, generous free tier",
      link: "https://aistudio.google.com/apikey",
      linkText: "Get key at aistudio.google.com",
      badge: "Free Tier",
      badgeColor: "#34A853",
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
      badge: "Premium",
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
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" as const }}>
          {providers.map((p) => {
            const isActive = activeProvider === p.id;
            const info = p.id === "openai" ? openaiInfo : p.id === "gemini" ? geminiInfo : anthropicInfo;
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
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: P.textTer, flexWrap: "wrap" as const }}>
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

      {/* Voice Input — Wispr */}
      <div style={{
        padding: "22px 24px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>🎙️</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Voice Input</div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#fff",
            backgroundColor: "#8B5CF6", padding: "2px 6px", borderRadius: 4,
          }}>
            Wispr Flow
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: P.textTer, marginBottom: 14, lineHeight: 1.5 }}>
          Add your Wispr Flow API key to enable voice-to-text input. Speak instead of typing when creating tasks.
        </p>

        {wisprInfo?.hasKey ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderRadius: 12,
            backgroundColor: "#F5F3FF", border: "1.5px solid #DDD6FE",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#8B5CF6", boxShadow: "0 0 6px rgba(139,92,246,0.5)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>Wispr key active</span>
              <span style={{ fontSize: 10.5, color: "#7C3AED", fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                {wisprInfo.maskedKey}
              </span>
            </div>
            <button
              onClick={async () => {
                setWisprSaving(true);
                try {
                  const res = await fetch("/api/user/api-key?provider=wispr", { method: "DELETE" });
                  if (res.ok) { setWisprInfo(null); setWisprMessage({ type: "success", text: "Wispr key removed" }); }
                } catch { setWisprMessage({ type: "error", text: "Failed to remove" }); }
                finally { setWisprSaving(false); }
              }}
              style={{
                padding: "5px 12px", borderRadius: 7,
                border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2",
                color: "#DC2626", fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              value={wisprKey}
              onChange={(e) => setWisprKey(e.target.value)}
              placeholder="Wispr API key..."
              style={{
                flex: 1, padding: "11px 14px", borderRadius: 10,
                border: `1.5px solid ${P.border}`, fontSize: 13, color: P.text,
                fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                outline: "none", backgroundColor: P.card,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#8B5CF660"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
              onKeyDown={(e) => { if (e.key === "Enter" && wisprKey.trim()) handleSaveWispr(); }}
            />
            <button
              onClick={handleSaveWispr}
              disabled={wisprSaving || !wisprKey.trim()}
              style={{
                padding: "11px 18px", borderRadius: 10, border: "none",
                background: wisprKey.trim() ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : P.border,
                color: wisprKey.trim() ? "#fff" : P.textTer,
                fontSize: 13, fontWeight: 700, cursor: wisprSaving || !wisprKey.trim() ? "not-allowed" : "pointer",
                fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              {wisprSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}

        {wisprMessage && (
          <div style={{
            marginTop: 10, padding: "8px 12px", borderRadius: 8,
            backgroundColor: wisprMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${wisprMessage.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            fontSize: 12, color: wisprMessage.type === "success" ? "#065F46" : "#DC2626",
          }}>
            {wisprMessage.type === "success" ? "✓ " : "✕ "}{wisprMessage.text}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11, color: P.textTer }}>
          <a href="https://platform.wisprflow.ai/" target="_blank" rel="noopener noreferrer"
            style={{ color: "#8B5CF6", fontWeight: 600, textDecoration: "none" }}>
            Get key at platform.wisprflow.ai →
          </a>
        </div>
      </div>

      {/* Tool API Keys */}
      <div style={{
        padding: "22px 24px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.11s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>🔧</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>Tool API Keys</div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#fff",
            backgroundColor: "#6366F1", padding: "2px 6px", borderRadius: 4,
          }}>
            Optional
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: P.textTer, marginBottom: 16, lineHeight: 1.5 }}>
          Some agents use external tools (web search, scraping) that need their own API keys. Most agents work without these.
        </p>

        {[
          {
            id: "tavily",
            name: "Tavily",
            icon: "🔍",
            color: "#2563EB",
            gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
            placeholder: "tvly-...",
            description: "Web search for research agents (1000 free searches/month)",
            link: "https://tavily.com",
            linkText: "Get free key at tavily.com",
            info: tavilyInfo,
            setInfo: setTavilyInfo,
            agents: "Deep Research, Journalist, Competitor Intel, Travel Planner, Sales Rep",
          },
          {
            id: "firecrawl",
            name: "Firecrawl",
            icon: "🔥",
            color: "#F97316",
            gradient: "linear-gradient(135deg, #F97316, #FB923C)",
            placeholder: "fc-...",
            description: "Advanced web scraping (500 free credits)",
            link: "https://firecrawl.dev",
            linkText: "Get key at firecrawl.dev",
            info: firecrawlInfo,
            setInfo: setFirecrawlInfo,
            agents: "Web Intel, Deep Research (enhanced)",
          },
          {
            id: "serp",
            name: "SerpAPI",
            icon: "🌐",
            color: "#059669",
            gradient: "linear-gradient(135deg, #059669, #10B981)",
            placeholder: "your-serp-key...",
            description: "Google search results (100 free/month)",
            link: "https://serpapi.com",
            linkText: "Get key at serpapi.com",
            info: serpInfo,
            setInfo: setSerpInfo,
            agents: "Alternative to Tavily for search",
          },
        ].map((tp) => (
          <div key={tp.id} style={{
            padding: "14px 16px", borderRadius: 12,
            border: `1.5px solid ${tp.info?.hasKey ? tp.color + "30" : P.border}`,
            backgroundColor: tp.info?.hasKey ? tp.color + "05" : P.card,
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{tp.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{tp.name}</span>
              {tp.info?.hasKey && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: tp.color }} />
                  <span style={{ fontSize: 10, color: tp.color, fontWeight: 600, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                    {tp.info.maskedKey}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/user/api-key?provider=${tp.id}`, { method: "DELETE" });
                        if (res.ok) { tp.setInfo(null); setToolMessage({ type: "success", text: `${tp.name} key removed` }); }
                      } catch { setToolMessage({ type: "error", text: "Failed to remove" }); }
                    }}
                    style={{
                      padding: "2px 8px", borderRadius: 5, marginLeft: 8,
                      border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2",
                      color: "#DC2626", fontSize: 10, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: P.textTer, marginBottom: tp.info?.hasKey ? 0 : 8, lineHeight: 1.4 }}>
              {tp.description}
            </div>
            {!tp.info?.hasKey && (
              <>
                <div style={{ fontSize: 10.5, color: P.textTer, marginBottom: 6 }}>
                  Powers: <span style={{ color: P.textSec, fontWeight: 500 }}>{tp.agents}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="password"
                    value={toolKeyInputs[tp.id] || ""}
                    onChange={(e) => setToolKeyInputs(prev => ({ ...prev, [tp.id]: e.target.value }))}
                    placeholder={tp.placeholder}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 8,
                      border: `1.5px solid ${P.border}`, fontSize: 12, color: P.text,
                      fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                      outline: "none", backgroundColor: P.card,
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = tp.color + "60"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && toolKeyInputs[tp.id]?.trim()) {
                        handleSaveToolKey(tp.id, tp.name, tp.setInfo);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSaveToolKey(tp.id, tp.name, tp.setInfo)}
                    disabled={toolSaving === tp.id || !toolKeyInputs[tp.id]?.trim()}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      background: toolKeyInputs[tp.id]?.trim() ? tp.gradient : P.border,
                      color: toolKeyInputs[tp.id]?.trim() ? "#fff" : P.textTer,
                      fontSize: 12, fontWeight: 700, cursor: toolSaving === tp.id || !toolKeyInputs[tp.id]?.trim() ? "not-allowed" : "pointer",
                      fontFamily: "inherit", whiteSpace: "nowrap",
                    }}
                  >
                    {toolSaving === tp.id ? "..." : "Save"}
                  </button>
                </div>
                <div style={{ marginTop: 6, fontSize: 10.5 }}>
                  <a href={tp.link} target="_blank" rel="noopener noreferrer"
                    style={{ color: tp.color, fontWeight: 600, textDecoration: "none" }}>
                    {tp.linkText} →
                  </a>
                </div>
              </>
            )}
          </div>
        ))}

        {toolMessage && (
          <div style={{
            marginTop: 8, padding: "8px 12px", borderRadius: 8,
            backgroundColor: toolMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${toolMessage.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            fontSize: 12, color: toolMessage.type === "success" ? "#065F46" : "#DC2626",
          }}>
            {toolMessage.type === "success" ? "✓ " : "✕ "}{toolMessage.text}
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
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: (openaiInfo?.hasKey || geminiInfo?.hasKey || anthropicInfo?.hasKey) ? P.emerald : P.textGhost }} />
            <span style={{ fontSize: 13, color: P.text }}>
              AI: <strong>{openaiInfo?.hasKey ? "OpenAI active" : geminiInfo?.hasKey ? "Gemini active" : anthropicInfo?.hasKey ? "Claude active" : "No key — demo mode"}</strong>
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
