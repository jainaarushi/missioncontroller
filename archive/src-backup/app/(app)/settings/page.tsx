"use client";

import { useState, useEffect } from "react";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { P, F, FM } from "@/lib/palette";
import { AvatarSection } from "@/components/settings/avatar-section";

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

  // MCP Servers
  interface MCPServer {
    id: string;
    name: string;
    url: string;
    authToken?: string;
    agentSlugs: string[];
    enabled: boolean;
    serverType: string;
    createdAt: string;
  }
  interface MCPSuggestion {
    type: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    urlPlaceholder: string;
    authPlaceholder: string;
    authRequired: boolean;
    recommendedAgents: string[];
    docsUrl: string;
  }
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [mcpSuggestions, setMcpSuggestions] = useState<MCPSuggestion[]>([]);
  const [mcpAdding, setMcpAdding] = useState<string | null>(null); // server type being added
  const [mcpForm, setMcpForm] = useState<{ name: string; url: string; authToken: string }>({ name: "", url: "", authToken: "" });
  const [mcpSaving, setMcpSaving] = useState(false);
  const [mcpMessage, setMcpMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mcpSearch, setMcpSearch] = useState("");
  const [mcpShowAll, setMcpShowAll] = useState(false);

  // Composio Connected Apps
  const [composioEnabled, setComposioEnabled] = useState(false);
  const [composioApps, setComposioApps] = useState<Record<string, boolean>>({});
  const [composioConnecting, setComposioConnecting] = useState<string | null>(null);
  const [composioDisconnecting, setComposioDisconnecting] = useState<string | null>(null);
  const [composioUsage, setComposioUsage] = useState<{ used: number; limit: number } | null>(null);

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

    // Fetch MCP servers
    fetch("/api/user/mcp-servers")
      .then((r) => r.json())
      .then((data) => {
        if (data.servers) setMcpServers(data.servers);
        if (data.suggestions) setMcpSuggestions(data.suggestions);
      })
      .catch(() => {});

    // Fetch Composio connection status
    fetch("/api/user/composio/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled) setComposioEnabled(true);
        if (data.connections) setComposioApps(data.connections);
        if (data.usage) setComposioUsage(data.usage);
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
    <div style={{ padding: "32px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, margin: "0 0 6px",
          letterSpacing: "-0.02em",
          color: "#1b1b1b",
          fontFamily: F,
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: 14, color: "#6b7280", margin: 0, fontFamily: F,
        }}>
          Manage your API keys, integrations, and preferences
        </p>
      </div>

      {/* AI Provider Section */}
      <div style={{
        padding: "24px", background: "#ffffff", borderRadius: 16,
        border: "1px solid #e5e7eb", marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.05s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 18 }}>🔑</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>AI Provider</div>
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
                  border: `2px solid ${isActive ? p.color : "#e5e7eb"}`,
                  backgroundColor: isActive ? p.color + "08" : "#ffffff",
                  transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>{p.name}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: "#4b5563",
                    background: "#f3f4f6", padding: "2px 6px",
                    borderRadius: 4, marginLeft: "auto",
                  }}>
                    {p.badge}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#4b5563", lineHeight: 1.4, fontFamily: F }}>
                  {p.description}
                </div>
                {info?.hasKey && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5, marginTop: 8,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      backgroundColor: "#1e8e3e",
                    }} />
                    <span style={{
                      fontSize: 10.5, color: "#1e8e3e", fontWeight: 600,
                      fontFamily: FM,
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
            backgroundColor: P.emeraldSoft, border: `1.5px solid ${P.emerald}30`,
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1e8e3e" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e8e3e", fontFamily: F }}>
                {activeProviderConfig.name} key active
              </span>
            </div>
            <button
              onClick={() => handleDeleteKey(activeProvider)}
              disabled={deleting}
              style={{
                padding: "5px 12px", borderRadius: 7,
                border: `1px solid ${P.coral}30`, backgroundColor: P.coralSoft,
                color: P.coral, fontSize: 11, fontWeight: 600,
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
            <div style={{ fontSize: 12.5, color: "#4b5563", marginBottom: 8 }}>
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
                    border: "1px solid #e5e7eb", fontSize: 13, color: "#1b1b1b",
                    fontFamily: FM,
                    outline: "none", backgroundColor: "#f9fafb",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#1e8e3e"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveKey(); }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#4b5563", padding: "2px",
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
                  background: apiKey.trim() ? "#1e8e3e" : "#e5e7eb",
                  color: apiKey.trim() ? "#fff" : "#9ca3af",
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
          backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
        }}>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#4b5563", flexWrap: "wrap" as const, fontFamily: F }}>
            <span>AES-256-GCM encrypted</span>
            <span>Decrypted only at execution</span>
            <span>Delete anytime</span>
            <span>Your key, your billing</span>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 10,
            backgroundColor: message.type === "success" ? P.emeraldSoft : P.coralSoft,
            border: `1px solid ${message.type === "success" ? P.emerald + "30" : P.coral + "30"}`,
            fontSize: 13, color: message.type === "success" ? "#1e8e3e" : P.coral,
            fontWeight: 500, fontFamily: F,
          }}>
            {message.type === "success" ? "✓ " : "✕ "}{message.text}
          </div>
        )}
      </div>

      {/* Voice Input — Wispr */}
      <div style={{
        padding: "24px", background: "#ffffff", borderRadius: 16,
        border: "1px solid #e5e7eb", marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>🎙️</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>Voice Input</div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#4b5563",
            background: "#f3f4f6", padding: "2px 6px", borderRadius: 4,
          }}>
            Wispr Flow
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: "#4b5563", marginBottom: 14, lineHeight: 1.5, fontFamily: F }}>
          Add your Wispr Flow API key to enable voice-to-text input. Speak instead of typing when creating tasks.
        </p>

        {wisprInfo?.hasKey ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderRadius: 12,
            backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1e8e3e" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1e8e3e", fontFamily: F }}>Wispr key active</span>
              <span style={{ fontSize: 10.5, color: "#4b5563", fontFamily: FM, opacity: 0.7 }}>
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
                border: `1px solid ${P.coral}30`, backgroundColor: P.coralSoft,
                color: P.coral, fontSize: 11, fontWeight: 600,
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
                border: "1px solid #e5e7eb", fontSize: 13, color: "#1b1b1b",
                fontFamily: FM,
                outline: "none", backgroundColor: "#f9fafb",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1e8e3e"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
              onKeyDown={(e) => { if (e.key === "Enter" && wisprKey.trim()) handleSaveWispr(); }}
            />
            <button
              onClick={handleSaveWispr}
              disabled={wisprSaving || !wisprKey.trim()}
              style={{
                padding: "11px 18px", borderRadius: 10, border: "none",
                background: wisprKey.trim() ? "#1e8e3e" : "#e5e7eb",
                color: wisprKey.trim() ? "#fff" : "#9ca3af",
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
            backgroundColor: wisprMessage.type === "success" ? P.emeraldSoft : P.coralSoft,
            border: `1px solid ${wisprMessage.type === "success" ? P.emerald + "30" : P.coral + "30"}`,
            fontSize: 12, color: wisprMessage.type === "success" ? "#1e8e3e" : P.coral,
            fontFamily: F,
          }}>
            {wisprMessage.type === "success" ? "✓ " : "✕ "}{wisprMessage.text}
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11, color: "#4b5563" }}>
          <a href="https://platform.wisprflow.ai/" target="_blank" rel="noopener noreferrer"
            style={{ color: "#1e8e3e", fontWeight: 600, textDecoration: "none" }}>
            Get key at platform.wisprflow.ai →
          </a>
        </div>
      </div>

      {/* Tool API Keys */}
      <div style={{
        padding: "24px", background: "#ffffff", borderRadius: 16,
        border: "1px solid #e5e7eb", marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.11s both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18 }}>🔧</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>Tool API Keys</div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#4b5563",
            background: "#f3f4f6", padding: "2px 6px", borderRadius: 4,
          }}>
            Optional
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: "#4b5563", marginBottom: 16, lineHeight: 1.5, fontFamily: F }}>
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
            border: `1px solid ${tp.info?.hasKey ? tp.color + "30" : "#e5e7eb"}`,
            backgroundColor: tp.info?.hasKey ? tp.color + "05" : "#ffffff",
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{tp.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>{tp.name}</span>
              {tp.info?.hasKey && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: tp.color }} />
                  <span style={{ fontSize: 10, color: tp.color, fontWeight: 600, fontFamily: FM }}>
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
                      border: `1px solid ${P.coral}30`, backgroundColor: P.coralSoft,
                      color: P.coral, fontSize: 10, fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#4b5563", marginBottom: tp.info?.hasKey ? 0 : 8, lineHeight: 1.4, fontFamily: F }}>
              {tp.description}
            </div>
            {!tp.info?.hasKey && (
              <>
                <div style={{ fontSize: 10.5, color: "#4b5563", marginBottom: 6, fontFamily: F }}>
                  Powers: <span style={{ color: "#1b1b1b", fontWeight: 500 }}>{tp.agents}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="password"
                    value={toolKeyInputs[tp.id] || ""}
                    onChange={(e) => setToolKeyInputs(prev => ({ ...prev, [tp.id]: e.target.value }))}
                    placeholder={tp.placeholder}
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 10,
                      border: "1px solid #e5e7eb", fontSize: 12, color: "#1b1b1b",
                      fontFamily: FM,
                      outline: "none", backgroundColor: "#f9fafb",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#1e8e3e"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
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
                      padding: "8px 14px", borderRadius: 10, border: "none",
                      background: toolKeyInputs[tp.id]?.trim() ? "#1e8e3e" : "#e5e7eb",
                      color: toolKeyInputs[tp.id]?.trim() ? "#fff" : "#9ca3af",
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
            backgroundColor: toolMessage.type === "success" ? P.emeraldSoft : P.coralSoft,
            border: `1px solid ${toolMessage.type === "success" ? P.emerald + "30" : P.coral + "30"}`,
            fontSize: 12, color: toolMessage.type === "success" ? "#1e8e3e" : P.coral,
            fontFamily: F,
          }}>
            {toolMessage.type === "success" ? "✓ " : "✕ "}{toolMessage.text}
          </div>
        )}
      </div>

      {/* AI Avatars */}
      <AvatarSection hasGeminiKey={!!geminiInfo?.hasKey} />

      {/* Connected Apps (Composio) */}
      {composioEnabled && (
        <div style={{
          padding: "24px", background: "#ffffff", borderRadius: 16,
          border: "1px solid #e5e7eb", marginBottom: 16,
          animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.12s both",
        }}>
          <div style={{ textAlign: "center" as const, marginBottom: 4 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: "#1e8e3e", letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
            }}>
              CONNECTED APPS
            </span>
          </div>
          <div style={{ textAlign: "center" as const, marginBottom: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1b1b1b", lineHeight: 1.3, fontFamily: F }}>
              Real Data Access
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: "#4b5563", marginBottom: 16, lineHeight: 1.5, textAlign: "center" as const, fontFamily: F }}>
            Connect your accounts so agents can access your real data from LinkedIn, Gmail, and more. One-click OAuth — your credentials stay with each provider.
          </p>

          {composioUsage && (
            <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 10, backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", fontFamily: F }}>Monthly usage</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: composioUsage.used >= composioUsage.limit ? P.coral : "#4b5563", fontFamily: F }}>
                  {composioUsage.used} / {composioUsage.limit} runs
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, backgroundColor: "#e5e7eb", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${Math.min(100, (composioUsage.used / composioUsage.limit) * 100)}%`,
                  backgroundColor: composioUsage.used >= composioUsage.limit ? P.coral : "#1e8e3e",
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {[
              { id: "linkedin", name: "LinkedIn", icon: "LI", color: "#0A66C2", desc: "Job search, profile data, and connections" },
              { id: "gmail", name: "Gmail", icon: "GM", color: "#EA4335", desc: "Send and read emails" },
              { id: "google_sheets", name: "Google Sheets", icon: "GS", color: "#34A853", desc: "Read and write spreadsheet data" },
              { id: "google_calendar", name: "Google Calendar", icon: "GC", color: "#4285F4", desc: "Manage events and schedules" },
              { id: "github", name: "GitHub", icon: "GH", color: "#24292F", desc: "Repos, issues, and pull requests" },
            ].map((app) => {
              const isConnected = composioApps[app.id] === true;
              const isConnecting = composioConnecting === app.id;
              const isDisconnecting = composioDisconnecting === app.id;
              return (
                <div key={app.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10,
                  backgroundColor: isConnected ? `${app.color}08` : "#f9fafb",
                  border: `1px solid ${isConnected ? app.color + "30" : "#e5e7eb"}`,
                  transition: "all 0.2s ease",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: app.color + "18", color: app.color,
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>
                    {app.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>{app.name}</div>
                    <div style={{ fontSize: 11, color: "#4b5563", fontFamily: F }}>{app.desc}</div>
                  </div>
                  {isConnected ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#1e8e3e",
                        padding: "4px 10px", borderRadius: 6,
                        backgroundColor: P.emeraldSoft,
                      }}>
                        Connected
                      </span>
                      <button
                        disabled={isDisconnecting}
                        onClick={async () => {
                          setComposioDisconnecting(app.id);
                          try {
                            const res = await fetch("/api/user/composio/disconnect", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ app: app.id }),
                            });
                            if (res.ok) {
                              setComposioApps(prev => ({ ...prev, [app.id]: false }));
                            }
                          } catch { /* ignore */ }
                          setComposioDisconnecting(null);
                        }}
                        style={{
                          fontSize: 10, fontWeight: 600, color: "#4b5563",
                          padding: "4px 8px", borderRadius: 6,
                          border: "1px solid #e5e7eb", backgroundColor: "transparent",
                          cursor: isDisconnecting ? "wait" : "pointer",
                          opacity: isDisconnecting ? 0.5 : 1,
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = P.coral;
                          e.currentTarget.style.borderColor = P.coral + "40";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#4b5563";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                      >
                        {isDisconnecting ? "..." : "Disconnect"}
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={isConnecting}
                      onClick={async () => {
                        setComposioConnecting(app.id);
                        try {
                          const res = await fetch("/api/user/composio/connect", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ app: app.id }),
                          });
                          const data = await res.json();
                          if (data.redirectUrl) {
                            window.open(data.redirectUrl, "_blank", "width=600,height=700");
                          }
                        } catch { /* ignore */ }
                        setComposioConnecting(null);
                      }}
                      style={{
                        fontSize: 11, fontWeight: 700, color: "#fff",
                        padding: "6px 14px", borderRadius: 6, border: "none",
                        backgroundColor: app.color, cursor: isConnecting ? "wait" : "pointer",
                        opacity: isConnecting ? 0.6 : 1,
                        transition: "opacity 0.15s ease",
                      }}
                    >
                      {isConnecting ? "..." : "Connect"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 12, padding: "8px 12px", borderRadius: 8,
            backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              backgroundColor: Object.values(composioApps).some(Boolean) ? "#1e8e3e" : "#4b5563",
            }} />
            <span style={{ fontSize: 10.5, color: "#4b5563", fontFamily: F }}>
              {Object.values(composioApps).some(Boolean)
                ? `${Object.values(composioApps).filter(Boolean).length} app${Object.values(composioApps).filter(Boolean).length > 1 ? "s" : ""} connected via REST API`
                : "No apps connected yet"
              }
            </span>
          </div>
        </div>
      )}

      {/* MCP Servers */}
      <div style={{
        padding: "24px", background: "#ffffff", borderRadius: 16,
        border: "1px solid #e5e7eb", marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.14s both",
      }}>
        <div style={{ textAlign: "center" as const, marginBottom: 4 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#1e8e3e", letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
          }}>
            INTEGRATIONS
          </span>
        </div>
        <div style={{ textAlign: "center" as const, marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1b1b1b", lineHeight: 1.3, fontFamily: F }}>
            {mcpSuggestions.filter(s => s.type !== "custom").length}+ Tools
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1b1b1b", lineHeight: 1.3, fontFamily: F }}>
            Ready to Connect
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: "#4b5563", marginBottom: 16, lineHeight: 1.5, textAlign: "center" as const, fontFamily: F }}>
          Connect your AI agents to the tools you already use. CRMs, messaging, project management, analytics, and more.
        </p>

        {/* Connected servers */}
        {mcpServers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4b5563", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.05em", fontFamily: F }}>
              Connected Servers
            </div>
            {mcpServers.map((server) => {
              const suggestion = mcpSuggestions.find(s => s.type === server.serverType);
              return (
                <div key={server.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: 12, marginBottom: 8,
                  backgroundColor: server.enabled ? (suggestion?.color || "#1e8e3e") + "08" : "#f9fafb",
                  border: `1px solid ${server.enabled ? (suggestion?.color || "#1e8e3e") + "30" : "#e5e7eb"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: (suggestion?.color || "#1e8e3e") + "15", color: suggestion?.color || "#1e8e3e",
                      fontSize: 11, fontWeight: 800,
                    }}>
                      {suggestion?.icon || "MCP"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>{server.name}</div>
                      <div style={{ fontSize: 10.5, color: "#4b5563", fontFamily: FM }}>
                        {server.url.length > 40 ? server.url.slice(0, 40) + "..." : server.url}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={async () => {
                        try {
                          await fetch("/api/user/mcp-servers", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: server.id, enabled: !server.enabled }),
                          });
                          setMcpServers(prev => prev.map(s => s.id === server.id ? { ...s, enabled: !s.enabled } : s));
                        } catch { /* ignore */ }
                      }}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                        border: `1px solid ${server.enabled ? "#1e8e3e" + "30" : "#e5e7eb"}`,
                        backgroundColor: server.enabled ? P.emeraldSoft : "#f9fafb",
                        color: server.enabled ? "#1e8e3e" : "#4b5563",
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      {server.enabled ? "Enabled" : "Disabled"}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/user/mcp-servers?id=${server.id}`, { method: "DELETE" });
                          if (res.ok) {
                            setMcpServers(prev => prev.filter(s => s.id !== server.id));
                            setMcpMessage({ type: "success", text: `${server.name} removed` });
                          }
                        } catch {
                          setMcpMessage({ type: "error", text: "Failed to remove" });
                        }
                      }}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                        border: `1px solid ${P.coral}30`, backgroundColor: P.coralSoft,
                        color: P.coral, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add server form */}
        {mcpAdding && (() => {
          const suggestion = mcpSuggestions.find(s => s.type === mcpAdding);
          return (
            <div style={{
              padding: "16px", borderRadius: 12, marginBottom: 14,
              border: `2px solid ${(suggestion?.color || "#1e8e3e") + "40"}`,
              backgroundColor: (suggestion?.color || "#1e8e3e") + "05",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: (suggestion?.color || "#1e8e3e") + "15", color: suggestion?.color || "#1e8e3e",
                  fontSize: 10, fontWeight: 800,
                }}>
                  {suggestion?.icon || "MCP"}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1b1b1b", fontFamily: F }}>Add {suggestion?.name || "Custom"} Server</span>
                <button
                  onClick={() => { setMcpAdding(null); setMcpForm({ name: "", url: "", authToken: "" }); }}
                  style={{
                    marginLeft: "auto", background: "none", border: "none",
                    color: "#4b5563", cursor: "pointer", fontSize: 16, fontFamily: "inherit",
                  }}
                >
                  x
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                <input
                  value={mcpForm.name}
                  onChange={(e) => setMcpForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={`Server name (e.g., "My ${suggestion?.name || "Server"}")`}
                  style={{
                    padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb",
                    fontSize: 12.5, color: "#1b1b1b", outline: "none", backgroundColor: "#f9fafb",
                    fontFamily: "inherit",
                  }}
                />
                <input
                  value={mcpForm.url}
                  onChange={(e) => setMcpForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder={suggestion?.urlPlaceholder || "https://your-server.com/mcp"}
                  style={{
                    padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb",
                    fontSize: 12.5, color: "#1b1b1b", outline: "none", backgroundColor: "#f9fafb",
                    fontFamily: FM,
                  }}
                />
                <input
                  type="password"
                  value={mcpForm.authToken}
                  onChange={(e) => setMcpForm(prev => ({ ...prev, authToken: e.target.value }))}
                  placeholder={suggestion?.authPlaceholder || "Auth token (optional)"}
                  style={{
                    padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb",
                    fontSize: 12.5, color: "#1b1b1b", outline: "none", backgroundColor: "#f9fafb",
                    fontFamily: FM,
                  }}
                />
                {suggestion?.docsUrl && (
                  <div style={{ fontSize: 11, color: "#4b5563" }}>
                    <a href={suggestion.docsUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: suggestion.color, fontWeight: 600, textDecoration: "none" }}>
                      Setup docs →
                    </a>
                    {suggestion.recommendedAgents.length > 0 && (
                      <span style={{ marginLeft: 12 }}>
                        Powers: <span style={{ color: "#1b1b1b", fontWeight: 500 }}>{suggestion.recommendedAgents.join(", ")}</span>
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={async () => {
                    if (!mcpForm.name.trim() || !mcpForm.url.trim()) return;
                    setMcpSaving(true);
                    setMcpMessage(null);
                    try {
                      const res = await fetch("/api/user/mcp-servers", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: mcpForm.name.trim(),
                          url: mcpForm.url.trim(),
                          authToken: mcpForm.authToken.trim() || undefined,
                          agentSlugs: suggestion?.recommendedAgents || [],
                          serverType: mcpAdding,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setMcpServers(prev => [...prev, data.server]);
                        setMcpAdding(null);
                        setMcpForm({ name: "", url: "", authToken: "" });
                        setMcpMessage({ type: "success", text: `${mcpForm.name} added and encrypted` });
                      } else {
                        setMcpMessage({ type: "error", text: data.error || "Failed to add server" });
                      }
                    } catch {
                      setMcpMessage({ type: "error", text: "Network error" });
                    } finally {
                      setMcpSaving(false);
                    }
                  }}
                  disabled={mcpSaving || !mcpForm.name.trim() || !mcpForm.url.trim()}
                  style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: mcpForm.name.trim() && mcpForm.url.trim()
                      ? "#1e8e3e"
                      : "#e5e7eb",
                    color: mcpForm.name.trim() && mcpForm.url.trim() ? "#fff" : "#9ca3af",
                    fontSize: 13, fontWeight: 700, cursor: mcpSaving ? "not-allowed" : "pointer",
                    fontFamily: "inherit", opacity: mcpSaving ? 0.6 : 1,
                  }}
                >
                  {mcpSaving ? "Adding..." : "Add Server"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Integration catalog grid */}
        {!mcpAdding && (() => {
          const connected = new Set(mcpServers.map(s => s.serverType));
          const filtered = mcpSuggestions.filter(s =>
            s.type !== "custom" &&
            (!mcpSearch || s.name.toLowerCase().includes(mcpSearch.toLowerCase()) || s.description.toLowerCase().includes(mcpSearch.toLowerCase()))
          );
          const visible = mcpShowAll ? filtered : filtered.slice(0, 18);
          const customSuggestion = mcpSuggestions.find(s => s.type === "custom");
          return (
            <div>
              {/* Header + count */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4b5563", textTransform: "uppercase" as const, letterSpacing: "0.05em", fontFamily: F }}>
                  {filtered.length}+ Integrations Ready to Connect
                </div>
              </div>

              {/* Search */}
              <input
                value={mcpSearch}
                onChange={(e) => setMcpSearch(e.target.value)}
                placeholder="Search integrations..."
                style={{
                  width: "100%", padding: "9px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
                  fontSize: 12.5, color: "#1b1b1b", outline: "none", backgroundColor: "#f9fafb",
                  fontFamily: "inherit", marginBottom: 14, boxSizing: "border-box" as const,
                }}
              />

              {/* Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 8,
              }}>
                {visible.map((s) => {
                  const isConnected = connected.has(s.type);
                  return (
                    <button
                      key={s.type}
                      onClick={() => {
                        setMcpAdding(s.type);
                        setMcpForm({ name: s.name, url: "", authToken: "" });
                        setMcpMessage(null);
                      }}
                      style={{
                        padding: "14px 8px", borderRadius: 12, cursor: "pointer",
                        border: `1px solid ${isConnected ? "#1e8e3e" + "40" : "#e5e7eb"}`,
                        backgroundColor: isConnected ? P.emeraldSoft : "#ffffff",
                        display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8,
                        fontFamily: "inherit", position: "relative" as const,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = s.color + "60";
                        e.currentTarget.style.backgroundColor = s.color + "08";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isConnected ? "#1e8e3e" + "40" : "#e5e7eb";
                        e.currentTarget.style.backgroundColor = isConnected ? P.emeraldSoft : "#ffffff";
                      }}
                    >
                      {isConnected && (
                        <div style={{
                          position: "absolute" as const, top: 4, right: 4,
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor: "#1e8e3e",
                        }} />
                      )}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: s.color + "15", color: s.color,
                        fontSize: 12, fontWeight: 800, flexShrink: 0,
                      }}>
                        {s.icon}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#1b1b1b", textAlign: "center" as const, lineHeight: 1.2, fontFamily: F }}>
                        {s.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Show more / Custom */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                {filtered.length > 18 && !mcpShowAll && (
                  <button
                    onClick={() => setMcpShowAll(true)}
                    style={{
                      fontSize: 12, fontWeight: 600, color: "#1e8e3e", cursor: "pointer",
                      background: "none", border: "none", fontFamily: "inherit", padding: 0,
                    }}
                  >
                    Show all {filtered.length} integrations
                  </button>
                )}
                {mcpShowAll && (
                  <button
                    onClick={() => setMcpShowAll(false)}
                    style={{
                      fontSize: 12, fontWeight: 600, color: "#4b5563", cursor: "pointer",
                      background: "none", border: "none", fontFamily: "inherit", padding: 0,
                    }}
                  >
                    Show less
                  </button>
                )}
                {customSuggestion && (
                  <button
                    onClick={() => {
                      setMcpAdding("custom");
                      setMcpForm({ name: "Custom Server", url: "", authToken: "" });
                      setMcpMessage(null);
                    }}
                    style={{
                      fontSize: 12, fontWeight: 600, color: "#1e8e3e", cursor: "pointer",
                      background: "none", border: "1.5px solid rgba(30,142,62,0.3)", borderRadius: 8,
                      fontFamily: "inherit", padding: "6px 14px", marginLeft: "auto",
                    }}
                  >
                    + Custom MCP Server
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {mcpMessage && (
          <div style={{
            marginTop: 12, padding: "8px 12px", borderRadius: 8,
            backgroundColor: mcpMessage.type === "success" ? P.emeraldSoft : P.coralSoft,
            border: `1px solid ${mcpMessage.type === "success" ? P.emerald + "30" : P.coral + "30"}`,
            fontSize: 12, color: mcpMessage.type === "success" ? "#1e8e3e" : P.coral,
            fontFamily: F,
          }}>
            {mcpMessage.type === "success" ? "ok " : "x "}{mcpMessage.text}
          </div>
        )}

        {/* Security info */}
        <div style={{
          marginTop: 14, padding: "12px 14px", borderRadius: 12,
          backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
        }}>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#4b5563", flexWrap: "wrap" as const, fontFamily: F }}>
            <span>AES-256 encrypted</span>
            <span>HTTPS required for remote</span>
            <span>30s timeout per tool call</span>
            <span>Max 20 servers</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{
        padding: "24px", background: "#ffffff", borderRadius: 16,
        border: "1px solid #e5e7eb", marginBottom: 16,
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.1s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4b5563", marginBottom: 10, fontFamily: F }}>Status</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: supabaseEnabled ? "#1e8e3e" : P.amber }} />
            <span style={{ fontSize: 13, color: "#1b1b1b", fontFamily: F }}>Database: <strong>{supabaseEnabled ? "Connected" : "Demo"}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: (openaiInfo?.hasKey || geminiInfo?.hasKey || anthropicInfo?.hasKey) ? "#1e8e3e" : "#d1d5db" }} />
            <span style={{ fontSize: 13, color: "#1b1b1b", fontFamily: F }}>
              AI: <strong>{openaiInfo?.hasKey ? "OpenAI active" : geminiInfo?.hasKey ? "Gemini active" : anthropicInfo?.hasKey ? "Claude active" : "No key — demo mode"}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Account */}
      <div style={{
        padding: "24px", background: "#ffffff", borderRadius: 16,
        border: "1px solid #e5e7eb",
        animation: "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4b5563", marginBottom: 10, fontFamily: F }}>Account</div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "8px 18px", borderRadius: 9,
            border: `1.5px solid ${P.coral}30`, backgroundColor: P.coralSoft,
            color: P.coral, fontSize: 12.5, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
