"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/template-data";
import { api, ApiError } from "@/lib/api";

type RecipientStatus = "queued" | "sending" | "delivered" | "failed" | "cancelled" | "retrying";

interface Recipient {
  initials: string;
  name: string;
  company: string;
  preview: string;
  profileUrl?: string;
  status: RecipientStatus;
  avatarBg: string;
  avatarText: string;
  error?: string;
}

function StatusBadge({ status }: { status: RecipientStatus }) {
  switch (status) {
    case "delivered":
      return (
        <div className="flex items-center gap-2 text-[#006c05] font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Delivered
        </div>
      );
    case "sending":
      return (
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          Sending...
        </div>
      );
    case "retrying":
      return (
        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          Retrying...
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-2 text-[#ba1a1a] font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm">error</span>
          Failed
        </div>
      );
    case "cancelled":
      return (
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm">block</span>
          Cancelled
        </div>
      );
    case "queued":
      return (
        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm">hourglass_empty</span>
          Queued
        </div>
      );
    default:
      return null;
  }
}

export default function BatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const template = getTemplate(slug);

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [paused, setPaused] = useState(false);
  const [throttle, setThrottle] = useState(65);
  const [sending, setSending] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const pausedRef = useRef(false);
  const cancelledRef = useRef(false);

  // Load approved drafts from sessionStorage
  useEffect(() => {
    if (!template) return;
    try {
      const raw = sessionStorage.getItem(`template-drafts:${slug}`);
      if (raw) {
        const drafts = JSON.parse(raw) as Recipient[];
        setRecipients(
          drafts.map((d) => ({
            ...d,
            status: "queued" as RecipientStatus,
            error: undefined,
          }))
        );
        return;
      }
    } catch { /* ignore */ }

    // Fallback to template static data
    setRecipients(
      template.batchRecipients.map((r) => ({
        initials: r.name.split(" ").map((w) => w[0]).join("").slice(0, 2),
        name: r.name,
        company: r.title,
        preview: r.strategy,
        status: r.status as RecipientStatus,
        avatarBg: "bg-gray-200",
        avatarText: "text-gray-600",
      }))
    );
  }, [slug, template]);

  // Timer
  useEffect(() => {
    if (!sending) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [sending]);

  // Determine the Composio action based on template slug
  const getAction = useCallback(() => {
    if (slug === "linkedin-outreach") {
      return { app: "linkedin", action: "LINKEDIN_SEND_CONNECTION_REQUEST" };
    }
    // Default to LinkedIn post for other templates
    return { app: "linkedin", action: "LINKEDIN_CREATE_POST" };
  }, [slug]);

  // Calculate throttle delay in ms
  const getDelay = useCallback(() => {
    if (throttle < 33) return 5000; // Cautious: 5s between sends
    if (throttle < 66) return 3000; // Balanced: 3s
    return 1000; // Aggressive: 1s
  }, [throttle]);

  const sendAll = useCallback(async () => {
    setSending(true);
    setStartTime(Date.now());
    setElapsed(0);
    cancelledRef.current = false;
    setAuthError(null);

    const { app, action } = getAction();
    const delay = getDelay();

    for (let i = 0; i < recipients.length; i++) {
      // Check if cancelled
      if (cancelledRef.current) break;

      // Wait while paused
      while (pausedRef.current) {
        await new Promise((r) => setTimeout(r, 500));
        if (cancelledRef.current) break;
      }
      if (cancelledRef.current) break;

      const recipient = recipients[i];
      if (recipient.status !== "queued") continue;

      // Mark as sending
      setRecipients((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: "sending" as RecipientStatus } : r))
      );

      try {
        // Build params based on action type
        const sendParams: Record<string, unknown> =
          action === "LINKEDIN_SEND_CONNECTION_REQUEST"
            ? {
                profile_url: recipient.profileUrl || "",
                message: recipient.preview,
              }
            : { text: recipient.preview };

        await api.post("/api/templates/send", {
          app,
          action,
          params: sendParams,
        });

        setRecipients((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: "delivered" as RecipientStatus } : r))
        );
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setAuthError("Sign in to send messages.");
            break;
          }
          if (err.status === 400 && err.message.includes("not connected")) {
            setAuthError("LinkedIn is not connected. Connect it in Settings first.");
            break;
          }
          const errMsg = err.data?.availableActions
            ? `${err.message} (Available: ${(err.data.availableActions as string[]).join(", ")})`
            : err.message;
          setRecipients((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: "failed" as RecipientStatus, error: errMsg } : r
            )
          );
        } else {
          setRecipients((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: "failed" as RecipientStatus, error: "Send failed" } : r
            )
          );
        }
      }

      // Throttle delay between sends
      if (i < recipients.length - 1) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    setSending(false);
  }, [recipients, getAction, getDelay]);

  // Auto-start sending when recipients load with queued status
  useEffect(() => {
    if (recipients.length > 0 && recipients.some((r) => r.status === "queued") && !sending) {
      sendAll();
    }
    // Only run when recipients are first loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipients.length > 0]);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-[#414753]">Template not found.</p>
      </div>
    );
  }

  const visibleRecipients = recipients;
  const delivered = visibleRecipients.filter((r) => r.status === "delivered").length;
  const total = visibleRecipients.length;
  const pending = visibleRecipients.filter(
    (r) => r.status === "queued" || r.status === "sending" || r.status === "retrying"
  ).length;
  const failed = visibleRecipients.filter((r) => r.status === "failed").length;
  const progressPct = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const speedLabel = throttle < 33 ? "Cautious" : throttle < 66 ? "Balanced" : "Aggressive";
  const avgSpeed = delivered > 0 && elapsed > 0 ? (elapsed / delivered).toFixed(1) : "—";
  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  const handleRetry = async (idx: number) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, status: "retrying" as RecipientStatus, error: undefined } : r))
    );

    const recipient = recipients[idx];
    const { app, action } = getAction();

    try {
      const retryParams: Record<string, unknown> =
        action === "LINKEDIN_SEND_CONNECTION_REQUEST"
          ? { profile_url: recipient.profileUrl || "", message: recipient.preview }
          : { text: recipient.preview };

      await api.post("/api/templates/send", {
        app,
        action,
        params: retryParams,
      });
      setRecipients((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, status: "delivered" as RecipientStatus } : r))
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Retry failed";
      setRecipients((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, status: "failed" as RecipientStatus, error: msg } : r))
      );
    }
  };

  const handlePause = () => {
    const next = !paused;
    setPaused(next);
    pausedRef.current = next;
  };

  const handleCancelRemaining = () => {
    cancelledRef.current = true;
    setRecipients((prev) =>
      prev.map((r) =>
        r.status === "queued" || r.status === "sending"
          ? { ...r, status: "cancelled" as RecipientStatus }
          : r
      )
    );
  };

  const handleExportLogs = () => {
    const csv = [
      "Name,Company,Message,Status,Error",
      ...visibleRecipients.map(
        (r) =>
          `"${r.name}","${r.company}","${r.preview.replace(/"/g, '""')}","${r.status}","${r.error || ""}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-${slug}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href={`/templates/${slug}`} className="hover:text-[#006c05] transition-colors">
              Pipelines
            </Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-[#006c05] font-medium">
              Batch #{Math.random().toString(36).slice(2, 6).toUpperCase()}
            </span>
          </nav>
          <h2 className="text-3xl font-extrabold text-[#1b1b1b] tracking-tight">
            Active Deployment
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePause}
            disabled={!sending}
            className={`px-4 py-2 text-sm font-semibold bg-white border rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50 ${
              paused ? "border-[#006c05] text-[#006c05]" : "border-slate-200 text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {paused ? "play_arrow" : "pause"}
            </span>
            {paused ? "Resume Queue" : "Pause Queue"}
          </button>
          <button
            onClick={handleCancelRemaining}
            disabled={!sending && pending === 0}
            className="px-4 py-2 text-sm font-semibold text-[#ba1a1a] bg-[#ffdad6]/20 border border-[#ba1a1a]/20 rounded-lg flex items-center gap-2 hover:bg-[#ffdad6]/40 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            Cancel Remaining
          </button>
        </div>
      </div>

      {/* Auth Error Banner */}
      {authError && (
        <div className="mb-6 bg-[#ffdad6]/30 border border-[#ba1a1a]/10 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
          <p className="text-sm font-medium text-[#93000a]">{authError}</p>
          <Link
            href="/settings"
            className="ml-auto px-3 py-1 bg-[#006c05] text-white text-xs font-bold rounded-lg hover:brightness-110"
          >
            Go to Settings
          </Link>
        </div>
      )}

      {/* Paused Banner */}
      {paused && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-500">pause_circle</span>
          <p className="text-sm font-medium text-orange-700">
            Queue is paused. No new messages will be sent until resumed.
          </p>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Batch Overview */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="px-2.5 py-1 bg-[#4d4bff]/10 text-[#3028e9] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#3028e9]/20">
                Sending {total} Approved Drafts
              </span>
              <h3 className="text-xl font-bold mt-4 flex items-center gap-2">
                {template.batchTitle}
                {progressPct === 100 && (
                  <span className="material-symbols-outlined text-[#006c05] text-lg">verified</span>
                )}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-[#006c05]">{progressPct}%</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                Overall Progress
              </p>
            </div>
          </div>
          <div className="mt-10 relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-700">
                {delivered} of {total} Sent
                {failed > 0 && <span className="text-[#ba1a1a] ml-2">({failed} failed)</span>}
              </span>
              <span className="text-slate-400">{pending} Pending</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#006c05] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
              {failed > 0 && (
                <div
                  className="h-full bg-[#ba1a1a]"
                  style={{ width: `${Math.round((failed / total) * 100)}%` }}
                />
              )}
              {pending > 0 && !paused && (
                <div className="h-full bg-[#3028e9] w-[8%] opacity-30 animate-pulse" />
              )}
            </div>
          </div>
          <div className="mt-8 flex gap-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eeeeee] flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600">speed</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Average Speed</p>
                <p className="font-bold">{avgSpeed}s / msg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eeeeee] flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600">timer</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Duration</p>
                <p className="font-bold">{elapsedStr} active</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 rotate-12">
            <span className="material-symbols-outlined text-[200px]">send</span>
          </div>
        </div>

        {/* Throttle Control */}
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#3028e9]">tune</span>
            <h4 className="font-bold text-lg tracking-tight">Adjust Throttle</h4>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-sm font-medium text-slate-600">
                  Current Speed: {speedLabel}
                </label>
                {speedLabel === "Balanced" && (
                  <span className="text-xs text-[#006c05] font-bold">Recommended</span>
                )}
              </div>
              <input
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#006c05]"
                max={100}
                min={1}
                type="range"
                value={throttle}
                onChange={(e) => setThrottle(Number(e.target.value))}
              />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase">
                <span>Cautious</span>
                <span>Steady</span>
                <span>Aggressive</span>
              </div>
            </div>
            <div className="p-4 bg-[#eeeeee] rounded-lg">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                &ldquo;
                {speedLabel === "Cautious"
                  ? "Cautious speed sends messages slowly to avoid detection."
                  : speedLabel === "Balanced"
                  ? "Balanced speed mimics human interaction patterns to prevent LinkedIn rate limiting."
                  : "Aggressive speed maximizes throughput but may trigger rate limits."}
                &rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#4d4bff]/10 flex items-center justify-center text-[#3028e9]">
              <span className="material-symbols-outlined">format_list_numbered</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Queue Position
              </p>
              <p className="text-xl font-extrabold">{pending} remaining</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#006c05]">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Delivered
              </p>
              <p className="text-xl font-extrabold">{delivered} sent</p>
            </div>
          </div>
          {failed > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ffdad6]/30 flex items-center justify-center text-[#ba1a1a]">
                <span className="material-symbols-outlined">error</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Failed
                </p>
                <p className="text-xl font-extrabold">{failed} errors</p>
              </div>
            </div>
          )}
        </div>

        {/* Recipient Queue */}
        <div className="col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h4 className="font-bold text-lg">Recipient Queue</h4>
            <div className="flex gap-2">
              <button
                onClick={handleExportLogs}
                className="px-3 py-1 text-xs font-semibold bg-[#eeeeee] rounded-md hover:bg-[#e2e2e2] transition-colors"
              >
                Export Logs
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Message Preview</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRecipients.map((recipient, idx) => (
                  <tr
                    key={`${recipient.initials}-${idx}`}
                    className={`hover:bg-slate-50 transition-colors ${
                      recipient.status === "failed"
                        ? "bg-[#ffdad6]/5"
                        : recipient.status === "cancelled"
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            recipient.avatarBg
                          } ${recipient.avatarText} ${
                            recipient.status === "queued" || recipient.status === "cancelled"
                              ? "grayscale opacity-40"
                              : ""
                          }`}
                        >
                          {recipient.initials}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              recipient.status === "queued" || recipient.status === "cancelled"
                                ? "text-slate-400"
                                : ""
                            }`}
                          >
                            {recipient.name}
                          </p>
                          <p
                            className={`text-xs ${
                              recipient.status === "queued" || recipient.status === "cancelled"
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {recipient.company}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-slate-500 truncate italic">{recipient.preview}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={recipient.status} />
                      {recipient.error && (
                        <p
                          className="text-[10px] text-[#ba1a1a] mt-1 max-w-[400px] break-all cursor-pointer"
                          title={recipient.error}
                          onClick={() => {
                            navigator.clipboard.writeText(recipient.error || "");
                            alert(recipient.error);
                          }}
                        >
                          {recipient.error}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {recipient.status === "failed" ? (
                        <button
                          onClick={() => handleRetry(idx)}
                          className="text-[#006c05] hover:underline text-xs font-bold uppercase tracking-tight"
                        >
                          Retry Now
                        </button>
                      ) : recipient.status === "retrying" ? (
                        <span className="text-xs text-orange-500 font-bold">Retrying...</span>
                      ) : recipient.status === "cancelled" ? (
                        <span className="text-xs text-slate-400">Cancelled</span>
                      ) : recipient.status === "delivered" ? (
                        <span className="material-symbols-outlined text-slate-400 text-lg">visibility</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {visibleRecipients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      No approved drafts to send. Go back to drafting to approve some.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href={`/templates/${slug}/drafting`}
              className="text-sm font-semibold text-[#3028e9] hover:text-[#4d4bff] transition-colors flex items-center justify-center mx-auto gap-2"
            >
              Back to drafting view
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
