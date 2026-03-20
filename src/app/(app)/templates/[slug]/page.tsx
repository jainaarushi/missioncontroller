"use client";

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTask } from "@/lib/hooks/use-task";
import { P, F, FM } from "@/lib/palette";
import { AGENT_CATEGORY_MAP } from "@/lib/agent-categories";
import {
  CATEGORY_META,
  TEMPLATE_PIPELINES,
  TEMPLATE_RATINGS,
  TEMPLATE_RUNS,
  getTemplateRunConfig,
  getTemplateCategory,
} from "@/lib/template-agents";
import { getNodeGraph } from "@/lib/ai/nodes/graphs";
import UsedPieces from "@/components/pipeline/used-pieces";
import type { NodeStatus } from "@/lib/ai/nodes/types";
import type { TaskStep } from "@/lib/types/task";
import { MCP_SERVER_SUGGESTIONS, getAgentMCPRecommendation } from "@/lib/ai/mcp/suggestions";
import ActionButtons from "@/components/templates/action-buttons";
import LinkedInPublishButton from "@/components/templates/linkedin-publish-button";

const PipelineGraph = lazy(() => import("@/components/pipeline/pipeline-graph"));

/* ─── CSS Keyframes ─── */
function InjectKeyframes() {
  return (
    <style>{`
      @keyframes tpl-progress { 0%{transform:scaleX(0) translateX(0)} 50%{transform:scaleX(0.7) translateX(30%)} 100%{transform:scaleX(0) translateX(200%)} }
      @keyframes tpl-bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }
      @keyframes tpl-fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)} 50%{box-shadow:0 0 12px 4px rgba(239,68,68,0.15)} }
      .animate-spin { animation: spin 1s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
  );
}

/* ─── CostTicker ─── */
function CostTicker({ costUsd, tokensIn, tokensOut }: { costUsd: number; tokensIn: number; tokensOut: number }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ padding: "7px 12px", background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 8, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: P.amber, fontFamily: F, transition: "all 0.3s" }}>${costUsd.toFixed(3)}</div>
        <div style={{ fontSize: 8.5, color: P.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>Cost</div>
      </div>
      <div style={{ padding: "7px 12px", background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 8, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: P.teal, fontFamily: F, transition: "all 0.3s" }}>{(tokensIn + tokensOut).toLocaleString()}</div>
        <div style={{ fontSize: 8.5, color: P.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>Tokens</div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function TemplateRunPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { agents } = useAgents();
  const agent = agents.find(a => a.slug === slug);
  const nodeGraph = getNodeGraph(slug);

  const config = getTemplateRunConfig(slug);
  const pipeline = TEMPLATE_PIPELINES[slug] || [];
  const rating = TEMPLATE_RATINGS[slug] || 4.5;
  const runs = TEMPLATE_RUNS[slug] || "1.0k";
  const catId = AGENT_CATEGORY_MAP[slug] || getTemplateCategory(slug);
  const cat = CATEGORY_META[catId] || CATEGORY_META.career;

  const [phase, setPhase] = useState<"preview" | "input" | "running" | "done">("preview");
  const [taskInput, setTaskInput] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [authPrompt, setAuthPrompt] = useState<"login" | "apikey" | null>(null);
  const [authCountdown, setAuthCountdown] = useState(10);
  const [isStarting, setIsStarting] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [mcpHint, setMcpHint] = useState<string | null>(null);
  // Voice input
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // File upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ filename: string; mimeType: string; textContent: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  // Export
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Find MCP integrations that enhance this template
  const mcpRecommendation = getAgentMCPRecommendation(slug, []);
  const relevantIntegrations = mcpRecommendation
    ? MCP_SERVER_SUGGESTIONS.filter(s => mcpRecommendation.serverTypes.includes(s.type))
    : [];

  // Poll task while running
  const { task } = useTask(
    phase === "running" || phase === "done" ? taskId : null,
    { refreshInterval: phase === "running" ? 1500 : phase === "done" ? 2000 : 0 }
  );

  const steps: TaskStep[] = task?.steps || [];
  const taskDone = phase === "done" && task != null && (task.status === "review" || task.status === "done" || task.status === "failed");

  // Derive node statuses from task steps (for node graph animation)
  const nodeStatuses: NodeStatus[] = nodeGraph
    ? nodeGraph.nodes.map((_, i) => {
        const step = steps[i];
        if (!step) return "idle";
        if (step.status === "done") return "done";
        if (step.status === "working") return "running";
        if (step.status === "failed") return "failed";
        return "idle";
      })
    : [];

  // Switch to done phase
  useEffect(() => {
    if (task && (task.status === "review" || task.status === "done" || task.status === "failed") && phase === "running") {
      setPhase("done");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [task, phase]);

  // Timer
  useEffect(() => {
    if (phase === "running") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase]);

  // Auth countdown
  useEffect(() => {
    if (!authPrompt) return;
    setAuthCountdown(10);
    const iv = setInterval(() => {
      setAuthCountdown(c => {
        if (c <= 1) { clearInterval(iv); router.push(authPrompt === "login" ? "/login" : "/settings"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [authPrompt, router]);

  // Voice recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const pcm = decoded.getChannelData(0);
          const int16 = new Int16Array(pcm.length);
          for (let i = 0; i < pcm.length; i++) { const s = Math.max(-1, Math.min(1, pcm[i])); int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF; }
          const wavBuf = new ArrayBuffer(44 + int16.byteLength);
          const v = new DataView(wavBuf);
          const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
          ws(0,"RIFF"); v.setUint32(4,36+int16.byteLength,true); ws(8,"WAVE"); ws(12,"fmt ");
          v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
          v.setUint32(24,16000,true); v.setUint32(28,32000,true); v.setUint16(32,2,true); v.setUint16(34,16,true);
          ws(36,"data"); v.setUint32(40,int16.byteLength,true); new Int16Array(wavBuf,44).set(int16);
          const base64 = btoa(String.fromCharCode(...new Uint8Array(wavBuf)));
          audioCtx.close();
          const res = await fetch("/api/speech", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audio: base64 }) });
          const data = await res.json();
          if (res.ok && data.text) { setTaskInput((prev) => (prev ? prev + " " : "") + data.text); }
          else { setRunError(data.error || "Voice transcription failed. Configure Wispr key in Settings."); }
        } catch (err) { console.error(err); setRunError("Voice processing failed."); }
        finally { setTranscribing(false); }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch { setRunError("Microphone access denied."); }
  }

  function stopRecording() { mediaRecorderRef.current?.stop(); setRecording(false); }

  // File upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setRunError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { setRunError(data.error || "Upload failed"); return; }
      setUploadedFile(data.file);
    } catch { setRunError("Upload failed."); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  // Export as file download
  function downloadAsFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleRun = useCallback(async () => {
    if (!taskInput.trim() || !agent || isStarting) return;
    if (taskInput.length > 50000) { setRunError("Input is too long (max 50,000 characters)."); return; }
    setIsStarting(true);
    setRunError(null);

    try {
      const createRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `[${agent.name}] ${taskInput.slice(0, 100)}`,
          description: uploadedFile?.textContent
            ? `${taskInput}\n\n[Attached: ${uploadedFile.filename}]\n${uploadedFile.textContent}`
            : taskInput,
          section: "today",
        }),
      });
      if (!createRes.ok) { if (createRes.status === 401) { setAuthPrompt("login"); return; } setRunError("Failed to create task."); return; }
      const data = await createRes.json();
      setTaskId(data.id);

      const assignRes = await fetch(`/api/tasks/${data.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agent.id }),
      });
      if (!assignRes.ok) { if (assignRes.status === 401) { setAuthPrompt("login"); return; } setRunError("Failed to assign agent."); return; }

      const runRes = await fetch(`/api/tasks/${data.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!runRes.ok) {
        if (runRes.status === 401) { setAuthPrompt("login"); return; }
        if (runRes.status === 402) { setAuthPrompt("apikey"); return; }
        const errBody = await runRes.json().catch(() => null);
        setRunError(errBody?.error || `Pipeline failed to start (${runRes.status}).`);
        return;
      }

      // Capture MCP hint from response
      const runData = await runRes.json().catch(() => null);
      if (runData?.mcpHint) setMcpHint(runData.mcpHint);

      setPhase("running");
      setElapsed(0);
    } catch (err) {
      setRunError(`Network error: ${err instanceof Error ? err.message : "Could not reach server"}`);
    } finally {
      setIsStarting(false);
    }
  }, [taskInput, agent, isStarting]);

  const [copied, setCopied] = useState(false);
  const exportableOutput = task?.output || steps.map(s => s.output).filter(Boolean).join("\n\n") || "";
  const handleExport = useCallback(() => {
    if (exportableOutput) { navigator.clipboard.writeText(exportableOutput); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }, [exportableOutput]);

  const handleRunAgain = useCallback(() => { setPhase("input"); setTaskId(null); setElapsed(0); setUploadedFile(null); setExportMenuOpen(false); setMcpHint(null); }, []);

  const templateName = agent?.name || slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const templateIcon = agent?.icon || pipeline[0]?.icon || "🤖";
  const nodeCount = nodeGraph?.nodes.length || config.agents.length;
  const doneSteps = nodeStatuses.filter(s => s === "done").length;

  // Not found
  if (agents.length > 0 && !agent && !TEMPLATE_PIPELINES[slug] && !nodeGraph) {
    return (
      <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: F, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🤖</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Template not found</div>
        <div style={{ fontSize: 13, color: P.textSec }}>The template &quot;{slug}&quot; doesn&apos;t exist.</div>
        <button onClick={() => router.push("/templates")} style={{ marginTop: 8, padding: "10px 20px", borderRadius: 10, background: P.lime, color: "#0a0a0d", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: F }}>
          Browse Templates
        </button>
      </div>
    );
  }

  /* ── PREVIEW SCREEN (Activepieces-style) ── */
  if (phase === "preview") return (
    <div style={{ height: "100vh", background: P.bg, color: P.text, fontFamily: F, display: "flex", flexDirection: "column" }}>
      <InjectKeyframes />
      {/* Header */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${P.border}`, background: P.bg2, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={() => router.push("/templates")} style={{ fontSize: 12, color: P.textSec, background: "none", border: `1px solid ${P.border}`, borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: F }}>
          &#8592; All Templates
        </button>
        <div style={{ fontSize: 15 }}>{templateIcon}</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{templateName}</div>
        <span style={{ fontSize: 11, color: P.textSec }}>{cat.label}</span>
      </div>

      {/* 2-panel layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT panel — template info */}
        <div style={{ width: 380, borderRight: `1px solid ${P.border}`, background: P.bg2, padding: "28px 24px", overflowY: "auto", flexShrink: 0, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Name + rating */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{templateIcon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{templateName}</div>
                <div style={{ fontSize: 11, color: P.textSec, marginTop: 2 }}>&#9733; {rating} &middot; {runs} runs</div>
              </div>
            </div>
          </div>

          {/* Stats pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <div style={{ padding: "8px 14px", borderRadius: 8, background: `${P.teal}10`, border: `1px solid ${P.teal}22` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: P.teal }}>~{config.estimatedTime}</span>
              <span style={{ fontSize: 10, color: P.textSec, marginLeft: 6 }}>Est. time</span>
            </div>
            <div style={{ padding: "8px 14px", borderRadius: 8, background: `${P.amber}10`, border: `1px solid ${P.amber}22` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: P.amber }}>{config.estimatedCost}</span>
              <span style={{ fontSize: 10, color: P.textSec, marginLeft: 6 }}>Est. cost</span>
            </div>
            <div style={{ padding: "8px 14px", borderRadius: 8, background: `${P.violet}10`, border: `1px solid ${P.violet}22` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: P.violet2 }}>{nodeCount} steps</span>
            </div>
          </div>

          {/* Use Template button */}
          <button
            onClick={() => setPhase("input")}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 12,
              background: P.lime, color: "#0a0a0d", fontSize: 15, fontWeight: 800,
              border: "none", cursor: "pointer", fontFamily: F,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${P.lime}44`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Use Template &#8594;
          </button>

          {/* About */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>About this template</div>
            <div style={{ fontSize: 12.5, color: P.textSec, lineHeight: 1.7 }}>
              {agent?.long_description || agent?.description || config.tagline}
            </div>
          </div>

          {/* What's included */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>What&apos;s included</div>
            <div style={{ padding: "12px 14px", borderRadius: 10, background: P.bg3, border: `1px solid ${P.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{templateIcon}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{templateName}</span>
              </div>
              {nodeGraph && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {nodeGraph.pieces.map(p => (
                    <span key={p.name} style={{ fontSize: 14 }} title={p.name}>{p.icon}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Used Pieces */}
          {nodeGraph && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: P.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Used Pieces</div>
              <UsedPieces pieces={nodeGraph.pieces} />
            </div>
          )}

          {/* Supercharge with Integrations */}
          {relevantIntegrations.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: P.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Supercharge with Integrations</div>
              <div style={{ fontSize: 11, color: P.textTer, marginBottom: 10, lineHeight: 1.5 }}>
                {mcpRecommendation?.message}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {relevantIntegrations.map(s => (
                  <button
                    key={s.type}
                    onClick={() => router.push("/settings")}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", borderRadius: 10,
                      background: `${s.color}08`, border: `1.5px solid ${s.color}22`,
                      cursor: "pointer", fontFamily: F, transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + "55"; e.currentTarget.style.background = s.color + "12"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + "22"; e.currentTarget.style.background = s.color + "08"; }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: s.color + "18", color: s.color, fontSize: 9, fontWeight: 800,
                    }}>
                      {s.icon}
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: P.text }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: P.textTer }}>Connect in Settings</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT panel — Node graph */}
        <div style={{ flex: 1, background: P.bg, position: "relative" }}>
          {nodeGraph ? (
            <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: P.textTer, fontSize: 13 }}>Loading graph...</div>}>
              <PipelineGraph graph={nodeGraph} />
            </Suspense>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {config.agents.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${a.color}18`, border: `2px solid ${a.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{a.icon}</div>
                    {i < config.agents.length - 1 && <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg, ${a.color}66, ${config.agents[i + 1].color}66)` }} />}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: P.textTer }}>Pipeline preview</div>
            </div>
          )}
        </div>
      </div>

      {authPrompt && <AuthOverlay type={authPrompt} countdown={authCountdown} onClose={() => setAuthPrompt(null)} />}
    </div>
  );

  /* ── INPUT SCREEN ── */
  if (phase === "input") return (
    <div style={{ height: "100vh", background: P.bg, color: P.text, fontFamily: F, display: "flex", flexDirection: "column" }}>
      <InjectKeyframes />
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${P.border}`, background: P.bg2, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={() => setPhase("preview")} style={{ fontSize: 12, color: P.textSec, background: "none", border: `1px solid ${P.border}`, borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: F }}>
          &#8592; Back
        </button>
        <div style={{ fontSize: 15 }}>{templateIcon}</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{templateName}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {[
            { l: "Steps", v: String(nodeCount), c: P.violet2 },
            { l: "Est. time", v: config.estimatedTime, c: P.teal },
            { l: "Est. cost", v: config.estimatedCost, c: P.amber },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center", padding: "6px 14px", background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.c, fontFamily: F }}>{s.v}</div>
              <div style={{ fontSize: 9, color: P.textTer, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-panel: input on left, graph on right */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 580 }}>
            <div style={{ background: P.bg2, border: `1px solid ${P.border2}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <div style={{ padding: "24px 28px 20px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{config.inputLabel}</div>
                <div style={{ fontSize: 12.5, color: P.textSec, marginBottom: 20, lineHeight: 1.6 }}>{config.tagline}</div>
                <textarea
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  rows={6}
                  style={{
                    width: "100%", background: P.bg3, border: `1px solid ${P.border}`,
                    borderRadius: 12, padding: "14px 16px", color: P.text, fontFamily: F,
                    fontSize: 13, lineHeight: 1.7, outline: "none", resize: "vertical", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = P.violet + "88"}
                  onBlur={e => e.target.style.borderColor = P.border}
                  placeholder={config.inputPlaceholder}
                />
                {/* Voice + File buttons */}
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv,.json,.md,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileUpload} style={{ display: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={transcribing}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 14px", borderRadius: 10,
                      border: `1.5px solid ${recording ? "#EF4444" : P.border}`,
                      backgroundColor: recording ? "rgba(239,68,68,0.10)" : P.bg3,
                      color: recording ? "#EF4444" : P.textSec,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: F, transition: "all 0.15s",
                      opacity: transcribing ? 0.5 : 1,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {recording ? <rect x="6" y="6" width="12" height="12" rx="2" /> : (
                        <>
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                        </>
                      )}
                    </svg>
                    {transcribing ? "Transcribing..." : recording ? "Stop" : "Voice"}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "6px 14px", borderRadius: 10,
                      border: `1.5px solid ${P.border}`,
                      backgroundColor: P.bg3, color: P.textSec,
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: F, transition: "all 0.15s",
                      opacity: uploading ? 0.5 : 1,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {uploading ? "Uploading..." : "Attach"}
                  </button>
                  {uploadedFile && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 12px", borderRadius: 10,
                      backgroundColor: `${P.violet}08`, border: `1px solid ${P.violet}15`,
                      fontSize: 10, fontWeight: 600, color: P.text,
                    }}>
                      <span>&#128196;</span> {uploadedFile.filename}
                      <button onClick={() => setUploadedFile(null)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: P.textTer, fontSize: 10, padding: "0 2px", fontFamily: F,
                      }}>&#10005;</button>
                    </div>
                  )}
                </div>
                {runError && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", fontSize: 12, color: "#ef4444" }}>
                    {runError}
                  </div>
                )}
              </div>

              <div style={{ padding: "0 28px 20px" }}>
                <div style={{ fontSize: 10, color: P.textTer, marginBottom: 8 }}>Try an example &#8594;</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {config.quickFills.map((s, i) => (
                    <button key={i} onClick={() => setTaskInput(s)} style={{
                      fontSize: 11, padding: "5px 12px", borderRadius: 100,
                      background: P.bg4, border: `1px solid ${P.border2}`, color: P.textSec,
                      cursor: "pointer", fontFamily: F, transition: "all 0.15s",
                      maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${P.violet}18`; e.currentTarget.style.borderColor = `${P.violet}55`; e.currentTarget.style.color = P.violet2; }}
                    onMouseLeave={e => { e.currentTarget.style.background = P.bg4; e.currentTarget.style.borderColor = P.border2; e.currentTarget.style.color = P.textSec; }}>
                      {s.length > 40 ? s.slice(0, 40) + "..." : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Integration badges */}
              {relevantIntegrations.length > 0 && (
                <div style={{ padding: "0 28px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9.5, color: P.textTer, fontWeight: 600 }}>Works with:</span>
                    {relevantIntegrations.map(s => (
                      <button
                        key={s.type}
                        onClick={() => router.push("/settings")}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "3px 8px", borderRadius: 6,
                          background: `${s.color}08`, border: `1px solid ${s.color}18`,
                          cursor: "pointer", fontFamily: F, fontSize: 9, fontWeight: 700,
                          color: s.color,
                        }}
                        title={`Connect ${s.name} in Settings for enhanced results`}
                      >
                        <span style={{
                          width: 14, height: 14, borderRadius: 3, display: "inline-flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: s.color + "15", fontSize: 7, fontWeight: 800,
                        }}>
                          {s.icon}
                        </span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ padding: "16px 28px", background: P.bg3, borderTop: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: P.textSec }}>Using your API key &middot; ~{config.estimatedTime}</div>
                <button onClick={handleRun} disabled={!taskInput.trim() || isStarting}
                  style={{
                    display: "flex", alignItems: "center", gap: 9, padding: "11px 24px", borderRadius: 11,
                    background: taskInput.trim() && !isStarting ? P.lime : P.bg5,
                    color: taskInput.trim() && !isStarting ? "#0a0a0d" : P.textTer,
                    fontSize: 13, fontWeight: 700, border: "none",
                    cursor: taskInput.trim() && !isStarting ? "pointer" : "not-allowed",
                    fontFamily: F, opacity: isStarting ? 0.7 : 1,
                  }}>
                  <span>{isStarting ? "\u23F3" : "\u25B6"}</span> {isStarting ? "Starting..." : "Run Pipeline"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right — graph preview (read-only) */}
        {nodeGraph && (
          <div style={{ width: 400, borderLeft: `1px solid ${P.border}`, background: P.bg, flexShrink: 0 }}>
            <Suspense fallback={null}>
              <PipelineGraph graph={nodeGraph} />
            </Suspense>
          </div>
        )}
      </div>

      {authPrompt && <AuthOverlay type={authPrompt} countdown={authCountdown} onClose={() => setAuthPrompt(null)} />}
    </div>
  );

  /* ── RUNNING / DONE SCREEN ── */
  return (
    <div style={{ height: "100vh", background: P.bg, color: P.text, fontFamily: F, display: "flex", flexDirection: "column" }}>
      <InjectKeyframes />
      {/* Top bar */}
      <div style={{ padding: "12px 24px", borderBottom: `1px solid ${P.border}`, background: P.bg2, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={handleRunAgain} style={{ fontSize: 11.5, color: P.textSec, background: "none", border: `1px solid ${P.border}`, borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: F }}>
          &#8592; Back
        </button>
        <div style={{ fontSize: 15 }}>{templateIcon}</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{templateName}</div>

        {/* Progress */}
        <div style={{ flex: 1, maxWidth: 300, marginLeft: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: P.textSec }}>
              {taskDone ? "Complete" : `Step ${doneSteps + 1} of ${nodeCount}`}
            </span>
            <span style={{ fontSize: 10, color: P.textSec }}>
              {task ? `${task.progress}%` : `${Math.round((doneSteps / nodeCount) * 100)}%`}
            </span>
          </div>
          <div style={{ height: 3, background: P.bg4, borderRadius: 100, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              background: taskDone ? P.lime : `linear-gradient(90deg, ${P.violet}, ${P.lime})`,
              borderRadius: 100,
              width: task ? `${task.progress}%` : `${(doneSteps / nodeCount) * 100}%`,
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: P.textSec, background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 7, padding: "5px 11px", fontFamily: FM }}>
            &#9201; {task?.duration_seconds || elapsed}s
          </div>
          <CostTicker costUsd={task?.cost_usd || 0} tokensIn={task?.tokens_in || 0} tokensOut={task?.tokens_out || 0} />
          {taskDone && task?.status !== "failed" && taskId && (
            <>
            <LinkedInPublishButton agentSlug={slug} taskId={taskId} taskOutput={exportableOutput} />
            <div style={{ position: "relative" }}>
              <button onClick={() => setExportMenuOpen(!exportMenuOpen)} style={{ padding: "7px 16px", borderRadius: 9, background: copied ? P.green : P.lime, color: "#0a0a0d", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: F, display: "flex", alignItems: "center", gap: 5 }}>
                {copied ? "\u2713 Copied!" : "Export"} <span style={{ fontSize: 9 }}>\u25BC</span>
              </button>
              {exportMenuOpen && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4, zIndex: 50,
                  background: P.bg2, border: `1px solid ${P.border2}`, borderRadius: 10,
                  boxShadow: P.shadowFloat, overflow: "hidden", minWidth: 160,
                }}>
                  <button onClick={() => { handleExport(); setExportMenuOpen(false); }} style={{
                    width: "100%", padding: "9px 14px", background: "none", border: "none",
                    color: P.text, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: F,
                    textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = P.bg3}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span style={{ fontSize: 13 }}>&#128203;</span> Copy to Clipboard
                  </button>
                  <button onClick={() => { downloadAsFile(exportableOutput, `${slug}-result.md`, "text/markdown"); setExportMenuOpen(false); }} style={{
                    width: "100%", padding: "9px 14px", background: "none", border: "none",
                    color: P.text, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: F,
                    textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = P.bg3}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span style={{ fontSize: 13 }}>&#128196;</span> Download as .md
                  </button>
                  <button onClick={() => { downloadAsFile(exportableOutput, `${slug}-result.txt`, "text/plain"); setExportMenuOpen(false); }} style={{
                    width: "100%", padding: "9px 14px", background: "none", border: "none",
                    color: P.text, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: F,
                    textAlign: "left", display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = P.bg3}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <span style={{ fontSize: 13 }}>&#128209;</span> Download as .txt
                  </button>
                </div>
              )}
            </div>
          </>
          )}
        </div>
      </div>

      {/* Main 2-panel: output left, graph right */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* LEFT — Step timeline + output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Step timeline */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${P.border}`, background: P.bg2, overflowX: "auto", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {(nodeGraph?.nodes || []).map((node, i) => {
                const status = nodeStatuses[i] || "idle";
                return (
                  <div key={node.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{
                      padding: "5px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 600,
                      background: status === "done" ? `${node.color}15` : status === "running" ? `${node.color}10` : P.bg3,
                      color: status !== "idle" ? node.color : P.textTer,
                      border: `1px solid ${status === "running" ? node.color + "55" : status === "done" ? node.color + "33" : P.border}`,
                      whiteSpace: "nowrap", transition: "all 0.3s",
                    }}>
                      {status === "done" ? "✓" : status === "running" ? "⟳" : `${i + 1}`} {node.label}
                    </div>
                    {i < (nodeGraph?.nodes.length || 0) - 1 && (
                      <div style={{ width: 12, height: 1, background: status === "done" ? node.color + "66" : P.border }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* MCP integration hint */}
          {mcpHint && !taskDone && (
            <div style={{
              margin: "0 20px", marginTop: 12, padding: "10px 14px", borderRadius: 10,
              background: `${P.violet}08`, border: `1px solid ${P.violet}20`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 14 }}>&#9889;</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: P.textSec, lineHeight: 1.5 }}>{mcpHint}</div>
              </div>
              <button
                onClick={() => router.push("/settings")}
                style={{
                  fontSize: 10, fontWeight: 700, color: P.violet2, background: `${P.violet}15`,
                  border: `1px solid ${P.violet}30`, borderRadius: 6, padding: "4px 10px",
                  cursor: "pointer", fontFamily: F, whiteSpace: "nowrap",
                }}
              >
                Settings
              </button>
              <button
                onClick={() => setMcpHint(null)}
                style={{ background: "none", border: "none", color: P.textTer, cursor: "pointer", fontSize: 12, fontFamily: F }}
              >
                &#10005;
              </button>
            </div>
          )}

          {/* Output area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
            {exportableOutput ? (
              <div
                className="prose prose-invert prose-sm max-w-none"
                style={{
                  animation: "tpl-fadeUp 0.4s ease both",
                  padding: "16px 18px", background: P.bg3, borderRadius: 12,
                  border: `1px solid ${task?.status === "failed" ? "rgba(239,68,68,0.3)" : P.border}`,
                  fontSize: 12.5, lineHeight: 1.7, color: P.textSec,
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <div style={{ overflowX: "auto", margin: "12px 0" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th style={{ padding: "8px 12px", borderBottom: `2px solid ${P.border2}`, textAlign: "left", fontSize: 11, fontWeight: 700, color: P.text, background: P.bg4 }}>{children}</th>
                    ),
                    td: ({ children }) => (
                      <td style={{ padding: "7px 12px", borderBottom: `1px solid ${P.border}`, fontSize: 11.5, color: P.textSec }}>{children}</td>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: P.violet2, textDecoration: "underline", textUnderlineOffset: 2 }}>{children}</a>
                    ),
                    code: ({ children, className }) => {
                      const isBlock = className?.includes("language-");
                      return isBlock ? (
                        <pre style={{ background: P.bg4, borderRadius: 8, padding: "12px 16px", overflow: "auto", fontSize: 11.5, lineHeight: 1.6 }}>
                          <code>{children}</code>
                        </pre>
                      ) : (
                        <code style={{ background: P.bg4, padding: "1px 5px", borderRadius: 4, fontSize: "0.9em" }}>{children}</code>
                      );
                    },
                  }}
                >{exportableOutput}</ReactMarkdown>
              </div>
            ) : phase === "running" ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: P.violet, animation: `tpl-bounce 1.2s ease ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: P.textSec }}>{task?.current_step || "Starting pipeline..."}</div>
              </div>
            ) : null}

            {taskDone && (
              <>
                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  <button onClick={handleRunAgain} style={{ padding: "9px 18px", borderRadius: 9, background: P.bg4, border: `1px solid ${P.border2}`, color: P.textSec, fontSize: 11.5, cursor: "pointer", fontFamily: F, fontWeight: 600 }}>
                    &#8634; Run Again
                  </button>
                  {task?.status !== "failed" && (
                    <>
                      <button onClick={handleExport} style={{ padding: "9px 18px", borderRadius: 9, background: P.lime, border: "none", color: "#0a0a0d", fontSize: 11.5, cursor: "pointer", fontFamily: F, fontWeight: 700 }}>
                        {copied ? "\u2713 Copied!" : "&#128203; Copy Results"}
                      </button>
                      <button onClick={() => downloadAsFile(exportableOutput, `${slug}-result.md`, "text/markdown")} style={{ padding: "9px 18px", borderRadius: 9, background: P.bg4, border: `1px solid ${P.border2}`, color: P.textSec, fontSize: 11.5, cursor: "pointer", fontFamily: F, fontWeight: 600 }}>
                        &#128196; Download .md
                      </button>
                    </>
                  )}
                </div>
                {taskId && task?.status !== "failed" && (
                  <ActionButtons agentSlug={slug} taskId={taskId} taskOutput={exportableOutput} />
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT — Node graph with live status */}
        {nodeGraph && (
          <div style={{ width: 400, borderLeft: `1px solid ${P.border}`, background: P.bg, flexShrink: 0 }}>
            <Suspense fallback={null}>
              <PipelineGraph graph={nodeGraph} nodeStatuses={nodeStatuses} />
            </Suspense>
          </div>
        )}
      </div>

      {authPrompt && <AuthOverlay type={authPrompt} countdown={authCountdown} onClose={() => setAuthPrompt(null)} />}
    </div>
  );
}

/* ─── Auth Overlay ─── */
function AuthOverlay({ type, countdown, onClose }: { type: "login" | "apikey"; countdown: number; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
      <div style={{
        position: "relative", width: "min(480px, 90vw)", padding: "48px 28px",
        backgroundColor: P.bg2, borderRadius: 24, border: `1px solid ${P.border2}`,
        boxShadow: P.shadowFloat, textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: type === "login"
            ? `linear-gradient(90deg, ${P.violet}, ${P.rose})`
            : `linear-gradient(90deg, ${P.amber}, ${P.orange})`,
          borderRadius: "24px 24px 0 0",
        }} />
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
          background: type === "login"
            ? `linear-gradient(135deg, ${P.violet}, ${P.rose})`
            : `linear-gradient(135deg, ${P.amber}, ${P.orange})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        }}>
          {type === "login" ? "🔐" : "🔑"}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: P.text, letterSpacing: "-0.03em", margin: "0 0 8px", fontFamily: F }}>
          {type === "login" ? "Oh snap! You need to sign in" : "Almost there! Add your API key"}
        </h2>
        <p style={{ fontSize: 15, color: P.textSec, lineHeight: 1.6, margin: "0 0 28px", maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
          {type === "login"
            ? "Create a free account to run AI agents and unlock the full power of AgentStudio."
            : "Add your OpenAI, Gemini, or Anthropic API key in Settings to start running agents."}
        </p>
        <div style={{ width: "100%", height: 4, background: P.bg4, borderRadius: 100, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", background: type === "login" ? P.violet : P.amber, borderRadius: 100, width: `${(countdown / 10) * 100}%`, transition: "width 1s linear" }} />
        </div>
        <div style={{ fontSize: 12, color: P.textTer }}>
          Redirecting in {countdown}s...
        </div>
      </div>
    </div>
  );
}
