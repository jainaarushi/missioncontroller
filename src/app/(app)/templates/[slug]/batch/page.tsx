"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/template-data";
import type { BatchRecipient } from "@/lib/template-data";

type RecipientStatus = BatchRecipient["status"] | "cancelled" | "retrying";

interface RecipientState extends Omit<BatchRecipient, "status"> {
  status: RecipientStatus;
  hidden?: boolean;
}

function StatusBadge({ status }: { status: RecipientStatus }) {
  switch (status) {
    case "delivered":
      return (
        <div className="flex items-center gap-2 text-[#006c05] font-bold text-xs uppercase">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          Delivered
        </div>
      );
    case "sending":
      return (
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm animate-spin">
            sync
          </span>
          Sending...
        </div>
      );
    case "retrying":
      return (
        <div className="flex items-center gap-2 text-orange-600 font-bold text-xs uppercase">
          <span className="material-symbols-outlined text-sm animate-spin">
            sync
          </span>
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
          <span className="material-symbols-outlined text-sm">
            hourglass_empty
          </span>
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

  const [recipients, setRecipients] = useState<RecipientState[]>(() =>
    template?.batchRecipients.map((r) => ({ ...r })) || []
  );
  const [paused, setPaused] = useState(false);
  const [throttle, setThrottle] = useState(65);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-[#414753]">Template not found.</p>
      </div>
    );
  }

  const visibleRecipients = recipients.filter((r) => !r.hidden);
  const delivered = visibleRecipients.filter((r) => r.status === "delivered").length;
  const total = visibleRecipients.length;
  const pending = visibleRecipients.filter((r) => r.status === "queued" || r.status === "sending" || r.status === "retrying").length;
  const progressPct = total > 0 ? Math.round((delivered / total) * 100) : 0;

  const speedLabel = throttle < 33 ? "Cautious" : throttle < 66 ? "Balanced" : "Aggressive";

  const handleRetry = (name: string) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.name === name ? { ...r, status: "retrying" as RecipientStatus } : r
      )
    );
    setTimeout(() => {
      setRecipients((prev) =>
        prev.map((r) =>
          r.name === name ? { ...r, status: "delivered" as RecipientStatus } : r
        )
      );
    }, 2500);
  };

  const handlePause = () => {
    setPaused(!paused);
  };

  const handleCancelRemaining = () => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.status === "queued" || r.status === "sending"
          ? { ...r, status: "cancelled" as RecipientStatus }
          : r
      )
    );
  };

  const handleClearFinished = () => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.status === "delivered" ? { ...r, hidden: true } : r
      )
    );
  };

  const handleExportLogs = () => {
    const csv = [
      "Name,Title,Strategy,Status",
      ...visibleRecipients.map((r) => `"${r.name}","${r.title}","${r.strategy}","${r.status}"`),
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
            <Link href={`/templates/${slug}`} className="hover:text-[#006c05] transition-colors">Pipelines</Link>
            <span className="material-symbols-outlined text-[10px]">
              chevron_right
            </span>
            <span className="text-[#006c05] font-medium">Batch #B-9921</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-[#1b1b1b] tracking-tight">
            Active Deployment
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePause}
            className={`px-4 py-2 text-sm font-semibold bg-white border rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors ${
              paused ? "border-[#006c05] text-[#006c05]" : "border-slate-200 text-slate-600"
            }`}
          >
            <span className="material-symbols-outlined text-lg">{paused ? "play_arrow" : "pause"}</span>
            {paused ? "Resume Queue" : "Pause Queue"}
          </button>
          <button
            onClick={handleCancelRemaining}
            className="px-4 py-2 text-sm font-semibold text-[#ba1a1a] bg-[#ffdad6]/20 border border-[#ba1a1a]/20 rounded-lg flex items-center gap-2 hover:bg-[#ffdad6]/40 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">cancel</span>
            Cancel Remaining
          </button>
        </div>
      </div>

      {/* Paused Banner */}
      {paused && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-orange-500">pause_circle</span>
          <p className="text-sm font-medium text-orange-700">Queue is paused. No new messages will be sent until resumed.</p>
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Batch Overview */}
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="px-2.5 py-1 bg-[#4d4bff]/10 text-[#3028e9] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#3028e9]/20">
                {template.batchTag}
              </span>
              <h3 className="text-xl font-bold mt-4 flex items-center gap-2">
                {template.batchTitle}
                <span className="material-symbols-outlined text-blue-600 text-lg">
                  verified
                </span>
              </h3>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-[#006c05]">
                {progressPct}%
              </p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">
                Overall Progress
              </p>
            </div>
          </div>
          <div className="mt-10 relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-700">
                {delivered} of {total} Sent
              </span>
              <span className="text-slate-400">{pending} Pending</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#006c05] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
              {pending > 0 && !paused && (
                <div className="h-full bg-[#3028e9] w-[8%] opacity-30 animate-pulse" />
              )}
            </div>
          </div>
          <div className="mt-8 flex gap-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eeeeee] flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600">
                  speed
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Average Speed</p>
                <p className="font-bold">2.4s / msg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eeeeee] flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600">
                  timer
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Duration</p>
                <p className="font-bold">01:45 active</p>
              </div>
            </div>
          </div>
          {/* Background Pattern */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 rotate-12">
            <span className="material-symbols-outlined text-[200px]">
              send
            </span>
          </div>
        </div>

        {/* Throttle Control */}
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#3028e9]">
              tune
            </span>
            <h4 className="font-bold text-lg tracking-tight">
              Adjust Throttle
            </h4>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-sm font-medium text-slate-600">
                  Current Speed: {speedLabel}
                </label>
                {speedLabel === "Balanced" && (
                  <span className="text-xs text-[#006c05] font-bold">
                    Recommended
                  </span>
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
                &ldquo;{speedLabel === "Cautious"
                  ? "Cautious speed sends messages slowly to avoid detection."
                  : speedLabel === "Balanced"
                  ? "Balanced speed mimics human interaction patterns to prevent LinkedIn rate limiting."
                  : "Aggressive speed maximizes throughput but may trigger rate limits."}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Queue Position */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#4d4bff]/10 flex items-center justify-center text-[#3028e9]">
              <span className="material-symbols-outlined">
                format_list_numbered
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Queue Position
              </p>
              <p className="text-xl font-extrabold">{pending} remaining</p>
            </div>
          </div>
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
              <button
                onClick={handleClearFinished}
                className="px-3 py-1 text-xs font-semibold bg-[#eeeeee] rounded-md hover:bg-[#e2e2e2] transition-colors"
              >
                Clear Finished
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Draft Strategy</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRecipients.map((recipient) => (
                  <tr
                    key={recipient.name}
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white border border-gray-200 flex-shrink-0 ${
                            recipient.status === "failed"
                              ? "opacity-50"
                              : recipient.status === "queued" || recipient.status === "cancelled"
                              ? "grayscale opacity-40"
                              : ""
                          }`}
                        >
                          <img
                            alt={recipient.name}
                            className="w-5 h-5 object-contain"
                            src={recipient.companyLogo}
                          />
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
                            {recipient.title}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium bg-slate-100 px-2 py-1 rounded ${
                          recipient.status === "queued" || recipient.status === "cancelled" ? "text-slate-400" : ""
                        }`}
                      >
                        {recipient.strategy}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={recipient.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {recipient.status === "failed" ? (
                        <button
                          onClick={() => handleRetry(recipient.name)}
                          className="text-[#006c05] hover:underline text-xs font-bold uppercase tracking-tight"
                        >
                          Retry Now
                        </button>
                      ) : recipient.status === "retrying" ? (
                        <span className="text-xs text-orange-500 font-bold">Retrying...</span>
                      ) : recipient.status === "cancelled" ? (
                        <span className="text-xs text-slate-400">Cancelled</span>
                      ) : recipient.status === "queued" ? (
                        <button className="text-slate-400 hover:text-[#006c05] transition-colors">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      ) : (
                        <button className="text-slate-400 hover:text-[#006c05] transition-colors">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {visibleRecipients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                      All finished recipients have been cleared.
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
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
