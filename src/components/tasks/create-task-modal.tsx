"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { AgentInputForm } from "@/components/agents/agent-input-form";
import { suggestAgents } from "@/lib/utils/agent-suggest";
import { AGENT_INPUT_CONFIGS, serializeAgentInput, generateTaskTitle } from "@/lib/agent-ui/input-registry";
import { getPipeline, type PipelineStep } from "@/lib/ai/pipelines";
import { PipelineBuilder } from "@/components/pipeline/pipeline-builder";
import { P } from "@/lib/palette";
import type { Agent } from "@/lib/types/agent";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, agentIds?: string[], fileContent?: string, customPipeline?: PipelineStep[]) => void;
  agents: Agent[];
  preSelectedAgentId?: string;
}

const CATEGORIES = [
  { id: "all", icon: "🌟", label: "All Agents" },
  { id: "research", icon: "🔭", label: "Research" },
  { id: "writing", icon: "✒️", label: "Writing" },
  { id: "code", icon: "💻", label: "Code" },
  { id: "data", icon: "📊", label: "Data" },
  { id: "business", icon: "♟️", label: "Business" },
  { id: "finance", icon: "💹", label: "Finance" },
  { id: "planning", icon: "📋", label: "Planning" },
  { id: "health", icon: "💪", label: "Health" },
  { id: "fun", icon: "🔥", label: "Fun" },
];

const CATEGORY_AGENTS: Record<string, string[]> = {
  "all": [],
  "research": ["deep-research", "fact-checker", "startup-trends", "academic-researcher", "web-intel", "competitor-intel", "market-sizing", "vc-due-diligence"],
  "writing": ["content-creator", "technical-writer", "editor", "blog-to-podcast", "email-drafter", "journalist", "newsletter-agent", "video-script"],
  "code": ["system-architect", "python-expert", "fullstack-developer", "code-reviewer", "debugger", "devops-agent"],
  "data": ["data-analyst", "visualization-expert"],
  "business": ["strategy-advisor", "sales-rep", "product-launch", "customer-support", "pricing-strategist", "proposal-writer", "ad-copy", "seo-agent", "social-media"],
  "finance": ["investment-analyst", "personal-finance"],
  "planning": ["project-planner", "sprint-planner", "meeting-notes", "decision-helper", "startup-idea-gen", "ux-designer"],
  "health": ["fitness-coach", "recipe-planner", "mental-wellbeing", "travel-planner"],
  "fun": ["roast-master", "song-lyrics", "linkedin-post", "cover-letter"],
};

// Quick mission templates
const MISSION_TEMPLATES = [
  { title: "Research top competitors in my space", icon: "🔍", color: "#6366F1" },
  { title: "Roast me based on my LinkedIn bio", icon: "🔥", color: "#EF4444" },
  { title: "Write a viral LinkedIn post about AI", icon: "💼", color: "#0A66C2" },
  { title: "Create a 4-week workout plan", icon: "💪", color: "#14B8A6" },
  { title: "Debug this error in my React app", icon: "🐛", color: "#E11D48" },
  { title: "Analyze my investment portfolio", icon: "📈", color: "#059669" },
];

