"use client";

import { useState, useEffect, useCallback } from "react";
import { P, F } from "@/lib/palette";

const LI_COLOR = "#0A66C2";

// Slugs that should show the LinkedIn publish button
const LINKEDIN_SLUGS = new Set(["social-media"]);

function extractLinkedInPost(output: string): string {
  // Try marker-based extraction first
  const markerMatch = output.match(/---START LINKEDIN---\n?([\s\S]*?)\n?---END LINKEDIN---/);
  if (markerMatch) return markerMatch[1].trim();

  // Try "## LinkedIn Post" section
  const sectionMatch = output.match(/##\s*LinkedIn Post[^\n]*\n([\s\S]*?)(?=\n##\s|\n---|\$)/);
  if (sectionMatch) {
    const text = sectionMatch[1]
      .replace(/\*\*/g, "")
      .replace(/^[>\-\*]\s*/gm, "")
      .trim();
    if (text.length > 20) return text;
  }

  // Fallback: first 3000 chars
  return output.slice(0, 3000);
}

interface Props {
  agentSlug: string;
  taskId: string;
  taskOutput: string;
}

export default function LinkedInPublishButton({ agentSlug, taskId, taskOutput }: Props) {
  const [status, setStatus] = useState<"checking" | "not-connected" | "ready" | "publishing" | "posted" | "error">("checking");
  const [showDialog, setShowDialog] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [publishError, setPublishError] = useState("");

  if (!LINKEDIN_SLUGS.has(agentSlug)) return null;

  // Check Composio LinkedIn connection status
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/user/composio/status");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setStatus(data.enabled && data.connections?.linkedin ? "ready" : "not-connected");
      } catch {
        if (!cancelled) setStatus("not-connected");
      }
    }
    check();
    return () => { cancelled = true; };
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/user/composio/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data.enabled && data.connections?.linkedin ? "ready" : "not-connected");
      }
    } catch { /* ignore */ }
  }, []);

  async function handleConnect() {
    setConnecting(true);
    setConnectError("");
    try {
      const res = await fetch("/api/user/composio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app: "linkedin", returnTo: window.location.pathname }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Connection failed" }));
        throw new Error(data.error || "Connection failed");
      }
      const { redirectUrl } = await res.json();

      // Open OAuth in popup
      const w = 600, h = 700;
      const left = window.screenX + (window.innerWidth - w) / 2;
      const top = window.screenY + (window.innerHeight - h) / 2;
      const popup = window.open(redirectUrl, "composio_connect", `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`);

      // Poll for popup close
      const interval = setInterval(async () => {
        if (popup && popup.closed) {
          clearInterval(interval);
          await refreshStatus();
          setConnecting(false);
          setShowDialog(false);
        }
      }, 500);
    } catch (err) {
      setConnecting(false);
      setConnectError(err instanceof Error ? err.message : "Connection failed");
    }
  }

  async function handlePublish() {
    setStatus("publishing");
    setPublishError("");
    try {
      const text = extractLinkedInPost(taskOutput);
      const res = await fetch(`/api/tasks/${taskId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ composioAction: "LINKEDIN_CREATE_POST", composioParams: { text } }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Publish failed" }));
        throw new Error(data.error || `Failed (${res.status})`);
      }
      setStatus("posted");
      setTimeout(() => setStatus("ready"), 5000);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed");
      setStatus("error");
      setTimeout(() => setStatus("ready"), 5000);
    }
  }

  if (status === "checking") {
    return (
      <div style={{
        padding: "7px 16px", borderRadius: 9,
        background: `${LI_COLOR}15`, border: `1px solid ${LI_COLOR}33`,
        width: 140, height: 34,
        animation: "tpl-fadeUp 0.3s ease both",
      }} />
    );
  }

  // Not connected — show connect button that opens dialog
  if (status === "not-connected") {
    return (
      <>
        <button onClick={() => setShowDialog(true)} style={{
          padding: "7px 16px", borderRadius: 9,
          background: `${LI_COLOR}15`, border: `1px solid ${LI_COLOR}44`,
          color: LI_COLOR, fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: F,
          display: "flex", alignItems: "center", gap: 7,
          transition: "all 0.2s",
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: 5,
            background: LI_COLOR, color: "#fff",
            fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>in</span>
          Publish to LinkedIn
        </button>

        {showDialog && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }} onClick={(e) => { if (e.target === e.currentTarget) setShowDialog(false); }}>
            <div style={{
              background: P.bg2, border: `1px solid ${P.border2}`, borderRadius: 16,
              padding: "28px 32px", maxWidth: 400, width: "90%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 13, margin: "0 auto 16px",
                background: LI_COLOR, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 900, color: "#fff",
              }}>in</div>

              <h3 style={{
                fontFamily: F, fontSize: 16, fontWeight: 700, textAlign: "center",
                color: P.text, margin: "0 0 8px",
              }}>Connect LinkedIn</h3>

              <p style={{
                fontFamily: F, fontSize: 12, color: P.textSec, textAlign: "center",
                lineHeight: 1.6, margin: "0 0 20px",
              }}>
                Publish your AI-generated posts directly to LinkedIn with one click.
                Connect your account to get started.
              </p>

              {connectError && (
                <div style={{
                  fontSize: 11, color: "#ef4444", background: "#ef444412",
                  border: "1px solid #ef444433", borderRadius: 8,
                  padding: "8px 12px", marginBottom: 14, textAlign: "center",
                }}>{connectError}</div>
              )}

              <button onClick={handleConnect} disabled={connecting} style={{
                width: "100%", padding: "11px 0", borderRadius: 10,
                background: LI_COLOR, border: "none", color: "#fff",
                fontSize: 13, fontWeight: 700, fontFamily: F,
                cursor: connecting ? "wait" : "pointer",
                opacity: connecting ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {connecting && (
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.6s linear infinite",
                  }} />
                )}
                {connecting ? "Connecting..." : "Connect LinkedIn Account"}
              </button>

              <button onClick={() => setShowDialog(false)} style={{
                width: "100%", padding: "8px 0", marginTop: 8,
                background: "transparent", border: "none",
                color: P.textTer, fontSize: 11, fontFamily: F, cursor: "pointer",
              }}>Cancel</button>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        )}
      </>
    );
  }

  // Connected — show publish button
  return (
    <button
      onClick={() => status === "ready" && handlePublish()}
      disabled={status === "publishing"}
      title={publishError || "Publish to LinkedIn"}
      style={{
        padding: "7px 16px", borderRadius: 9,
        background: status === "posted" ? `${LI_COLOR}22` : LI_COLOR,
        border: status === "error" ? "1px solid #ef4444" : `1px solid ${LI_COLOR}`,
        color: status === "posted" ? LI_COLOR : status === "error" ? "#ef4444" : "#fff",
        fontSize: 12, fontWeight: 700,
        cursor: status === "publishing" ? "wait" : "pointer",
        fontFamily: F,
        display: "flex", alignItems: "center", gap: 7,
        transition: "all 0.2s",
        opacity: status === "publishing" ? 0.7 : 1,
      }}
    >
      <span style={{
        width: 20, height: 20, borderRadius: 5,
        background: status === "posted" ? `${LI_COLOR}33` : "rgba(255,255,255,0.2)",
        color: status === "posted" ? LI_COLOR : "#fff",
        fontSize: 9, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>in</span>
      {status === "publishing" && (
        <>
          <span style={{
            width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)",
            borderTop: "2px solid #fff", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.6s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
      {status === "posted" ? "Posted to LinkedIn!" : status === "error" ? "Failed" : status === "publishing" ? "Publishing..." : "Publish to LinkedIn"}
    </button>
  );
}
