"use client";

import { useState, useEffect, useRef } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import { useTask } from "@/lib/hooks/use-task";
import { useAgents } from "@/lib/hooks/use-agents";
import { P } from "@/lib/palette";
import { getPipeline } from "@/lib/ai/pipelines";
import type { TaskWithAgent } from "@/lib/types/task";

interface TaskDetailModalProps {
  task: TaskWithAgent | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onConfetti?: () => void;
}

export function TaskDetailModal({ task: initialTask, open, onClose, onUpdate, onConfetti }: TaskDetailModalProps) {
  const { task: fullTask, mutate: mutateTask } = useTask(open && initialTask ? initialTask.id : null);
  const { agents } = useAgents();
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [loginPromptMsg, setLoginPromptMsg] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ filename: string; mimeType: string; textContent: string | null; base64Image: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const task = fullTask || initialTask;

  // Reset user input when modal opens with a new task
  useEffect(() => {
    if (open) { setUserInput(""); setUploadedFile(null); setShowFeedback(false); setFeedback(""); setLoginPrompt(false); setLoginPromptMsg(""); }
  }, [open, initialTask?.id]);

  // Auto-refresh while task is working
  useEffect(() => {
    if (!open || !task || task.status !== "working") return;
    const interval = setInterval(() => {
      mutateTask();
    }, 1000);
    return () => clearInterval(interval);
  }, [open, task?.status, mutateTask]);

  if (!task || !open) return null;

  const agent = task.agent;
  const isReview = task.status === "review";
  const isWorking = task.status === "working";
  const isTodo = task.status === "todo";
  const isFailed = task.status === "failed";

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
      if (task?.id) formData.append("taskId", task.id);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }
      setUploadedFile(data.file);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        // Convert to base64 WAV via AudioContext
        setTranscribing(true);
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioCtx = new AudioContext({ sampleRate: 16000 });
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const pcm = decoded.getChannelData(0);

          // Convert float32 PCM to int16 PCM
          const int16 = new Int16Array(pcm.length);
          for (let i = 0; i < pcm.length; i++) {
            const s = Math.max(-1, Math.min(1, pcm[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Build WAV file
          const wavBuffer = new ArrayBuffer(44 + int16.byteLength);
          const view = new DataView(wavBuffer);
          const writeStr = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
          writeStr(0, "RIFF");
          view.setUint32(4, 36 + int16.byteLength, true);
          writeStr(8, "WAVE");
          writeStr(12, "fmt ");
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true); // PCM
          view.setUint16(22, 1, true); // mono
          view.setUint32(24, 16000, true); // sample rate
          view.setUint32(28, 32000, true); // byte rate
          view.setUint16(32, 2, true); // block align
          view.setUint16(34, 16, true); // bits per sample
          writeStr(36, "data");
          view.setUint32(40, int16.byteLength, true);
          new Int16Array(wavBuffer, 44).set(int16);

          const base64 = btoa(String.fromCharCode(...new Uint8Array(wavBuffer)));
          audioCtx.close();

          // Send to our speech API
          const res = await fetch("/api/speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64 }),
          });
          const data = await res.json();
          if (res.ok && data.text) {
            setUserInput((prev) => (prev ? prev + " " : "") + data.text);
          } else {
            alert(data.error || "Voice transcription failed");
          }
        } catch (err) {
          alert("Voice processing failed. Please try again.");
          console.error("Voice error:", err);
        } finally {
          setTranscribing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert("Microphone access denied. Please allow microphone access.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleRun() {
    setLoading(true);
    try {
      let description = userInput.trim();
      if (uploadedFile?.textContent) {
        description = (description ? description + "\n\n" : "") +
          `--- Uploaded File: ${uploadedFile.filename} ---\n${uploadedFile.textContent}`;
      }
      if (description) {
        await fetch(`/api/tasks/${task!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        });
      }
      const res = await fetch(`/api/tasks/${task!.id}/run`, { method: "POST" });
      if (res.status === 401) {
        setLoginPrompt(true);
        setTimeout(() => { window.location.href = "/login"; }, 2500);
        return;
      }
      if (res.status === 402) {
        setLoginPrompt(true);
        setLoginPromptMsg("Add an API key to run agents");
        setTimeout(() => { window.location.href = "/settings"; }, 2500);
        return;
      }
      mutateTask();
      onUpdate();
    } catch (err) {
      console.error("Run failed:", err);
      alert("Failed to run agent. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(agentId: string) {
    setLoading(true);
    try {
      await fetch(`/api/tasks/${task!.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId }),
      });
      mutateTask();
      onUpdate();
    } catch (err) {
      console.error("Assign failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    setLoading(true);
    try {
      await fetch(`/api/tasks/${task!.id}/approve`, { method: "POST" });
      mutateTask();
      onUpdate();
      onClose();
      onConfetti?.();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevise() {
    const note = feedback.trim() || "Please improve the output";
    setLoading(true);
    try {
      await fetch(`/api/tasks/${task!.id}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const runRes = await fetch(`/api/tasks/${task!.id}/run`, { method: "POST" });
      if (runRes.status === 401) {
        setLoginPrompt(true);
        setTimeout(() => { window.location.href = "/login"; }, 2500);
        return;
      }
      if (runRes.status === 402) {
        setLoginPrompt(true);
        setLoginPromptMsg("Add an API key to run agents");
        setTimeout(() => { window.location.href = "/settings"; }, 2500);
        return;
      }
      setFeedback("");
      setShowFeedback(false);
      mutateTask();
      onUpdate();
    } catch (err) {
      console.error("Revise failed:", err);
      alert("Failed to revise. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Simple markdown renderer
  function renderMarkdown(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Headers
      if (line.startsWith("### ")) {
        elements.push(
          <h4 key={i} style={{
            fontSize: 14.5, fontWeight: 700, color: P.text, margin: "20px 0 8px",
            letterSpacing: "-0.01em",
            paddingBottom: 6, borderBottom: `1px solid ${P.border}`,
          }}>{processInline(line.slice(4))}</h4>
        );
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h3 key={i} style={{
            fontSize: 17, fontWeight: 800, margin: "24px 0 10px",
            letterSpacing: "-0.02em",
            background: agent ? `linear-gradient(135deg, ${agent.color}, ${P.text})` : undefined,
            WebkitBackgroundClip: agent ? "text" : undefined,
            WebkitTextFillColor: agent ? "transparent" : undefined,
            color: agent ? undefined : P.text,
          }}>{processInline(line.slice(3))}</h3>
        );
        continue;
      }
      if (line.startsWith("# ")) {
        elements.push(
          <h2 key={i} style={{
            fontSize: 20, fontWeight: 900, margin: "24px 0 10px",
            letterSpacing: "-0.03em",
            background: agent ? `linear-gradient(135deg, ${agent.color}, ${P.text})` : undefined,
            WebkitBackgroundClip: agent ? "text" : undefined,
            WebkitTextFillColor: agent ? "transparent" : undefined,
            color: agent ? undefined : P.text,
          }}>{processInline(line.slice(2))}</h2>
        );
        continue;
      }

      // Horizontal rule
      if (line.match(/^---+$/)) {
        elements.push(
          <div key={i} style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: agent ? `linear-gradient(to right, ${agent.color}20, ${P.border}, transparent)` : P.border }} />
          </div>
        );
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        elements.push(
          <div key={i} style={{
            borderLeft: `3px solid ${agent?.color || P.indigo}`,
            paddingLeft: 16, margin: "14px 0",
            padding: "10px 16px",
            backgroundColor: agent ? agent.color + "06" : "rgba(99,102,241,0.04)",
            borderRadius: "0 10px 10px 0",
            fontSize: 13.5, color: P.textSec, fontStyle: "italic", lineHeight: 1.7,
          }}>
            {processInline(line.slice(2))}
          </div>
        );
        continue;
      }

      // List items
      if (line.match(/^[-*] /)) {
        elements.push(
          <div key={i} style={{ display: "flex", gap: 10, margin: "5px 0", fontSize: 13.5, color: P.text, lineHeight: 1.7 }}>
            <span style={{
              color: agent?.color || P.indigo, fontWeight: 700, flexShrink: 0,
              width: 6, height: 6, borderRadius: "50%",
              backgroundColor: agent?.color || P.indigo,
              marginTop: 8, opacity: 0.6,
            }} />
            <span>{processInline(line.slice(2))}</span>
          </div>
        );
        continue;
      }

      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s/);
      if (numMatch) {
        elements.push(
          <div key={i} style={{ display: "flex", gap: 10, margin: "5px 0", fontSize: 13.5, color: P.text, lineHeight: 1.7 }}>
            <span style={{
              color: "#fff", fontWeight: 700, flexShrink: 0,
              width: 20, height: 20, borderRadius: 6,
              background: agent?.gradient || P.indigo,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, marginTop: 2,
            }}>{numMatch[1]}</span>
            <span style={{ flex: 1 }}>{processInline(line.slice(numMatch[0].length))}</span>
          </div>
        );
        continue;
      }

      // Table
      if (line.includes("|") && line.trim().startsWith("|")) {
        // Collect all table lines
        const tableLines: string[] = [line];
        while (i + 1 < lines.length && lines[i + 1].includes("|")) {
          i++;
          tableLines.push(lines[i]);
        }
        elements.push(renderTable(tableLines, i));
        continue;
      }

      // Empty line
      if (line.trim() === "") {
        elements.push(<div key={i} style={{ height: 10 }} />);
        continue;
      }

      // Regular paragraph
      elements.push(<p key={i} style={{ fontSize: 14, color: P.text, lineHeight: 1.75, margin: "5px 0" }}>{processInline(line)}</p>);
    }

    return elements;
  }

  function processInline(text: string): React.ReactNode {
    // Bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ fontWeight: 700, color: P.text }}>{part.slice(2, -2)}</strong>;
      }
      // Inline code
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cp, j) => {
        if (cp.startsWith("`") && cp.endsWith("`")) {
          return <code key={`${i}-${j}`} style={{
            fontSize: 12, padding: "2px 7px", borderRadius: 6,
            backgroundColor: agent?.color ? agent.color + "0a" : P.sidebar,
            border: `1px solid ${agent?.color ? agent.color + "15" : P.border}`,
            fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
            color: agent?.color || P.indigo, fontWeight: 500,
          }}>{cp.slice(1, -1)}</code>;
        }
        return cp;
      });
    });
  }

  function renderTable(lines: string[], keyBase: number) {
    const rows = lines
      .filter((l) => !l.match(/^\|[-:| ]+\|$/)) // skip separator
      .map((l) => l.split("|").filter((c) => c.trim() !== "").map((c) => c.trim()));

    if (rows.length === 0) return null;
    const header = rows[0];
    const body = rows.slice(1);

    return (
      <div key={keyBase} style={{
        overflowX: "auto", margin: "16px 0", borderRadius: 12,
        border: `1px solid ${agent?.color ? agent.color + "20" : P.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
      }}>
        <table style={{
          width: "100%", borderCollapse: "collapse", fontSize: 13,
        }}>
          <thead>
            <tr>
              {header.map((cell, ci) => (
                <th key={ci} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontWeight: 700, color: P.text,
                  backgroundColor: agent?.color ? agent.color + "08" : P.sidebar,
                  borderBottom: `2px solid ${agent?.color ? agent.color + "20" : P.border}`,
                  fontSize: 12, letterSpacing: "0.02em",
                  textTransform: "uppercase" as const,
                }}>
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} style={{ transition: "background-color 0.15s" }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "9px 14px", color: P.text,
                    borderBottom: `1px solid ${P.border}40`,
                    backgroundColor: ri % 2 === 0 ? "transparent" : agent?.color ? agent.color + "03" : "#FAFAF8",
                    fontSize: 13,
                  }}>
                    {processInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        display: "flex", justifyContent: "center", alignItems: "center",
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: "rgba(24,24,27,0.35)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }} />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(850px, 95vw)", maxHeight: "85vh", overflowY: "auto",
          backgroundColor: P.card, borderRadius: 20,
          boxShadow: P.shadowFloat, position: "relative",
          animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {agent && <div style={{ height: 5, background: agent.gradient, borderRadius: "20px 20px 0 0" }} />}

        {/* Login prompt overlay */}
        {loginPrompt && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            borderRadius: 20,
            animation: "fadeIn 0.2s ease",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{loginPromptMsg ? "🔑" : "🔐"}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: P.text, marginBottom: 6 }}>
              {loginPromptMsg || "Sign in to run agents"}
            </h3>
            <p style={{ fontSize: 14, color: P.textSec, marginBottom: 16 }}>
              {loginPromptMsg ? "Go to Settings to add your OpenAI, Gemini, or Anthropic key" : "Create a free account to start using AI agents"}
            </p>
            <a
              href={loginPromptMsg ? "/settings" : "/login"}
              style={{
                padding: "10px 24px", borderRadius: 10,
                backgroundColor: P.indigo, color: "#fff",
                fontSize: 14, fontWeight: 600, textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {loginPromptMsg ? "Go to Settings" : "Sign In Free"}
            </a>
            <p style={{ fontSize: 12, color: P.textTer, marginTop: 10 }}>
              Redirecting in a moment...
            </p>
          </div>
        )}

        <div style={{ padding: "26px 30px 30px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: P.text, margin: 0, lineHeight: 1.4, letterSpacing: "-0.02em" }}>
                {task.title}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                {agent && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 3px", borderRadius: 20, backgroundColor: agent.color + "12" }}>
                    <AgentAvatar icon={agent.icon} color={agent.color} gradient={agent.gradient} size={22} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: agent.color }}>{agent.name}</span>
                  </div>
                )}
                {isReview && agent && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff", background: agent.gradient, padding: "3px 10px", borderRadius: 20 }}>
                    Needs review
                  </span>
                )}
                {isWorking && agent && (
                  <span style={{
                    fontSize: 11.5, fontWeight: 700, color: agent.color,
                    backgroundColor: agent.color + "12", padding: "3px 10px", borderRadius: 20,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {task.progress}%
                    <span style={{ display: "inline-flex", gap: 2 }}>
                      {[0, 1, 2].map((d) => <span key={d} style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: agent.color, animation: `bounce 1.2s ease-in-out ${d * 0.15}s infinite` }} />)}
                    </span>
                  </span>
                )}
                {task.cost_usd > 0 && (
                  <span style={{ fontSize: 11.5, color: P.textTer, fontFamily: "'JetBrains Mono', var(--font-mono), monospace" }}>
                    ${task.cost_usd.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 10,
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

          {/* Agent picker for unassigned tasks */}
          {!task.agent_id && task.status === "todo" && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
                Choose an agent
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {agents.map((a, i) => (
                  <div
                    key={a.id}
                    onMouseEnter={() => setHoveredAgent(a.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                    onClick={() => !loading && handleAssign(a.id)}
                    style={{
                      padding: "14px", borderRadius: 14, cursor: loading ? "not-allowed" : "pointer",
                      border: `2px solid ${hoveredAgent === a.id ? a.color + "50" : P.border}`,
                      backgroundColor: hoveredAgent === a.id ? a.color + "08" : P.card,
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      transform: hoveredAgent === a.id ? "translateY(-2px)" : "translateY(0)",
                      boxShadow: hoveredAgent === a.id ? `0 8px 24px ${a.color}15` : "none",
                      animation: `popIn 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <AgentAvatar icon={a.icon} color={a.color} gradient={a.gradient} size={32} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: P.text }}>{a.name}</div>
                        <div style={{ fontSize: 11.5, color: P.textTer }}>{a.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User input + Run button */}
          {task.agent_id && (isTodo || isFailed) && (
            <div style={{ marginBottom: 24 }}>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Add details, context, or specific instructions for the agent... (optional)"
                style={{
                  width: "100%", minHeight: 80, padding: "12px 14px",
                  borderRadius: 12, border: `1.5px solid ${P.border}`,
                  backgroundColor: P.sidebar, color: P.text,
                  fontSize: 14, fontFamily: "inherit", resize: "vertical",
                  outline: "none", lineHeight: 1.5, marginBottom: 12,
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = agent?.color || P.indigo; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
              />

              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv,.json,.md,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 9,
                    border: `1.5px solid ${P.border}`,
                    backgroundColor: P.card, color: P.textSec,
                    fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    opacity: uploading ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = agent?.color || P.indigo; e.currentTarget.style.backgroundColor = P.sidebar; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.backgroundColor = P.card; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {uploading ? "Uploading..." : "Attach file"}
                </button>

                {/* Voice input button */}
                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={transcribing}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 9,
                    border: `1.5px solid ${recording ? "#EF4444" : P.border}`,
                    backgroundColor: recording ? "#FEF2F2" : P.card,
                    color: recording ? "#EF4444" : P.textSec,
                    fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    opacity: transcribing ? 0.5 : 1,
                    animation: recording ? "pulseGlow 1.5s ease-in-out infinite" : "none",
                  }}
                  onMouseEnter={(e) => { if (!recording) { e.currentTarget.style.borderColor = "#8B5CF6"; e.currentTarget.style.backgroundColor = P.sidebar; } }}
                  onMouseLeave={(e) => { if (!recording) { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.backgroundColor = P.card; } }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {recording ? (
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    ) : (
                      <>
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </>
                    )}
                  </svg>
                  {transcribing ? "Transcribing..." : recording ? "Stop" : "Voice"}
                </button>

                <span style={{ fontSize: 10.5, color: P.textTer }}>
                  {recording ? "Recording... click Stop when done" : "File or voice input"}
                </span>
              </div>

              {/* Uploaded file badge */}
              {uploadedFile && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                  padding: "8px 12px", borderRadius: 10,
                  backgroundColor: agent?.color ? agent.color + "08" : P.sidebar,
                  border: `1px solid ${agent?.color ? agent.color + "20" : P.border}`,
                  animation: "fadeUp 0.2s ease",
                }}>
                  <span style={{ fontSize: 16 }}>
                    {uploadedFile.mimeType.startsWith("image/") ? "🖼️" : "📄"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: P.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {uploadedFile.filename}
                    </div>
                    <div style={{ fontSize: 10, color: P.textTer }}>
                      {uploadedFile.textContent
                        ? `${uploadedFile.textContent.length.toLocaleString()} chars extracted`
                        : uploadedFile.base64Image ? "Image attached" : "File attached"}
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    style={{
                      width: 20, height: 20, borderRadius: 6, border: "none",
                      backgroundColor: "transparent", color: P.textTer,
                      cursor: "pointer", fontSize: 12, display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                onClick={handleRun}
                disabled={loading}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: agent ? agent.gradient : P.coralGrad,
                  color: "#fff", fontSize: 15, fontWeight: 700,
                  fontFamily: "inherit",
                  boxShadow: agent ? `0 4px 16px ${agent.color}30` : "0 4px 16px rgba(249,112,102,0.3)",
                  transition: "all 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Starting..." : `Run ${agent?.name || "Agent"} →`}
              </button>
            </div>
          )}

          {/* Pipeline steps — derived client-side from agent slug + progress */}
          {(isWorking || isReview || isFailed) && agent && (() => {
            // Get pipeline steps for this agent from the definition
            const agentSlug = task.agent_id
              ? agents.find((a) => a.id === task.agent_id)?.slug
              : undefined;
            const pipelineSteps = getPipeline(agentSlug || "");
            const progress = task.progress || 0;
            const totalSteps = pipelineSteps.length;

            return (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
                  {isWorking ? "Working..." : "Activity"}
                </div>

                {/* Progress bar */}
                {isWorking && (
                  <div style={{
                    height: 4, backgroundColor: P.border, borderRadius: 2,
                    marginBottom: 16, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", width: `${progress}%`,
                      background: agent.gradient,
                      borderRadius: 2,
                      transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                    }} />
                  </div>
                )}

                {pipelineSteps.map((pStep, i) => {
                  // Derive step state from progress percentage
                  const stepProgress = ((i + 1) / totalSteps) * 100;
                  const isDone = isReview || isFailed || progress >= stepProgress;
                  const isCurrent = isWorking && !isDone && progress >= ((i) / totalSteps) * 100;
                  const isPending = !isDone && !isCurrent;

                  return (
                    <div key={i} style={{ display: "flex", gap: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                          background: isDone ? P.emeraldGrad : isCurrent ? agent.gradient : P.border,
                          boxShadow: isCurrent ? `0 0 12px ${agent.color}50` : "none",
                          animation: isCurrent ? "pulseGlow 2s ease-in-out infinite" : "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.5s",
                        }}>
                          {isDone && <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>✓</span>}
                        </div>
                        {i < totalSteps - 1 && (
                          <div style={{
                            width: 2, flexGrow: 1, minHeight: 20, borderRadius: 1,
                            backgroundColor: isDone ? P.emerald + "30" : P.border,
                            transition: "background-color 0.5s",
                          }} />
                        )}
                      </div>
                      <div style={{
                        fontSize: 13, paddingBottom: 14, paddingLeft: 10, lineHeight: 1.5,
                        color: isDone ? P.text : isCurrent ? agent.color : isPending ? P.textGhost : P.textTer,
                        fontWeight: isCurrent ? 650 : isDone ? 500 : 400,
                        transition: "all 0.5s",
                      }}>
                        {pStep.description}
                        {isCurrent && (
                          <span style={{ display: "inline-flex", gap: 3, marginLeft: 8, verticalAlign: "middle" }}>
                            {[0, 1, 2].map((d) => (
                              <span key={d} style={{
                                width: 4, height: 4, borderRadius: "50%",
                                backgroundColor: agent.color,
                                animation: `bounce 1.2s ease-in-out ${d * 0.15}s infinite`,
                              }} />
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Output — rendered as formatted markdown */}
          {task.output && (
            <div style={{ marginBottom: 24, animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
              {/* Output header bar */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {agent && (
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: agent.gradient,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10,
                    }}>
                      {agent.icon}
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 700, color: P.text }}>
                    {agent?.name || "Agent"} Output
                  </span>
                  {task.tokens_in + task.tokens_out > 0 && (
                    <span style={{
                      fontSize: 10, color: P.textTer, fontWeight: 500,
                      fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
                    }}>
                      {(task.tokens_in + task.tokens_out).toLocaleString()} tokens
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => { navigator.clipboard.writeText(task.output || ""); }}
                    style={{
                      padding: "5px 12px", borderRadius: 8, border: `1px solid ${P.border}`,
                      backgroundColor: P.card, fontSize: 11, fontWeight: 600,
                      color: P.textSec, cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = agent?.color ? agent.color + "08" : P.sidebar;
                      e.currentTarget.style.borderColor = agent?.color ? agent.color + "30" : P.borderHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = P.card;
                      e.currentTarget.style.borderColor = P.border;
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>

              {/* Output content */}
              <div style={{
                padding: "24px 26px", borderRadius: 16,
                backgroundColor: "#fff",
                border: `1px solid ${agent?.color ? agent.color + "20" : P.border}`,
                boxShadow: agent ? `0 2px 12px ${agent.color}06, 0 1px 3px rgba(0,0,0,0.04)` : "0 1px 3px rgba(0,0,0,0.04)",
                position: "relative", overflow: "hidden",
              }}>
                {/* Subtle top accent line */}
                {agent && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: agent.gradient, opacity: 0.5,
                    borderRadius: "16px 16px 0 0",
                  }} />
                )}
                {renderMarkdown(task.output)}
              </div>
            </div>
          )}

          {/* Actions — Review mode */}
          {isReview && (
            <div>
              {/* Feedback input area */}
              {showFeedback ? (
                <div style={{
                  marginBottom: 12, padding: "14px 16px", borderRadius: 12,
                  backgroundColor: P.sidebar, border: `1.5px solid ${P.border}`,
                  animation: "fadeUp 0.25s cubic-bezier(0.16,1,0.3,1)",
                }}>
                  <label style={{
                    fontSize: 12, fontWeight: 600, color: P.textSec,
                    display: "block", marginBottom: 8,
                  }}>
                    What would you like changed?
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g. Make it shorter, add more data, change the tone to casual, focus on the pricing section..."
                    style={{
                      width: "100%", minHeight: 80, padding: "10px 12px",
                      borderRadius: 10, border: `1.5px solid ${P.border}`,
                      backgroundColor: P.card, color: P.text,
                      fontSize: 14, fontFamily: "inherit", resize: "vertical",
                      outline: "none", lineHeight: 1.5,
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = P.indigo; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = P.border; }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => { setShowFeedback(false); setFeedback(""); }}
                      style={{
                        padding: "8px 16px", borderRadius: 8,
                        border: `1px solid ${P.border}`, backgroundColor: P.card,
                        color: P.textSec, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRevise}
                      disabled={loading}
                      style={{
                        padding: "8px 20px", borderRadius: 8,
                        border: "none", background: P.indigo,
                        color: "#fff", fontSize: 13, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? "Revising..." : "Revise with feedback"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Prompt to add feedback */
                <div
                  onClick={() => setShowFeedback(true)}
                  style={{
                    marginBottom: 12, padding: "12px 16px", borderRadius: 10,
                    border: `1.5px dashed ${P.border}`,
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 10,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = P.indigo; e.currentTarget.style.backgroundColor = P.indigo + "06"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = P.border; e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <span style={{ fontSize: 16 }}>💬</span>
                  <span style={{ fontSize: 13, color: P.textSec, fontWeight: 500 }}>
                    Not what you expected? Add feedback to improve the result...
                  </span>
                </div>
              )}

              {/* Approve / Quick Revise buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  style={{
                    flex: 1, padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer",
                    background: P.emeraldGrad, color: "#fff", fontSize: 15, fontWeight: 700,
                    fontFamily: "inherit",
                    boxShadow: `0 4px 16px ${P.emerald}30`,
                    transition: "all 0.2s",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Approve ✓
                </button>
                {!showFeedback && (
                  <button
                    onClick={handleRevise}
                    disabled={loading}
                    style={{
                      padding: "13px 24px", borderRadius: 12,
                      border: `1.5px solid ${P.border}`,
                      backgroundColor: P.card, color: P.text,
                      fontSize: 15, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", transition: "all 0.15s",
                      opacity: loading ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = P.sidebar; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = P.card; }}
                  >
                    Revise
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
