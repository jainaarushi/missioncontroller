"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/template-data";
import { api } from "@/lib/api";

interface ComposioStatusResponse {
  enabled: boolean;
  connections: Record<string, boolean>;
}

export default function TemplateConfigPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const template = getTemplate(slug);

  const rangeField = template?.formFields.find((f) => f.type === "range");
  const [rangeValue, setRangeValue] = useState(rangeField?.defaultValue ?? 25);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [composioConnections, setComposioConnections] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [composioMessage, setComposioMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadComposioStatus = useCallback(() => {
    api.get<ComposioStatusResponse>("/api/user/composio/status")
      .then((data) => {
        setComposioConnections(data.connections || {});
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadComposioStatus();
  }, [loadComposioStatus]);

  // Detect return from Composio OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const composioResult = params.get("composio");
    const appName = params.get("app");
    if (composioResult) {
      if (composioResult === "connected") {
        setComposioMessage({ text: `${appName || "App"} connected successfully!`, type: "success" });
        loadComposioStatus();
      } else {
        setComposioMessage({ text: `Failed to connect ${appName || "app"}. Please try again.`, type: "error" });
      }
      setTimeout(() => {
        window.history.replaceState({}, "", `/templates/${slug}`);
        setComposioMessage(null);
      }, 3000);
    }
  }, [loadComposioStatus, slug]);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-[#414753]">Template not found.</p>
      </div>
    );
  }

  const updateForm = (label: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [label]: value }));
  };

  // Map tool display names to Composio app keys
  const TOOL_TO_APP: Record<string, string> = {
    "LinkedIn": "linkedin",
    "Gmail": "gmail",
    "GitHub": "github",
    "Google Search": "google_search",
    "Google Sheets": "google_sheets",
    "Google Calendar": "google_calendar",
    "Yahoo Finance": "yahoo_finance",
  };

  const connectTool = async (toolName: string) => {
    const appKey = TOOL_TO_APP[toolName] || toolName.toLowerCase().replace(/\s+/g, "");
    setConnecting(toolName);
    try {
      const data = await api.post<{ redirectUrl: string; app: string }>("/api/user/composio/connect", {
        app: appKey,
        returnTo: `/templates/${slug}`,
      });
      if (data.redirectUrl) {
        // Navigate in same window — callback will redirect back here
        window.location.href = data.redirectUrl;
      }
    } catch {
      // If Composio not configured, redirect to settings
      router.push("/settings");
      setConnecting(null);
    }
  };

  // Check if a tool is connected via live Composio status, fallback to static
  const getToolConnected = (toolName: string): boolean => {
    const appKey = TOOL_TO_APP[toolName] || toolName.toLowerCase().replace(/\s+/g, "");
    if (composioConnections[appKey] !== undefined) return composioConnections[appKey];
    const staticTool = template.toolConnections.find((t) => t.name === toolName);
    return staticTool?.connected || false;
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Composio Toast */}
      {composioMessage && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold ${composioMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {composioMessage.text}
        </div>
      )}
      {/* Page Header */}
      <div className="flex items-center gap-4 px-8 pt-8 pb-4">
        <Link href="/templates">
          <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-[#1b1b1b] transition-colors">
            arrow_back
          </span>
        </Link>
        <h1 className="text-xl font-bold text-black">{template.configTitle}</h1>
      </div>

      <div className="px-8 pb-8 max-w-6xl mx-auto space-y-8">
        {/* Pipeline Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#414753]">
              Pipeline Overview
            </h2>
            <span className="text-xs text-[#3028e9] font-semibold bg-[#e1dfff] px-2 py-1 rounded">
              {template.pipelineNodes.length} Nodes Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
            {template.pipelineNodes.map((node, i) => (
              <div key={node.name} className="contents">
                {i > 0 && (
                  <div className="col-span-1 flex justify-center">
                    <span className="material-symbols-outlined text-[#c1c6d5]">trending_flat</span>
                  </div>
                )}
                <div className="col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                  <div className={`w-12 h-12 ${node.bgColor} ${node.textColor} rounded-lg flex items-center justify-center mb-3`}>
                    <span className="material-symbols-outlined">{node.icon}</span>
                  </div>
                  <h3 className="font-bold text-sm">{node.name}</h3>
                  <p className="text-xs text-[#414753] mt-1">{node.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Required Inputs */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#006c05]">tune</span>
                <h2 className="text-lg font-bold">Required Inputs</h2>
              </div>
              <div className="space-y-4">
                {template.formFields.map((field) => {
                  if (field.type === "text") {
                    return (
                      <div key={field.label} className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#1b1b1b]">{field.label}</label>
                        <input
                          className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
                          placeholder={field.placeholder}
                          type="text"
                          value={formValues[field.label] || ""}
                          onChange={(e) => updateForm(field.label, e.target.value)}
                        />
                        {field.hint && <p className="text-xs text-[#414753]">{field.hint}</p>}
                      </div>
                    );
                  }
                  if (field.type === "textarea") {
                    return (
                      <div key={field.label} className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#1b1b1b]">{field.label}</label>
                        <textarea
                          className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
                          placeholder={field.placeholder}
                          rows={4}
                          value={formValues[field.label] || ""}
                          onChange={(e) => updateForm(field.label, e.target.value)}
                        />
                      </div>
                    );
                  }
                  if (field.type === "range") {
                    return (
                      <div key={field.label} className="flex flex-col gap-4 pt-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-semibold text-[#1b1b1b]">{field.label}</label>
                          <span className="text-[#006c05] font-bold text-sm">{rangeValue} {field.unit}</span>
                        </div>
                        <input
                          className="w-full h-2 bg-[#e8e8e8] rounded-lg appearance-none cursor-pointer accent-[#006c05]"
                          max={field.max}
                          min={field.min}
                          type="range"
                          value={rangeValue}
                          onChange={(e) => setRangeValue(Number(e.target.value))}
                        />
                        {field.rangeLabels && (
                          <div className="flex justify-between text-[10px] text-[#414753] uppercase font-bold">
                            <span>{field.rangeLabels[0]}</span>
                            <span>{field.rangeLabels[1]}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </section>

          {/* Tool Connections */}
          <section className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#3028e9]">hub</span>
                <h2 className="text-lg font-bold">Tool Connections</h2>
              </div>
              <div className="space-y-4">
                {template.toolConnections.map((tool) => {
                  const isConnected = getToolConnected(tool.name);
                  return (
                    <div key={tool.name} className="p-4 rounded-lg bg-[#f3f3f3] border border-gray-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md flex items-center justify-center overflow-hidden bg-white border border-gray-200">
                            <img alt={tool.name} className="w-7 h-7 object-contain" src={tool.logo} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{tool.name}</p>
                            <p className={`text-[10px] font-semibold flex items-center gap-1 ${isConnected ? "text-[#006c05]" : "text-[#ba1a1a]"}`}>
                              <span className="material-symbols-outlined text-[12px]">
                                {isConnected ? "check_circle" : "error"}
                              </span>
                              {isConnected ? "Connected" : "Disconnected"}
                            </p>
                          </div>
                        </div>
                        {isConnected && (
                          <Link href="/settings">
                            <span className="material-symbols-outlined text-[#414753] cursor-pointer hover:text-[#1b1b1b]">settings</span>
                          </Link>
                        )}
                      </div>
                      {!isConnected && (
                        <div className="space-y-2">
                          <button
                            onClick={() => connectTool(tool.name)}
                            disabled={connecting === tool.name}
                            className="w-full py-2 bg-[#1b1b1b] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {connecting === tool.name ? "Connecting..." : "Connect Account"}
                          </button>
                          {tool.name === "LinkedIn" && (
                            <p className="text-[10px] text-[#717785] leading-relaxed">
                              LinkedIn OAuth requires email &amp; password login. If you use Google to sign in,{" "}
                              <a
                                href="https://www.linkedin.com/psettings/change-password"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#006c05] font-semibold hover:underline"
                              >
                                set a LinkedIn password first
                              </a>.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {template.composioPowered && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[#414753]">
                    <img
                      alt="Composio"
                      className="w-5 h-5 rounded shadow-sm"
                      src="https://img.logo.dev/composio.dev?token=pk_L7siVlltSTuo-xbA1lvUKA"
                    />
                    <p className="text-[11px] font-medium">Powered by Composio Secure Auth</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Launch Button */}
        <div className="pt-8 flex flex-col items-center gap-4">
          {template.warningText && (
            <div className="flex items-start gap-3 bg-[#ffdad6]/30 p-4 rounded-xl border border-[#ba1a1a]/10 max-w-2xl">
              <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
              <p className="text-xs text-[#93000a] leading-relaxed">
                <strong>Required Action:</strong> {template.warningText}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              // Save config for the drafting page to pick up
              sessionStorage.setItem(
                `template-config:${slug}`,
                JSON.stringify({ formValues, rangeValue })
              );
              router.push(`/templates/${slug}/drafting`);
            }}
            className="w-full max-w-md py-4 bg-[#006c05] text-white font-black rounded-xl flex items-center justify-center gap-3 text-lg hover:bg-[#008808] transition-colors active:scale-[0.98]"
          >
            Launch Pipeline
            <span className="material-symbols-outlined">rocket_launch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
