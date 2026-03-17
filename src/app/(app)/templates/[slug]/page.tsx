"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
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
  deriveAgentStatus,
} from "@/lib/template-agents";
import type { TemplateAgent } from "@/lib/template-agents";
import type { TaskStep } from "@/lib/types/task";

/* ─── AgentStep (left timeline) ─── */
function AgentStep({ agent, status, isLast, onClick, isSelected }: {
  agent: TemplateAgent;
  status: "idle" | "running" | "done" | "error";
  isLast: boolean;
  onClick: () => void;
  isSelected: boolean;
}) {
  const statusConfig = {
    idle:    { color: P.textTer, bg: P.bg3, label: "Waiting" },
    running: { color: P.amber, bg: `${P.amber}12`, label: "Running" },
    done:    { color: P.lime, bg: `${P.lime}10`, label: "Done" },
    error:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "Error" },
  };
  const s = statusConfig[status];
  const [hov, setHov] = useState(false);

  return (
    <div style={{ display: "flex", gap: 0, position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: status === "running" ? `${agent.color}20` : status === "done" ? `${agent.color}18` : P.bg4,
          border: `2px solid ${status === "idle" ? P.border2 : agent.color}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, zIndex: 1, position: "relative",
          boxShadow: status === "running" ? `0 0 0 4px ${agent.color}20, 0 0 16px ${agent.color}44` : status === "done" ? `0 0 8px ${agent.color}30` : "none",
          transition: "all 0.4s",
        }}>
          {status === "running" ? <span className="animate-spin" style={{ display: "block", fontSize: 13 }}>&#x27F3;</span> : status === "done" ? "\u2713" : agent.icon}
        </div>
        {!isLast && (
          <div style={{ width: 2, flex: 1, minHeight: 20, background: status === "done" ? `linear-gradient(${agent.color}, ${agent.color}44)` : P.border, transition: "background 0.6s", marginTop: 2 }} />
        )}
      </div>

      <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          flex: 1, marginLeft: 10, marginBottom: isLast ? 0 : 16, padding: "12px 14px", borderRadius: 12,
          background: isSelected ? s.bg : hov ? P.bg3 : P.bg2,
          border: `1px solid ${isSelected ? agent.color + "55" : hov ? P.border2 : P.border}`,
          cursor: "pointer", transition: "all 0.2s",
        }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, fontFamily: F, color: status !== "idle" ? agent.color : P.text }}>{agent.name}</span>
            {agent.mcpTools.length > 0 && (
              <div style={{ display: "flex", gap: 3 }}>
                {agent.mcpTools.map(t => <span key={t} style={{ fontSize: 8.5, padding: "1px 6px", borderRadius: 4, background: `${P.teal}15`, color: P.teal, border: `1px solid ${P.teal}33`, fontFamily: F }}>&#x1F50C; {t}</span>)}
              </div>
            )}
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: s.bg, color: s.color, border: `1px solid ${s.color}33`, letterSpacing: "0.04em" }}>{s.label}</span>
        </div>
        <div style={{ fontSize: 11, color: P.textSec, lineHeight: 1.55 }}>{agent.role}</div>
        {status === "running" && (
          <div style={{ marginTop: 8, height: 2, background: P.bg5, borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", background: agent.color, borderRadius: 100, width: "100%", animation: "tpl-progress 1.4s ease-in-out infinite", transformOrigin: "left" }} />
          </div>
        )}
      </div>
    </div>
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

/* ─── CSS Keyframes (injected once) ─── */
function InjectKeyframes() {
  return (
    <style>{`
      @keyframes tpl-progress { 0%{transform:scaleX(0) translateX(0)} 50%{transform:scaleX(0.7) translateX(30%)} 100%{transform:scaleX(0) translateX(200%)} }
      @keyframes tpl-bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4} 40%{transform:scale(1.2);opacity:1} }
      @keyframes tpl-fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      .animate-spin { animation: spin 1s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
  );
}