export function CreateTaskModal({ open, onClose, onSubmit, agents, preSelectedAgentId }: CreateTaskModalProps) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [missionTitle, setMissionTitle] = useState("");
  const [recruitedIds, setRecruitedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [agentSearch, setAgentSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ filename: string; mimeType: string; textContent: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [agentFormValues, setAgentFormValues] = useState<Record<string, unknown>>({});
  const [launching, setLaunching] = useState(false);
  const [customPipeline, setCustomPipeline] = useState<PipelineStep[] | null>(null);

  // Smart suggestions based on mission description
  const suggestions = useMemo(() => suggestAgents(missionTitle, agents), [missionTitle, agents]);

  // Agent-specific input config
  const activeAgentSlug = recruitedIds.length === 1
    ? agents.find((a) => a.id === recruitedIds[0])?.slug
    : undefined;
  const agentInputConfig = activeAgentSlug ? AGENT_INPUT_CONFIGS[activeAgentSlug] : undefined;

  useEffect(() => {
    if (open) {
      setStage(preSelectedAgentId ? 2 : 1);
      setRecruitedIds(preSelectedAgentId ? [preSelectedAgentId] : []);
      setMissionTitle("");
      setAgentSearch("");
      setActiveCategory("all");
      setLaunching(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setStage(1);
      setRecruitedIds([]);
      setMissionTitle("");
      setUploadedFile(null);
      setRecording(false);
      setTranscribing(false);
      setAgentFormValues({});
      setLaunching(false);
      setCustomPipeline(null);
    }
  }, [open, preSelectedAgentId]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (stage > 1) setStage((s) => (s - 1) as 1 | 2 | 3);
        else onClose();
      }
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose, stage]);

  if (!open) return null;

  function toggleRecruit(agentId: string) {
    setRecruitedIds((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : prev.length < 3 ? [...prev, agentId] : prev
    );
  }

  function handleLaunchMission() {
    let text = missionTitle.trim();
    let fileContent = uploadedFile?.textContent
      ? `[Attached: ${uploadedFile.filename}]\n${uploadedFile.textContent}`
      : undefined;

    if (agentInputConfig && activeAgentSlug && Object.keys(agentFormValues).length > 0) {
      if (!text) text = generateTaskTitle(activeAgentSlug, agentFormValues);
      const formDesc = serializeAgentInput(agentFormValues);
      const formFile = agentFormValues.file as { filename: string; textContent: string } | null;
      if (formFile?.textContent) {
        fileContent = (fileContent ? fileContent + "\n\n" : "") + `[Attached: ${formFile.filename}]\n${formFile.textContent}`;
      }
      fileContent = (fileContent ? fileContent + "\n\n" : "") + formDesc;
    }

    if (!text) return;

    setLaunching(true);
    setTimeout(() => {
      onSubmit(text, recruitedIds.length > 0 ? recruitedIds : undefined, fileContent, customPipeline || undefined);
      setMissionTitle("");
      setRecruitedIds([]);
      setUploadedFile(null);
      setAgentFormValues({});
      setCustomPipeline(null);
      setLaunching(false);
      onClose();
    }, 600);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 10MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Upload failed"); return; }
      setUploadedFile(data.file);
    } catch { alert("Upload failed."); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

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
          if (res.ok && data.text) { setMissionTitle((prev) => (prev ? prev + " " : "") + data.text); }
          else { alert(data.error || "Voice transcription failed"); }
        } catch (err) { alert("Voice processing failed."); console.error(err); }
        finally { setTranscribing(false); }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch { alert("Microphone access denied."); }
  }

  function stopRecording() { mediaRecorderRef.current?.stop(); setRecording(false); }

  const recruitedAgents = recruitedIds.map((id) => agents.find((a) => a.id === id)).filter(Boolean) as Agent[];

  // Filter agents for stage 2
  const categorySlugs = CATEGORY_AGENTS[activeCategory] || [];
  const filteredAgents = activeCategory === "all"
    ? agents
    : agents.filter((a) => categorySlugs.includes(a.slug));
  const searchFiltered = agentSearch.trim()
    ? filteredAgents.filter((a) =>
        a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
        (a.description || "").toLowerCase().includes(agentSearch.toLowerCase())
      )
    : filteredAgents;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 700,
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        paddingTop: "4vh",
      }}
    >
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0.7) 100%)",
        backdropFilter: "blur(12px)",
        animation: "fadeIn 0.2s ease",
      }} />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: stage === 2 ? "min(920px, 95vw)" : "min(680px, 95vw)",
          maxHeight: "90vh",
          backgroundColor: P.bg2, borderRadius: 24,
          border: `1px solid ${P.border2}`,
          boxShadow: P.shadowFloat,
          position: "relative",
          animation: "modalIn 0.35s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Progress bar */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${P.indigo} ${stage * 33}%, ${P.border} ${stage * 33}%)`,
          transition: "background 0.4s ease",
        }} />

        {/* Header */}
        <div style={{
          padding: "20px 28px 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {stage > 1 && (
              <button
                onClick={() => setStage((s) => (s - 1) as 1 | 2 | 3)}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  border: `1px solid ${P.border}`, backgroundColor: P.card,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 16, color: P.textSec,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
              >
                ←
              </button>
            )}
            <div>
              <h2 style={{
                fontSize: 20, fontWeight: 800, color: P.text, margin: 0,
                letterSpacing: "-0.03em",
              }}>
                {stage === 1 ? "Describe Your Mission" : stage === 2 ? "Recruit Your Team" : "Launch Mission"}
              </h2>
              <div style={{ fontSize: 12, color: P.textTer, marginTop: 2 }}>
                {stage === 1 ? "What do you need done?" : stage === 2 ? `Select up to 3 agents (${recruitedIds.length}/3)` : "Review and deploy your team"}
              </div>
            </div>
          </div>

          {/* Stage indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{
                width: s === stage ? 28 : 8, height: 8, borderRadius: 4,
                backgroundColor: s <= stage ? P.indigo : P.border,
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
              }} />
            ))}
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10, marginLeft: 8,
                border: `1px solid ${P.border}`, backgroundColor: P.card,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16, color: P.textTer,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 28px" }}>
          {/* ─── STAGE 1: Describe the Mission ─── */}
          {stage === 1 && (
            <div style={{ animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
              {/* Main input */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 18px", borderRadius: 14,
                border: `2px solid ${P.indigo}25`,
                backgroundColor: P.sidebar,
                marginBottom: 16,
                transition: "border-color 0.2s",
              }}>
                <span style={{ fontSize: 20 }}>🎯</span>
                <input
                  ref={inputRef}
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && missionTitle.trim()) {
                      setStage(2);
                    }
                  }}
                  placeholder="What's the mission? e.g. Research AI trends in healthcare"
                  style={{
                    flex: 1, border: "none", outline: "none",
                    fontSize: 16, color: P.text, backgroundColor: "transparent",
                    fontWeight: 500, fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Voice + File + Attachment indicator */}
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv,.json,.md,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileUpload} style={{ display: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={transcribing}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 10,
                    border: `1.5px solid ${recording ? "#EF4444" : P.border}`,
                    backgroundColor: recording ? "rgba(239,68,68,0.10)" : P.card,
                    color: recording ? "#EF4444" : P.textSec,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    opacity: transcribing ? 0.5 : 1,
                    animation: recording ? "pulseGlow 1.5s ease-in-out infinite" : "none",
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
                    backgroundColor: P.card, color: P.textSec,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
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
                    backgroundColor: P.indigo + "08", border: `1px solid ${P.indigo}15`,
                    fontSize: 11, fontWeight: 600, color: P.text,
                  }}>
                    📄 {uploadedFile.filename}
                    <button onClick={() => setUploadedFile(null)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: P.textTer, fontSize: 10, padding: "0 2px",
                    }}>✕</button>
                  </div>
                )}
              </div>

              {/* Quick missions */}
              <div style={{
                fontSize: 13, fontWeight: 700, color: P.textSec,
                marginBottom: 12, letterSpacing: "0.02em",
              }}>
                Quick missions
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {MISSION_TEMPLATES.map((tpl, i) => (
                  <div
                    key={tpl.title}
                    onClick={() => { setMissionTitle(tpl.title); setStage(2); }}
                    style={{
                      padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                      backgroundColor: P.sidebar,
                      border: "1.5px solid transparent",
                      transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                      animation: `fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s both`,
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tpl.color + "08";
                      e.currentTarget.style.borderColor = tpl.color + "25";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = P.sidebar;
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span style={{
                      fontSize: 20, width: 38, height: 38, borderRadius: 10,
                      backgroundColor: tpl.color + "12",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {tpl.icon}
                    </span>
                    <span style={{ fontSize: 13.5, fontWeight: 550, color: P.text, lineHeight: 1.4 }}>
                      {tpl.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => { if (missionTitle.trim()) setStage(2); }}
                disabled={!missionTitle.trim()}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: 14,
                  border: "none",
                  background: missionTitle.trim() ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : P.border,
                  color: missionTitle.trim() ? "#fff" : P.textTer,
                  fontSize: 15, fontWeight: 700, cursor: missionTitle.trim() ? "pointer" : "default",
                  fontFamily: "inherit",
                  boxShadow: missionTitle.trim() ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                Recruit Your Team
                <span style={{ fontSize: 18 }}>→</span>
              </button>
            </div>
          )}

          {/* ─── STAGE 2: Recruit Your Team ─── */}
          {stage === 2 && (
            <div style={{ animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
              {/* Mission reminder */}
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                backgroundColor: P.indigo + "06", border: `1px solid ${P.indigo}15`,
                marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>🎯</span>
                <span style={{ fontSize: 13, color: P.text, fontWeight: 500 }}>{missionTitle}</span>
              </div>

              {/* AI suggestions */}
              {suggestions.length > 0 && recruitedIds.length === 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: P.indigo,
                    marginBottom: 8, display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span>✨</span> Recommended for this mission
                  </div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                    {suggestions.slice(0, 4).map(({ agent, reason }, i) => (
                      <div
                        key={agent.id}
                        onClick={() => toggleRecruit(agent.id)}
                        style={{
                          minWidth: 140, padding: "12px", borderRadius: 14,
                          backgroundColor: P.sidebar, border: `2px solid ${P.indigo}15`,
                          cursor: "pointer", textAlign: "center",
                          transition: "all 0.2s",
                          animation: `popIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s both`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = agent.color + "40";
                          e.currentTarget.style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = P.indigo + "15";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* Avatar */}
                        <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={52} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 2, marginTop: 8 }}>{agent.name}</div>
                        <div style={{ fontSize: 10, color: P.textTer, lineHeight: 1.3 }}>{reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search + Category filter */}
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 12px", borderRadius: 10,
                  border: `1.5px solid ${P.border}`, backgroundColor: P.card,
                }}>
                  <span style={{ fontSize: 14, color: P.textTer }}>🔍</span>
                  <input
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    placeholder="Search agents..."
                    style={{
                      flex: 1, border: "none", outline: "none",
                      fontSize: 13, color: P.text, backgroundColor: "transparent",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Category pills */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "5px 12px", borderRadius: 20,
                        border: isActive ? "none" : `1.5px solid ${P.border}`,
                        backgroundColor: isActive ? P.indigo : P.card,
                        color: isActive ? "#fff" : P.textSec,
                        fontSize: 11.5, fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit", transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 12 }}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Agent grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 10, maxHeight: 320, overflowY: "auto",
                paddingRight: 4,
              }}>
                {searchFiltered.map((agent, i) => {
                  const isRecruited = recruitedIds.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      onClick={() => toggleRecruit(agent.id)}
                      style={{
                        padding: "14px 12px", borderRadius: 16, cursor: "pointer",
                        backgroundColor: isRecruited ? agent.color + "0a" : P.sidebar,
                        border: `2px solid ${isRecruited ? agent.color + "50" : "transparent"}`,
                        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
                        animation: `popIn 0.35s cubic-bezier(0.16,1,0.3,1) ${Math.min(i * 0.02, 0.3)}s both`,
                        textAlign: "center",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        if (!isRecruited) {
                          e.currentTarget.style.backgroundColor = agent.color + "08";
                          e.currentTarget.style.borderColor = agent.color + "25";
                          e.currentTarget.style.transform = "translateY(-3px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isRecruited) {
                          e.currentTarget.style.backgroundColor = P.sidebar;
                          e.currentTarget.style.borderColor = "transparent";
                          e.currentTarget.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      {/* Recruited badge */}
                      {isRecruited && (
                        <div style={{
                          position: "absolute", top: 8, right: 8,
                          width: 22, height: 22, borderRadius: 7,
                          backgroundColor: agent.color, color: "#fff",
                          fontSize: 11, fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          animation: "popIn 0.3s cubic-bezier(0.16,1,0.3,1)",
                          boxShadow: `0 2px 8px ${agent.color}40`,
                        }}>
                          {recruitedIds.indexOf(agent.id) + 1}
                        </div>
                      )}

                      <div style={{ margin: "0 auto 8px" }}>
                        <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={52} />
                      </div>

                      <div style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 2 }}>
                        {agent.name}
                      </div>
                      <div style={{
                        fontSize: 10, color: P.textTer, lineHeight: 1.3,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                      }}>
                        {agent.description || "AI specialist"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recruited team bar + next button */}
              <div style={{
                marginTop: 20, display: "flex", alignItems: "center", gap: 14,
              }}>
                {/* Team preview */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  {recruitedAgents.length === 0 ? (
                    <span style={{ fontSize: 13, color: P.textTer }}>Select agents to build your team</span>
                  ) : (
                    <>
                      <div style={{ display: "flex", marginLeft: 4 }}>
                        {recruitedAgents.map((agent, i) => {
                          return (
                            <div key={agent.id} style={{
                              width: 36, height: 36, borderRadius: 12,
                              overflow: "hidden", border: `2px solid ${P.card}`,
                              marginLeft: i > 0 ? -10 : 0,
                              zIndex: 10 - i,
                              animation: `popIn 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                            }}>
                              <div style={{
                                width: "100%", height: "100%",
                                background: agent.gradient,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16,
                              }}>
                                {agent.icon}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: P.text }}>
                          {recruitedAgents.map((a) => a.name).join(" → ")}
                        </div>
                        <div style={{ fontSize: 10, color: P.textTer }}>
                          {recruitedAgents.length === 1 ? "Solo mission" : `Team of ${recruitedAgents.length} — each builds on the previous`}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (recruitedIds.length > 0) setStage(3);
                    else if (missionTitle.trim()) handleLaunchMission();
                  }}
                  disabled={!missionTitle.trim() && recruitedIds.length === 0}
                  style={{
                    padding: "12px 24px", borderRadius: 12,
                    border: "none",
                    background: recruitedIds.length > 0
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                      : missionTitle.trim()
                      ? P.coralGrad
                      : P.border,
                    color: recruitedIds.length > 0 || missionTitle.trim() ? "#fff" : P.textTer,
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: recruitedIds.length > 0 ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 6,
                    flexShrink: 0,
                  }}
                >
                  {recruitedIds.length > 0 ? "Review Mission" : "Create Task"}
                  <span style={{ fontSize: 16 }}>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── STAGE 3: Launch Mission ─── */}
          {stage === 3 && (
            <div style={{ animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
              {/* Mission briefing card */}
              <div style={{
                padding: "24px", borderRadius: 18,
                background: "linear-gradient(135deg, #6366F108, #8B5CF608)",
                border: `1px solid ${P.indigo}15`,
                marginBottom: 24,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: P.indigo,
                  letterSpacing: "0.06em", marginBottom: 12,
                  textTransform: "uppercase" as const,
                }}>
                  Mission Briefing
                </div>

                {/* Mission title */}
                <div style={{
                  fontSize: 18, fontWeight: 700, color: P.text,
                  marginBottom: 20, lineHeight: 1.4,
                }}>
                  {missionTitle}
                </div>

                {/* Attached file */}
                {uploadedFile && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8,
                    backgroundColor: P.card, border: `1px solid ${P.border}`,
                    marginBottom: 16, width: "fit-content",
                    fontSize: 12, fontWeight: 500, color: P.textSec,
                  }}>
                    📄 {uploadedFile.filename}
                  </div>
                )}

                {/* Team lineup */}
                <div style={{
                  fontSize: 11, fontWeight: 700, color: P.textTer,
                  letterSpacing: "0.06em", marginBottom: 12,
                  textTransform: "uppercase" as const,
                }}>
                  Team ({recruitedAgents.length})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recruitedAgents.map((agent, i) => {
                    return (
                      <div
                        key={agent.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "14px 16px", borderRadius: 14,
                          backgroundColor: P.card,
                          border: `1px solid ${agent.color}15`,
                          animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both`,
                        }}
                      >
                        {/* Order badge */}
                        <div style={{
                          width: 24, height: 24, borderRadius: 8,
                          backgroundColor: agent.color, color: "#fff",
                          fontSize: 12, fontWeight: 800,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>

                        <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={42} />

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: P.text }}>{agent.name}</div>
                          <div style={{ fontSize: 11, color: P.textTer }}>{agent.description || "AI specialist"}</div>
                        </div>

                        {/* Role label */}
                        <div style={{
                          fontSize: 10, fontWeight: 700, color: agent.color,
                          padding: "3px 10px", borderRadius: 6,
                          backgroundColor: agent.color + "10",
                        }}>
                          {i === 0 ? "Lead" : i === recruitedAgents.length - 1 ? "Closer" : "Support"}
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => toggleRecruit(agent.id)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: P.textTer, fontSize: 14, padding: "0 4px",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#EF4444"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = P.textTer; }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Pipeline steps preview — draggable builder */}
                {recruitedAgents.length > 0 && (() => {
                  const leadSlug = recruitedAgents[0]?.slug || "";
                  const pipelineSteps = customPipeline || getPipeline(leadSlug);
                  return (
                    <div style={{ marginTop: 16 }}>
                      <PipelineBuilder
                        steps={pipelineSteps}
                        agentColor={recruitedAgents[0].color}
                        agentGradient={recruitedAgents[0].gradient}
                        editable={true}
                        onReorder={(newSteps) => setCustomPipeline(newSteps)}
                        onAddStep={(afterIdx, step) => {
                          const current = [...(customPipeline || getPipeline(leadSlug))];
                          current.splice(afterIdx + 1, 0, step);
                          setCustomPipeline(current);
                        }}
                        onRemoveStep={(idx) => {
                          const current = [...(customPipeline || getPipeline(leadSlug))];
                          current.splice(idx, 1);
                          setCustomPipeline(current);
                        }}
                      />
                      {recruitedAgents.length > 1 && (
                        <div style={{
                          marginTop: 8, padding: "8px 12px", borderRadius: 8,
                          backgroundColor: P.sidebar,
                          fontSize: 11, color: P.textSec, lineHeight: 1.5,
                        }}>
                          <span style={{ fontWeight: 700 }}>Team flow:</span>{" "}
                          {recruitedAgents.map((a) => a.name).join(" → ")}
                          {" — each agent builds on the previous output."}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Agent-specific input form (if single agent selected) */}
              {agentInputConfig && recruitedAgents.length === 1 && (
                <div style={{
                  marginBottom: 20, padding: "18px 20px", borderRadius: 14,
                  backgroundColor: P.card,
                  border: `1.5px solid ${recruitedAgents[0].color}20`,
                  animation: "fadeUp 0.3s cubic-bezier(0.22,1,0.36,1)",
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: recruitedAgents[0].color,
                    marginBottom: 14, textTransform: "uppercase" as const, letterSpacing: "0.04em",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 14 }}>{recruitedAgents[0].icon}</span>
                    {recruitedAgents[0].name} Details
                  </div>
                  <AgentInputForm
                    config={agentInputConfig}
                    agentColor={recruitedAgents[0].color}
                    values={agentFormValues}
                    onChange={setAgentFormValues}
                  />
                </div>
              )}

              {/* Launch button */}
              <button
                onClick={handleLaunchMission}
                disabled={launching}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 16,
                  border: "none",
                  background: launching
                    ? "linear-gradient(135deg, #10B981, #34D399)"
                    : "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",
                  color: "#fff",
                  fontSize: 16, fontWeight: 800, cursor: launching ? "default" : "pointer",
                  fontFamily: "inherit",
                  boxShadow: launching
                    ? "0 4px 20px rgba(16,185,129,0.4)"
                    : "0 4px 24px rgba(99,102,241,0.35)",
                  transition: "all 0.3s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  letterSpacing: "-0.01em",
                  animation: launching ? "none" : "none",
                }}
              >
                {launching ? (
                  <>
                    <span style={{
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }}>🚀</span>
                    Deploying Team...
                  </>
                ) : (
                  <>
                    🚀 Launch Mission
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .create-modal-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
