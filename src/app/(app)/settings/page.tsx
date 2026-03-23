"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

const LOGO_TOKEN = "pk_L7siVlltSTuo-xbA1lvUKA";

const AI_PROVIDERS = [
  {
    key: "openai",
    name: "OpenAI",
    model: "GPT-4o Mini",
    placeholder: "sk-...",
    logo: `https://img.logo.dev/openai.com?token=${LOGO_TOKEN}`,
    bgFallback: "bg-black",
  },
  {
    key: "gemini",
    name: "Google Gemini",
    model: "Free Tier",
    placeholder: "AIzaSy...",
    logo: `https://img.logo.dev/deepmind.google?token=${LOGO_TOKEN}`,
    bgFallback: "bg-blue-500",
  },
];

const TOOL_KEYS = [
  {
    key: "tavily",
    name: "Tavily",
    icon: "travel_explore",
    iconColor: "text-blue-500",
    description: "Professional web search for agents.",
    placeholder: "tvly-...",
  },
  {
    key: "firecrawl",
    name: "Firecrawl",
    icon: "webhook",
    iconColor: "text-orange-500",
    description: "High-speed web scraping & crawling.",
    placeholder: "fc-...",
  },
  {
    key: "serp",
    name: "SerpAPI",
    icon: "search_insights",
    iconColor: "text-purple-500",
    description: "Google Search results API access.",
    placeholder: "serp-...",
  },
];

const INTEGRATION_ICONS = [
  "terminal", "database", "forum", "mail",
  "calendar_month", "cloud", "code", "analytics",
  "storage", "dataset", "api", "share",
  "folder_shared", "shield", "layers", "integration_instructions",
];

const CONNECTED_APPS = [
  { key: "linkedin", name: "LinkedIn", logo: `https://img.logo.dev/linkedin.com?token=${LOGO_TOKEN}`, hint: "LinkedIn OAuth requires your LinkedIn email & password. If you sign in to LinkedIn with Google, you'll need to set a LinkedIn password first at linkedin.com/psettings/change-password" },
  { key: "gmail", name: "Gmail", logo: `https://img.logo.dev/gmail.com?token=${LOGO_TOKEN}` },
  { key: "github", name: "GitHub", logo: `https://img.logo.dev/github.com?token=${LOGO_TOKEN}` },
];

interface KeyInfo {
  hasKey: boolean;
  maskedKey: string;
}

interface KeyStatus {
  openai: KeyInfo | null;
  gemini: KeyInfo | null;
  anthropic: KeyInfo | null;
  wispr: KeyInfo | null;
  tavily: KeyInfo | null;
  firecrawl: KeyInfo | null;
  serp: KeyInfo | null;
  provider: string;
}

interface ComposioStatusResponse {
  enabled: boolean;
  connections: Record<string, boolean>;
  usage?: { used: number; limit: number; month: string };
}

