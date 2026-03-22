"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Agent {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
}

interface TaskStep {
  id: string;
  step_number: number;
  description: string;
  status: "pending" | "working" | "done" | "failed";
  output?: string;
}

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
  steps?: TaskStep[];
  status?: string;
}

export default function AgentChatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get<Agent[]>("/api/agents")
      .then((agents) => {
        const found = agents.find((a) => a.slug === slug);
        setAgent(found || null);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pollTask = useCallback((taskId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const task = await api.get<{
          id: string;
          status: string;
          output: string | null;
          progress: number;
          current_step: string | null;
          steps?: TaskStep[];
        }>(`/api/tasks/${taskId}`);

        if (task.status === "done" || task.status === "failed" || task.status === "review") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setSending(false);

          setMessages((prev) => {
            const existing = prev.findIndex((m) => m.id === `task-${taskId}`);
            const agentMsg: Message = {
              id: `task-${taskId}`,
              role: "agent",
              text: task.output || (task.status === "failed" ? "Task failed. Please try again." : "Task completed."),
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              steps: task.steps,
              status: task.status,
            };
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = agentMsg;
              return updated;
            }
            return [...prev, agentMsg];
          });
        } else {
          // Update in-progress message
          setMessages((prev) => {
            const existing = prev.findIndex((m) => m.id === `task-${taskId}`);
            const progressMsg: Message = {
              id: `task-${taskId}`,
              role: "agent",
              text: task.current_step || `Working... ${task.progress}%`,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              steps: task.steps,
              status: "working",
            };
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = progressMsg;
              return updated;
            }
            return [...prev, progressMsg];
          });
        }
      } catch {
        // ignore poll errors
      }
    }, 2000);
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || !agent || sending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    const taskTitle = inputValue.trim();
    setInputValue("");
    setSending(true);

    try {
      // 1. Create task
      const task = await api.post<{ id: string }>("/api/tasks", {
        title: taskTitle,
        description: taskTitle,
        section: "today",
        priority: "normal",
      });

      setActiveTaskId(task.id);

      // 2. Assign agent
      await api.post(`/api/tasks/${task.id}/assign`, { agent_id: agent.id });

      // 3. Run task
      const runRes = await api.post<{ status?: number; error?: string }>(`/api/tasks/${task.id}/run`);

      if (runRes.error) {
        setSending(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "agent",
            text: runRes.error || "Failed to run task",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "failed",
          },
        ]);
        return;
      }

      // 4. Add "working" message and start polling
      setMessages((prev) => [
        ...prev,
        {
          id: `task-${task.id}`,
          role: "agent",
          text: "Starting task...",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "working",
        },
      ]);

      pollTask(task.id);
    } catch (e) {
      setSending(false);
      const errorText = e instanceof Error ? e.message : "Something went wrong";
      // Handle auth errors
      const isAuthError = errorText.includes("401") || errorText.includes("sign in") || errorText.includes("Unauthorized");
      const isKeyError = errorText.includes("402") || errorText.includes("API key");

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "agent",
          text: isAuthError
            ? "You need to sign in to run tasks. Redirecting..."
            : isKeyError
            ? "Please add an API key in Settings first."
            : errorText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "failed",
        },
      ]);

      if (isAuthError) {
        setTimeout(() => { window.location.href = "/"; }, 3000);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.content) {
        setInputValue((prev) => prev + (prev ? "\n\n" : "") + `[File: ${file.name}]\n${data.content}`);
      }
    } catch {
      // ignore
    }
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fallback = { name: slug, icon: "smart_toy", color: "#6366F1" };
  const display = agent || fallback;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <section className="flex-1 flex flex-col bg-white relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/agents/${slug}`} className="text-[#717785] hover:text-[#1b1b1b] transition-colors mr-1">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl" style={{ backgroundColor: display.color }}>
              {agent ? agent.icon : <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{display.icon}</span>}
            </div>
            <div>
              <h3 className="font-bold text-[#1b1b1b]">{display.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#006c05] animate-pulse" />
                <span className="text-xs text-[#717785] font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl mb-4" style={{ backgroundColor: display.color }}>
                {agent ? agent.icon : <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{display.icon}</span>}
              </div>
              <h3 className="text-xl font-bold text-[#1b1b1b] mb-2">{display.name}</h3>
              <p className="text-sm text-[#717785] max-w-md">
                {agent?.description || "Send a message to start a task with this agent."}
              </p>
            </div>
          )}
          {messages.map((msg) =>
            msg.role === "user" ? (
              <UserMessage key={msg.id} msg={msg} />
            ) : (
              <AgentMessage key={msg.id} msg={msg} display={display} />
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex items-end gap-3 bg-[#f3f3f3] border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#006c05]/20 focus-within:border-[#006c05] transition-all">
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv,.json,.md,.png,.jpg,.jpeg" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#717785] hover:text-[#006c05] transition-colors rounded-xl"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 px-2 resize-none placeholder:text-[#717785]/60 min-h-[40px]"
              placeholder="Type a message or command..."
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !inputValue.trim()}
              className="bg-[#006c05] text-white p-2.5 rounded-xl shadow-lg shadow-[#006c05]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {sending ? "hourglass_empty" : "send"}
              </span>
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-[#717785] uppercase tracking-widest font-bold">
            {display.name} ({sending ? "Working..." : "Active"})
          </p>
        </div>
      </section>
    </div>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto">
      <div className="bg-[#006c05] text-white px-4 py-3 rounded-xl rounded-tr-none text-sm leading-relaxed shadow-sm whitespace-pre-wrap">
        {msg.text}
      </div>
      <span className="text-[10px] text-[#717785] font-medium">{msg.time}</span>
    </div>
  );
}

function AgentMessage({
  msg,
  display,
}: {
  msg: Message;
  display: { name: string; icon: string; color: string };
}) {
  const isWorking = msg.status === "working";

  return (
    <div className="flex gap-4 max-w-[90%]">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white" style={{ backgroundColor: display.color }}>
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          {display.icon}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className={`bg-[#f9f9f9] border border-gray-100 p-4 rounded-xl rounded-tl-none shadow-sm space-y-3 ${isWorking ? "animate-pulse" : ""}`}>
          {isWorking && (
            <div className="flex items-center gap-2 text-[#4d4bff]">
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              <span className="text-xs font-bold">Processing...</span>
            </div>
          )}
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.status === "failed" ? "text-red-600" : "text-[#414753]"}`}>
            {msg.text}
          </p>
          {msg.steps && msg.steps.length > 0 && (
            <div className="space-y-1 mt-2">
              {msg.steps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-xs">
                  <span className={`material-symbols-outlined text-sm ${
                    step.status === "done" ? "text-[#006c05]" : step.status === "working" ? "text-[#4d4bff]" : "text-slate-300"
                  }`}>
                    {step.status === "done" ? "check_circle" : step.status === "working" ? "pending" : "radio_button_unchecked"}
                  </span>
                  <span className="text-[#414753]">{step.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-[#717785] font-medium">{msg.time}</span>
      </div>
    </div>
  );
}