/* ─── MAIN PAGE ─── */
export default function TemplateRunPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { agents } = useAgents();
  const agent = agents.find(a => a.slug === slug);

  const config = getTemplateRunConfig(slug);
  const pipeline = TEMPLATE_PIPELINES[slug] || [];
  const rating = TEMPLATE_RATINGS[slug] || 4.5;
  const runs = TEMPLATE_RUNS[slug] || "1.0k";
  const catId = AGENT_CATEGORY_MAP[slug] || getTemplateCategory(slug);
  const cat = CATEGORY_META[catId] || CATEGORY_META.career;

  const [phase, setPhase] = useState<"input" | "running" | "done">("input");
  const [taskInput, setTaskInput] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [authPrompt, setAuthPrompt] = useState<"login" | "apikey" | null>(null);
  const [authCountdown, setAuthCountdown] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll task while running
  const { task, mutate: mutateTask } = useTask(
    phase !== "input" ? taskId : null,
    { refreshInterval: phase === "running" ? 1500 : 0 }
  );

  // Derive agent statuses from task steps
  const steps: TaskStep[] = task?.steps || [];
  const agentStatuses = config.agents.map(a => deriveAgentStatus(a, steps));
  const allDone = agentStatuses.length > 0 && agentStatuses.every(s => s === "done");
  const doneCount = agentStatuses.filter(s => s === "done").length;

  // Auto-select running agent
  useEffect(() => {
    const runningIdx = agentStatuses.findIndex(s => s === "running");
    if (runningIdx !== -1) {
      setSelectedAgentId(config.agents[runningIdx].id);
    }
  }, [agentStatuses, config.agents]);

  // Switch to done phase (including failed)
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
        if (c <= 1) {
          clearInterval(iv);
          router.push(authPrompt === "login" ? "/login" : "/settings");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [authPrompt, router]);

  const handleRun = useCallback(async () => {
    if (!taskInput.trim() || !agent) return;

    try {
      // Create task
      const createRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskInput.slice(0, 120),
          agent_ids: [agent.id],
          description: taskInput,
          section: "today",
        }),
      });

      if (!createRes.ok) {
        if (createRes.status === 401) { setAuthPrompt("login"); return; }
        return;
      }

      const data = await createRes.json();
      setTaskId(data.id);

      // Assign agent to task (required before running)
      const assignRes = await fetch(`/api/tasks/${data.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agent.id }),
      });
      if (!assignRes.ok) return;

      setPhase("running");
      setElapsed(0);
      setSelectedAgentId(config.agents[0]?.id || null);

      // Start execution
      const runRes = await fetch(`/api/tasks/${data.id}/run`, { method: "POST" });
      if (!runRes.ok) {
        if (runRes.status === 401) { setAuthPrompt("login"); return; }
        if (runRes.status === 402) { setAuthPrompt("apikey"); return; }
      }
    } catch {
      // Network error
    }
  }, [taskInput, agent, config.agents]);

  const handleExport = useCallback(() => {
    if (task?.output) {
      navigator.clipboard.writeText(task.output);
    }
  }, [task]);

  const handleRunAgain = useCallback(() => {
    setPhase("input");
    setTaskId(null);
    setElapsed(0);
  }, []);

  const currentAgent = config.agents.find(a => a.id === selectedAgentId) || null;
  const currentAgentIdx = currentAgent ? config.agents.indexOf(currentAgent) : -1;
  const currentAgentStatus = currentAgentIdx >= 0 ? agentStatuses[currentAgentIdx] : "idle";

  // Get output for the current agent's steps
  const currentAgentOutput = currentAgent
    ? currentAgent.stepIndices
        .map(i => steps[i]?.output)
        .filter(Boolean)
        .join("\n\n")
    : "";

  const templateName = agent?.name || slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const templateIcon = agent?.icon || pipeline[0]?.icon || "🤖";

  /* ── INPUT SCREEN ── */
  if (phase === "input") return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: F, display: "flex", flexDirection: "column" }}>
      <InjectKeyframes />
      {/* Header */}
      <div style={{ padding: "16px 32px", borderBottom: `1px solid ${P.border}`, background: P.bg2, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => router.back()} style={{ fontSize: 12, color: P.textSec, background: "none", border: `1px solid ${P.border}`, borderRadius: 7, padding: "5px 11px", cursor: "pointer", fontFamily: F }}>
          &#8592; Back
        </button>
        <div style={{ fontSize: 16, marginRight: 2 }}>{templateIcon}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{templateName}</div>
          <div style={{ fontSize: 11, color: P.textSec }}>{cat.label} &middot; &#9733; {rating} &middot; {runs} runs</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {[
            { l: "Agents", v: String(config.agents.length), c: P.violet2 },
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

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 680 }}>
          {/* Agent pipeline preview */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 36 }}>
            {config.agents.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `${a.color}18`, border: `2px solid ${a.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>{a.icon}</div>
                  <span style={{ fontSize: 9.5, color: P.textSec, textAlign: "center", maxWidth: 70, lineHeight: 1.3, fontFamily: F }}>{a.name}</span>
                </div>
                {i < config.agents.length - 1 && (
                  <div style={{ width: 28, height: 1.5, background: `linear-gradient(90deg, ${a.color}66, ${config.agents[i + 1].color}66)`, marginBottom: 18 }} />
                )}
              </div>
            ))}
          </div>

          {/* Task input card */}
          <div style={{ background: P.bg2, border: `1px solid ${P.border2}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "24px 28px 20px" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>What&apos;s your task?</div>
              <div style={{ fontSize: 12.5, color: P.textSec, marginBottom: 20, lineHeight: 1.6 }}>{config.tagline}</div>
              <textarea
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                rows={5}
                style={{
                  width: "100%", background: P.bg3, border: `1px solid ${P.border}`,
                  borderRadius: 12, padding: "14px 16px", color: P.text, fontFamily: F,
                  fontSize: 13, lineHeight: 1.7, outline: "none", resize: "vertical", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = P.violet + "88"}
                onBlur={e => e.target.style.borderColor = P.border}
                placeholder="Describe your background, preferences, and goals..."
              />
            </div>

            {/* Quick fills */}
            <div style={{ padding: "0 28px 20px" }}>
              <div style={{ fontSize: 10, color: P.textTer, marginBottom: 8 }}>Quick fill &#8594;</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {config.quickFills.map(s => (
                  <button key={s} onClick={() => setTaskInput(s)} style={{
                    fontSize: 11, padding: "4px 12px", borderRadius: 100,
                    background: P.bg4, border: `1px solid ${P.border2}`, color: P.textSec,
                    cursor: "pointer", fontFamily: F, transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${P.violet}18`; e.currentTarget.style.borderColor = `${P.violet}55`; e.currentTarget.style.color = P.violet2; }}
                  onMouseLeave={e => { e.currentTarget.style.background = P.bg4; e.currentTarget.style.borderColor = P.border2; e.currentTarget.style.color = P.textSec; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 28px", background: P.bg3, borderTop: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 11, color: P.textSec }}>Using your Claude API key &middot; Results in ~{config.estimatedTime}</div>
              <button onClick={handleRun} disabled={!taskInput.trim()}
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "11px 24px", borderRadius: 11,
                  background: taskInput.trim() ? P.lime : P.bg5,
                  color: taskInput.trim() ? "#0a0a0d" : P.textTer,
                  fontSize: 13, fontWeight: 700, border: "none",
                  cursor: taskInput.trim() ? "pointer" : "not-allowed",
                  fontFamily: F, transition: "all 0.2s",
                }}>
                <span>&#9654;</span> Run {templateName}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth overlay */}
      {authPrompt && <AuthOverlay type={authPrompt} countdown={authCountdown} onClose={() => setAuthPrompt(null)} />}
    </div>
  );

  /* ── RUN / DONE SCREEN ── */
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

        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: 300, marginLeft: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: P.textSec }}>
              {allDone ? "Complete" : `Step ${doneCount + 1} of ${config.agents.length}`}
            </span>
            <span style={{ fontSize: 10, color: P.textSec }}>
              {task ? `${task.progress}%` : `${Math.round((doneCount / config.agents.length) * 100)}%`}
            </span>
          </div>
          <div style={{ height: 3, background: P.bg4, borderRadius: 100, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              background: allDone ? P.lime : `linear-gradient(90deg, ${P.violet}, ${P.lime})`,
              borderRadius: 100,
              width: task ? `${task.progress}%` : `${(doneCount / config.agents.length) * 100}%`,
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: P.textSec, background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 7, padding: "5px 11px", fontFamily: FM }}>
            &#9201; {task?.duration_seconds || elapsed}s
          </div>
          <CostTicker
            costUsd={task?.cost_usd || 0}
            tokensIn={task?.tokens_in || 0}
            tokensOut={task?.tokens_out || 0}
          />
          {allDone && (
            <button onClick={handleExport} style={{ padding: "7px 16px", borderRadius: 9, background: P.lime, color: "#0a0a0d", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: F }}>
              Export Results &#8599;
            </button>
          )}
        </div>
      </div>

      {/* Main 3-column layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT - Agent timeline */}
        <div style={{ width: 320, borderRight: `1px solid ${P.border}`, background: P.bg2, padding: "22px 20px", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.09em", color: P.textTer, marginBottom: 20 }}>Agent Execution</div>
          {config.agents.map((a, i) => (
            <AgentStep
              key={a.id}
              agent={a}
              status={agentStatuses[i]}
              isLast={i === config.agents.length - 1}
              onClick={() => setSelectedAgentId(a.id)}
              isSelected={selectedAgentId === a.id}
            />
          ))}

          {allDone && (
            <div style={{ marginTop: 20, padding: "14px 16px", background: `${P.lime}0c`, border: `1px solid ${P.lime}33`, borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: P.lime, marginBottom: 3 }}>All done!</div>
              <div style={{ fontSize: 11, color: P.textSec, lineHeight: 1.6 }}>
                Pipeline completed in {task?.duration_seconds || elapsed}s.
              </div>
            </div>
          )}
          {task?.status === "failed" && (
            <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 3 }}>Pipeline failed</div>
              <div style={{ fontSize: 11, color: P.textSec, lineHeight: 1.6 }}>
                {task.current_step || "An error occurred. Check your API key in Settings."}
              </div>
            </div>
          )}
        </div>

        {/* CENTER - Agent output */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {currentAgent ? (
            <>
              {/* Agent header */}
              <div style={{ padding: "16px 22px", borderBottom: `1px solid ${P.border}`, background: P.bg2, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `${currentAgent.color}20`, border: `2px solid ${currentAgent.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    boxShadow: currentAgentStatus === "running" ? `0 0 16px ${currentAgent.color}44` : "none",
                    transition: "box-shadow 0.4s",
                  }}>
                    {currentAgentStatus === "running"
                      ? <span className="animate-spin" style={{ display: "block" }}>&#x27F3;</span>
                      : currentAgent.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: currentAgentStatus !== "idle" ? currentAgent.color : P.text, transition: "color 0.3s" }}>{currentAgent.name}</div>
                    <div style={{ fontSize: 11, color: P.textSec, marginTop: 1 }}>{currentAgent.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10.5, padding: "3px 10px", borderRadius: 100, background: `${currentAgent.color}15`, color: currentAgent.color, border: `1px solid ${currentAgent.color}33`, fontFamily: F }}>
                      {currentAgent.model}
                    </span>
                  </div>
                </div>
              </div>

              {/* Output area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "22px" }}>
                {currentAgentStatus === "idle" ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, opacity: 0.4 }}>
                    <div style={{ fontSize: 36 }}>{currentAgent.icon}</div>
                    <div style={{ fontSize: 13, color: P.textTer, fontFamily: F }}>Waiting to start...</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {currentAgentOutput ? (
                      <div
                        className="prose prose-invert prose-sm max-w-none"
                        style={{
                          animation: "tpl-fadeUp 0.4s ease both",
                          padding: "16px 18px", background: P.bg3, borderRadius: 12,
                          border: `1px solid ${P.border}`,
                          fontSize: 12.5, lineHeight: 1.7, color: P.textSec,
                        }}
                      >
                        <ReactMarkdown>{currentAgentOutput}</ReactMarkdown>
                      </div>
                    ) : phase === "done" && task?.output ? (
                      <div
                        className="prose prose-invert prose-sm max-w-none"
                        style={{
                          animation: "tpl-fadeUp 0.4s ease both",
                          padding: "16px 18px", background: P.bg3, borderRadius: 12,
                          border: `1px solid ${task.status === "failed" ? "rgba(239,68,68,0.3)" : P.border}`,
                          fontSize: 12.5, lineHeight: 1.7, color: P.textSec,
                        }}
                      >
                        <ReactMarkdown>{task.output}</ReactMarkdown>
                      </div>
                    ) : null}
                    {currentAgentStatus === "running" && (
                      <div style={{ display: "flex", gap: 6, padding: "12px 14px", alignItems: "center" }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: currentAgent.color, animation: `tpl-bounce 1.2s ease ${i * 0.2}s infinite` }} />
                        ))}
                        <span style={{ fontSize: 11, color: P.textSec, marginLeft: 4 }}>Processing...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, opacity: 0.4 }}>
              <div style={{ fontSize: 40 }}>&#x1F448;</div>
              <div style={{ fontSize: 13, color: P.textTer }}>Select an agent to inspect its output</div>
            </div>
          )}
        </div>

        {/* RIGHT - Task context + log */}
        <div style={{ width: 260, borderLeft: `1px solid ${P.border}`, background: P.bg2, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
          {/* Task */}
          <div style={{ padding: "18px 16px", borderBottom: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: P.textTer, marginBottom: 10 }}>Your Task</div>
            <div style={{ fontSize: 11.5, color: P.textSec, lineHeight: 1.65, background: P.bg3, padding: "10px 12px", borderRadius: 9, border: `1px solid ${P.border}` }}>
              {taskInput}
            </div>
          </div>

          {/* Live log */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.08em", color: P.textTer, marginBottom: 12 }}>Live Log</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {config.agents.map((a, i) => {
                const status = agentStatuses[i];
                if (status === "idle") return null;
                return (
                  <div key={a.id} style={{ padding: "8px 10px", background: P.bg3, borderRadius: 8, border: `1px solid ${status === "running" ? a.color + "44" : P.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: status === "running" ? a.color : P.lime, flexShrink: 0, boxShadow: status === "running" ? `0 0 6px ${a.color}` : "none" }} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: a.color, fontFamily: F }}>{a.name}</span>
                    </div>
                    <div style={{ fontSize: 10, color: P.textSec, lineHeight: 1.5, fontFamily: FM }}>
                      {status === "running" ? "&#x27F3; Processing..." : `\u2713 ${a.outputLabel}`}
                    </div>
                  </div>
                );
              })}
              {phase === "running" && agentStatuses.every(s => s === "idle") && (
                <div style={{ fontSize: 11, color: P.textTer, textAlign: "center", padding: "20px 0" }}>Starting pipeline...</div>
              )}
            </div>
          </div>

          {/* Bottom - done actions */}
          {allDone && (
            <div style={{ padding: "14px 16px", borderTop: `1px solid ${P.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={handleRunAgain} style={{ padding: "9px", borderRadius: 9, background: P.bg4, border: `1px solid ${P.border2}`, color: P.textSec, fontSize: 11.5, cursor: "pointer", fontFamily: F, fontWeight: 600 }}>
                &#8634; Run Again
              </button>
              <button onClick={handleExport} style={{ padding: "9px", borderRadius: 9, background: P.lime, border: "none", color: "#0a0a0d", fontSize: 11.5, cursor: "pointer", fontFamily: F, fontWeight: 700 }}>
                &#8599; Export Results
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth overlay */}
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
        {/* Progress bar */}
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