export default function SettingsPage() {
  const [keyStatus, setKeyStatus] = useState<KeyStatus | null>(null);
  const [composioConnections, setComposioConnections] = useState<Record<string, boolean>>({});
  const [composioEnabled, setComposioEnabled] = useState(false);
  const [composioUsage, setComposioUsage] = useState<{ used: number; limit: number } | null>(null);
  const [providerInputs, setProviderInputs] = useState<Record<string, string>>({});
  const [toolInputs, setToolInputs] = useState<Record<string, string>>({});
  const [anthropicInput, setAnthropicInput] = useState("");
  const [wisprInput, setWisprInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadKeyStatus = useCallback(async () => {
    try {
      const data = await api.get<KeyStatus>("/api/user/api-key");
      setKeyStatus(data);
    } catch {
      // Demo mode or error — leave as null
    }
  }, []);

  const loadComposioStatus = useCallback(async () => {
    try {
      const data = await api.get<ComposioStatusResponse>("/api/user/composio/status");
      setComposioEnabled(data.enabled);
      setComposioConnections(data.connections || {});
      if (data.usage) setComposioUsage({ used: data.usage.used, limit: data.usage.limit });
    } catch {
      // Composio not configured — ignore
    }
  }, []);

  useEffect(() => {
    loadKeyStatus();
    loadComposioStatus();
  }, [loadKeyStatus, loadComposioStatus]);

  // Detect return from Composio OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const composioResult = params.get("composio");
    const appName = params.get("app");
    if (composioResult) {
      if (composioResult === "connected") {
        setMessage({ text: `${appName || "App"} connected successfully!`, type: "success" });
        loadComposioStatus();
      } else {
        setMessage({ text: `Failed to connect ${appName || "app"}. Please try again.`, type: "error" });
      }
      // Clean up URL params
      setTimeout(() => {
        window.history.replaceState({}, "", "/settings");
        setMessage(null);
      }, 3000);
    }
  }, [loadComposioStatus]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveKey = async (provider: string, keyValue: string) => {
    if (!keyValue.trim()) return;
    setSaving(provider);
    try {
      await api.post("/api/user/api-key", { api_key: keyValue.trim(), provider });
      showMessage(`${provider} key saved successfully`, "success");
      // Clear input
      if (provider === "anthropic") setAnthropicInput("");
      else if (provider === "wispr") setWisprInput("");
      else if (["openai", "gemini"].includes(provider)) setProviderInputs((p) => ({ ...p, [provider]: "" }));
      else setToolInputs((p) => ({ ...p, [provider]: "" }));
      loadKeyStatus();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to save key", "error");
    } finally {
      setSaving(null);
    }
  };

  const removeKey = async (provider: string) => {
    setSaving(`del-${provider}`);
    try {
      await api.del(`/api/user/api-key?provider=${provider}`);
      showMessage(`${provider} key removed`, "success");
      loadKeyStatus();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to remove key", "error");
    } finally {
      setSaving(null);
    }
  };

  const connectApp = async (appKey: string) => {
    try {
      const data = await api.post<{ redirectUrl: string; app: string }>("/api/user/composio/connect", {
        app: appKey,
        returnTo: "/settings",
      });
      if (data.redirectUrl) {
        // Navigate in the same window — OAuth callback will redirect back here
        window.location.href = data.redirectUrl;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start connection";
      if (msg.includes("not configured")) {
        showMessage("Composio is not configured. Set COMPOSIO_API_KEY in your environment.", "error");
      } else if (msg.includes("Sign in") || msg.includes("401")) {
        showMessage("Sign in to connect apps", "error");
      } else {
        showMessage(msg, "error");
      }
    }
  };

  const disconnectApp = async (appKey: string, appName: string) => {
    try {
      await api.post("/api/user/composio/disconnect", { app: appKey });
      showMessage(`${appName} disconnected`, "success");
      loadComposioStatus();
    } catch {
      showMessage("Failed to disconnect", "error");
    }
  };

  // LinkedIn cookie state
  const [liCookieInput, setLiCookieInput] = useState("");
  const [liCookieStatus, setLiCookieStatus] = useState<{ hasCookie: boolean; maskedCookie: string | null } | null>(null);

  const loadLiCookieStatus = useCallback(async () => {
    try {
      const data = await api.get<{ hasCookie: boolean; maskedCookie: string | null }>("/api/user/linkedin-cookie");
      setLiCookieStatus(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadLiCookieStatus(); }, [loadLiCookieStatus]);

  const saveLiCookie = async () => {
    if (!liCookieInput.trim()) return;
    setSaving("linkedin-cookie");
    try {
      const data = await api.post<{ success: boolean; maskedCookie: string }>("/api/user/linkedin-cookie", { cookie: liCookieInput.trim() });
      setLiCookieStatus({ hasCookie: true, maskedCookie: data.maskedCookie });
      setLiCookieInput("");
      showMessage("LinkedIn cookie saved and validated", "success");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "Failed to save cookie", "error");
    } finally {
      setSaving(null);
    }
  };

  const removeLiCookie = async () => {
    setSaving("del-linkedin-cookie");
    try {
      await api.del("/api/user/linkedin-cookie");
      setLiCookieStatus({ hasCookie: false, maskedCookie: null });
      showMessage("LinkedIn cookie removed", "success");
    } catch {
      showMessage("Failed to remove cookie", "error");
    } finally {
      setSaving(null);
    }
  };

  const hasAnyKey = keyStatus && (keyStatus.openai || keyStatus.gemini || keyStatus.anthropic);

  return (
    <div className="p-4 md:p-8 bg-[#f9f9f9] min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Toast */}
        {message && (
          <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        {/* Header & Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e8e8e8] pb-6">
          <div>
            <h1 className="text-3xl font-black text-[#1b1b1b] tracking-tight">
              Studio Settings
            </h1>
            <p className="text-[#414753] mt-1">
              Configure your orchestration environment and AI credentials.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#f3f3f3] px-4 py-2 rounded-xl border border-[#c1c6d5]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006c05]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#414753]">
                DB: Connected
              </span>
            </div>
            <div className="w-px h-4 bg-[#c1c6d5]" />
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hasAnyKey ? "bg-[#006c05]" : "bg-[#ba1a1a]"}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#414753]">
                AI: {hasAnyKey ? "Configured" : "No Key"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI Providers */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c05]">psychology</span>
                  AI Providers
                </h2>
                <span className="text-[10px] px-2 py-1 bg-[#4d4bff] text-white rounded font-bold uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">lock</span>
                  AES-256 Encrypted
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_PROVIDERS.map((provider) => {
                  const info = keyStatus?.[provider.key as keyof KeyStatus] as KeyInfo | null;
                  return (
                    <div key={provider.key} className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                            <img alt={provider.name} className="w-8 h-8 object-contain" src={provider.logo} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{provider.name}</h3>
                            <p className="text-[10px] text-[#414753]">{provider.model}</p>
                          </div>
                        </div>
                        {info?.hasKey ? (
                          <span className="text-[10px] font-bold text-[#006c05] bg-green-50 px-2 py-0.5 rounded-full">
                            {info.maskedKey}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#717785]">Not set</span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          className="w-full text-xs bg-[#f3f3f3] border border-[#c1c6d5] rounded-lg px-3 py-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                          placeholder={provider.placeholder}
                          type="password"
                          value={providerInputs[provider.key] || ""}
                          onChange={(e) => setProviderInputs((p) => ({ ...p, [provider.key]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button
                            className="flex-1 bg-[#1b1b1b] text-white text-xs py-2 rounded-lg font-bold hover:bg-[#303030] transition-colors disabled:opacity-50"
                            disabled={saving === provider.key || !providerInputs[provider.key]?.trim()}
                            onClick={() => saveKey(provider.key, providerInputs[provider.key] || "")}
                          >
                            {saving === provider.key ? "Saving..." : "Save Provider"}
                          </button>
                          {info?.hasKey && (
                            <button
                              className="text-xs px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                              disabled={saving === `del-${provider.key}`}
                              onClick={() => removeKey(provider.key)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Anthropic Claude - Full Width */}
                <div className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                        <img alt="Anthropic" className="w-8 h-8 object-contain" src={`https://img.logo.dev/anthropic.com?token=${LOGO_TOKEN}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Anthropic Claude</h3>
                        <p className="text-[10px] text-[#414753]">Claude 3.5 Sonnet</p>
                      </div>
                    </div>
                    {(keyStatus?.anthropic as KeyInfo | null)?.hasKey ? (
                      <span className="text-[10px] font-bold text-[#006c05] bg-green-50 px-2 py-0.5 rounded-full">
                        {(keyStatus?.anthropic as KeyInfo)?.maskedKey}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#717785]">Not set</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <input
                      className="flex-1 text-xs bg-[#f3f3f3] border border-[#c1c6d5] rounded-lg px-3 py-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                      placeholder="sk-ant-..."
                      type="password"
                      value={anthropicInput}
                      onChange={(e) => setAnthropicInput(e.target.value)}
                    />
                    <button
                      className="bg-[#1b1b1b] text-white px-6 text-xs py-2 rounded-lg font-bold hover:bg-[#303030] transition-colors disabled:opacity-50"
                      disabled={saving === "anthropic" || !anthropicInput.trim()}
                      onClick={() => saveKey("anthropic", anthropicInput)}
                    >
                      {saving === "anthropic" ? "Saving..." : "Save"}
                    </button>
                    {(keyStatus?.anthropic as KeyInfo | null)?.hasKey && (
                      <button
                        className="text-xs px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        disabled={saving === "del-anthropic"}
                        onClick={() => removeKey("anthropic")}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Tool API Keys */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c05]">construction</span>
                Tool API Keys
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TOOL_KEYS.map((tool) => {
                  const info = keyStatus?.[tool.key as keyof KeyStatus] as KeyInfo | null;
                  return (
                    <div key={tool.key} className="bg-white p-4 rounded-xl border border-[#e8e8e8]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`material-symbols-outlined ${tool.iconColor}`}>{tool.icon}</span>
                        <span className="font-bold text-sm">{tool.name}</span>
                        {info?.hasKey && (
                          <span className="text-[9px] font-bold text-[#006c05] bg-green-50 px-1.5 py-0.5 rounded ml-auto">Active</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#414753] mb-3">{tool.description}</p>
                      <input
                        className="w-full text-[10px] bg-[#f3f3f3] border border-[#c1c6d5] rounded-md px-3 py-1.5 mb-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                        placeholder={tool.placeholder}
                        type="password"
                        value={toolInputs[tool.key] || ""}
                        onChange={(e) => setToolInputs((p) => ({ ...p, [tool.key]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <button
                          className="flex-1 text-[10px] py-1.5 font-bold border border-[#1b1b1b] rounded-md hover:bg-[#1b1b1b] hover:text-white transition-colors disabled:opacity-50"
                          disabled={saving === tool.key || !toolInputs[tool.key]?.trim()}
                          onClick={() => saveKey(tool.key, toolInputs[tool.key] || "")}
                        >
                          {saving === tool.key ? "Saving..." : "Save"}
                        </button>
                        {info?.hasKey && (
                          <button
                            className="text-[10px] py-1.5 px-2 font-bold border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                            onClick={() => removeKey(tool.key)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Marketplace Integrations */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c05]">hub</span>
                  Marketplace Integrations
                </h2>
                <span className="text-[#3028e9] text-xs font-bold">
                  Show all 32 integrations
                </span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {INTEGRATION_ICONS.map((icon) => (
                  <div
                    key={icon}
                    className="aspect-square bg-white rounded-lg border border-[#e8e8e8] flex items-center justify-center group hover:border-[#006c05] transition-colors"
                    title="Coming soon"
                  >
                    <span className="material-symbols-outlined text-[#414753] group-hover:text-[#006c05] transition-colors">
                      {icon}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* My AI Avatars */}
            <section className="bg-[#ece0d6] border border-[#c1c6d5] p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#201b15]">
                <span className="material-symbols-outlined">face</span>
                My AI Avatars
              </h2>
              <div className="aspect-video bg-white border-2 border-dashed border-[#717785] rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-[#f9f9f9] transition-colors">
                <span className="material-symbols-outlined text-4xl text-[#c1c6d5] mb-3 opacity-50">auto_fix_high</span>
                <p className="text-sm font-black text-[#1b1b1b] uppercase tracking-widest opacity-40">Coming Soon</p>
                <p className="text-[10px] text-[#414753] mt-1 font-medium">Custom Ghibli-style avatars are in training.</p>
              </div>
              <div className="bg-[#e1dfff] text-[#3028e9] p-3 rounded-lg text-[10px] flex gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>Requires <strong>Gemini API key</strong> for image generation processing.</span>
              </div>
            </section>

            {/* Voice Input */}
            <section className="bg-white border border-[#e8e8e8] p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c05]">mic</span>
                <h2 className="text-lg font-bold">Voice Input</h2>
                {(keyStatus?.wispr as KeyInfo | null)?.hasKey && (
                  <span className="text-[9px] font-bold text-[#006c05] bg-green-50 px-1.5 py-0.5 rounded ml-auto">Active</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <img alt="Wispr Flow" className="w-6 h-6 rounded" src={`https://img.logo.dev/wisprflow.ai?token=${LOGO_TOKEN}`} />
                <span className="font-bold text-sm">Wispr Flow</span>
              </div>
              <input
                className="w-full text-xs bg-[#f3f3f3] border border-[#c1c6d5] rounded-lg px-3 py-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                placeholder="Flow API Key"
                type="password"
                value={wisprInput}
                onChange={(e) => setWisprInput(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 text-center text-xs text-white font-bold py-2 bg-[#1b1b1b] rounded-lg hover:bg-[#303030] transition-colors disabled:opacity-50"
                  disabled={saving === "wispr" || !wisprInput.trim()}
                  onClick={() => saveKey("wispr", wisprInput)}
                >
                  {saving === "wispr" ? "Saving..." : "Save Wispr Key"}
                </button>
                <a
                  className="text-center text-xs text-[#3028e9] font-bold py-2 px-3 bg-[#e1dfff] rounded-lg hover:bg-[#c1c1ff] transition-colors"
                  href="https://platform.wisprflow.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Key
                </a>
              </div>
            </section>

            {/* LinkedIn Cookie */}
            <section className="bg-white border border-[#e8e8e8] p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                  <img alt="LinkedIn" className="w-7 h-7 object-contain" src={`https://img.logo.dev/linkedin.com?token=${LOGO_TOKEN}`} />
                </div>
                <h2 className="text-lg font-bold">LinkedIn Outreach</h2>
                {liCookieStatus?.hasCookie && (
                  <span className="text-[9px] font-bold text-[#006c05] bg-green-50 px-1.5 py-0.5 rounded ml-auto">Active</span>
                )}
              </div>
              <p className="text-[10px] text-[#414753] leading-relaxed">
                Paste your LinkedIn <code className="bg-gray-100 px-1 rounded">li_at</code> session cookie to enable direct outreach.
                Find it in browser DevTools → Application → Cookies → linkedin.com → <code className="bg-gray-100 px-1 rounded">li_at</code>.
              </p>
              {liCookieStatus?.hasCookie && liCookieStatus.maskedCookie && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                  <span className="material-symbols-outlined text-sm text-[#006c05]">check_circle</span>
                  <span className="text-xs font-semibold text-[#006c05]">{liCookieStatus.maskedCookie}</span>
                </div>
              )}
              <input
                className="w-full text-xs bg-[#f3f3f3] border border-[#c1c6d5] rounded-lg px-3 py-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                placeholder="AQEDAx..."
                type="password"
                value={liCookieInput}
                onChange={(e) => setLiCookieInput(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 text-center text-xs text-white font-bold py-2 bg-[#1b1b1b] rounded-lg hover:bg-[#303030] transition-colors disabled:opacity-50"
                  disabled={saving === "linkedin-cookie" || !liCookieInput.trim()}
                  onClick={saveLiCookie}
                >
                  {saving === "linkedin-cookie" ? "Validating..." : "Save Cookie"}
                </button>
                {liCookieStatus?.hasCookie && (
                  <button
                    className="text-xs px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    disabled={saving === "del-linkedin-cookie"}
                    onClick={removeLiCookie}
                  >
                    Remove
                  </button>
                )}
              </div>
            </section>

            {/* Connected Apps */}
            <section className="bg-white border border-[#e8e8e8] p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold">Connected Apps</h2>
              <div className="space-y-3">
                {CONNECTED_APPS.map((app) => {
                  const connected = composioConnections[app.key] || false;
                  return (
                    <div key={app.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                            <img alt={app.name} className="w-7 h-7 object-contain" src={app.logo} />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{app.name}</p>
                            <p className="text-[10px] text-[#414753]">
                              {connected
                                ? composioUsage ? `${composioUsage.used} / ${composioUsage.limit} runs` : "Connected"
                                : composioEnabled ? "Not connected" : "Composio not configured"}
                            </p>
                          </div>
                        </div>
                        {connected ? (
                          <button
                            className="text-[10px] font-bold px-3 py-1 bg-[#006c05] text-white rounded-full hover:bg-red-500 transition-colors"
                            onClick={() => disconnectApp(app.key, app.name)}
                          >
                            Active
                          </button>
                        ) : (
                          <button
                            className="text-[10px] font-bold px-3 py-1 border border-[#717785] rounded-full hover:bg-[#eeeeee] transition-colors"
                            onClick={() => connectApp(app.key)}
                          >
                            Connect
                          </button>
                        )}
                      </div>
                      {!connected && app.hint && (
                        <p className="text-[10px] text-[#717785] leading-relaxed pl-11">
                          {app.hint.split("linkedin.com/psettings/change-password")[0]}
                          <a
                            href="https://www.linkedin.com/psettings/change-password"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#006c05] font-semibold hover:underline"
                          >
                            Set a LinkedIn password
                          </a>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Sign Out */}
            <section className="p-6 border border-[#ffdad6] bg-[#ffdad6]/20 rounded-2xl flex flex-col items-center">
              <div className="w-12 h-12 bg-[#ba1a1a] rounded-full flex items-center justify-center text-white mb-3">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <h3 className="font-bold text-[#1b1b1b]">Account Access</h3>
              <p className="text-xs text-[#414753] text-center mt-1 mb-4">
                Sign out of your current session.
              </p>
              <button
                className="w-full bg-[#ba1a1a] text-white py-2 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all"
                onClick={async () => {
                  const supabase = createBrowserClient();
                  if (supabase) await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
              >
                Sign Out
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
