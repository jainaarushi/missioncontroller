"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/template-data";
import { api } from "@/lib/api";

interface Draft {
  initials: string;
  name: string;
  company: string;
  preview: string;
  profileUrl?: string;
  avatarBg: string;
  avatarText: string;
  status: "pending" | "sending" | "sent" | "failed";
  error?: string;
}

export default function BatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const template = getTemplate(slug);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [hasCookie, setHasCookie] = useState<boolean | null>(null);
  const [sendingAll, setSendingAll] = useState(false);

  // Check if LinkedIn cookie is set
  useEffect(() => {
    api.get<{ hasCookie: boolean }>("/api/user/linkedin-cookie")
      .then((data) => setHasCookie(data.hasCookie))
      .catch(() => setHasCookie(false));
  }, []);

  // Load approved drafts from sessionStorage
  useEffect(() => {
    if (!template) return;
    try {
      const raw = sessionStorage.getItem(`template-drafts:${slug}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Draft[];
        setDrafts(parsed.map((d) => ({ ...d, status: "pending" as const, error: undefined })));
        return;
      }
    } catch { /* ignore */ }
    setDrafts([]);
  }, [slug, template]);

  const sendOne = useCallback(async (idx: number) => {
    const draft = drafts[idx];
    if (!draft.profileUrl) return;

    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, status: "sending" as const, error: undefined } : d))
    );

    try {
      await api.post("/api/linkedin/send", {
        profileUrl: draft.profileUrl,
        message: draft.preview,
        action: "connect",
      });
      setDrafts((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, status: "sent" as const } : d))
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Send failed";
      setDrafts((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, status: "failed" as const, error: msg } : d))
      );
    }
  }, [drafts]);

  const sendAll = async () => {
    setSendingAll(true);
    for (let i = 0; i < drafts.length; i++) {
      if (drafts[i].status === "sent" || !drafts[i].profileUrl) continue;
      await sendOne(i);
      // Small delay between sends to avoid LinkedIn rate limits
      if (i < drafts.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    setSendingAll(false);
  };

  const handleExport = () => {
    const csv = [
      "Name,Company,Profile URL,Message",
      ...drafts.map(
        (d) =>
          `"${d.name}","${d.company}","${d.profileUrl || ""}","${d.preview.replace(/"/g, '""')}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-drafts-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-[#414753]">Template not found.</p>
      </div>
    );
  }

  const sentCount = drafts.filter((d) => d.status === "sent").length;
  const failedCount = drafts.filter((d) => d.status === "failed").length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href={`/templates/${slug}`} className="hover:text-[#006c05] transition-colors">
            Configure
          </Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <Link href={`/templates/${slug}/drafting`} className="hover:text-[#006c05] transition-colors">
            Drafting
          </Link>
          <span className="material-symbols-outlined text-[10px]">chevron_right</span>
          <span className="text-[#006c05] font-medium">Send</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1b1b1b] tracking-tight">
              Ready to Send
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {drafts.length} approved message{drafts.length !== 1 ? "s" : ""}.
              {hasCookie ? " Send connection requests directly via LinkedIn." : " Add your LinkedIn cookie in Settings to send."}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export CSV
            </button>
            {hasCookie ? (
              <button
                onClick={sendAll}
                disabled={sendingAll || sentCount === drafts.length}
                className="px-4 py-2 text-sm font-semibold bg-[#006c05] text-white rounded-lg flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  {sendingAll ? "hourglass_empty" : sentCount === drafts.length ? "check" : "send"}
                </span>
                {sendingAll ? "Sending..." : sentCount === drafts.length ? "All Sent!" : "Send All"}
              </button>
            ) : (
              <Link
                href="/settings"
                className="px-4 py-2 text-sm font-semibold bg-[#006c05] text-white rounded-lg flex items-center gap-2 hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-sm">settings</span>
                Add LinkedIn Cookie
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* No cookie warning */}
      {hasCookie === false && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600">warning</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">LinkedIn cookie not configured</p>
            <p className="text-xs text-amber-700 mt-1">
              Go to <Link href="/settings" className="underline font-semibold">Settings</Link> and add your LinkedIn <code className="bg-amber-100 px-1 rounded">li_at</code> cookie to send connection requests directly.
              You can still export as CSV and send manually.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {drafts.length > 0 && (
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#006c05] transition-all duration-300 rounded-full"
              style={{ width: `${drafts.length > 0 ? Math.round((sentCount / drafts.length) * 100) : 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-600">
            {sentCount}/{drafts.length} sent
            {failedCount > 0 && <span className="text-red-500 ml-1">({failedCount} failed)</span>}
          </span>
        </div>
      )}

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts.map((draft, idx) => (
          <div
            key={`${draft.name}-${idx}`}
            className={`bg-white rounded-xl border p-5 transition-all ${
              draft.status === "sent"
                ? "border-[#006c05]/30 bg-[#006c05]/[0.02]"
                : draft.status === "failed"
                ? "border-red-200 bg-red-50/30"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${draft.avatarBg} ${draft.avatarText}`}
              >
                {draft.initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">{draft.name}</span>
                  <span className="text-xs text-slate-400">{draft.company}</span>
                  {draft.status === "sent" && (
                    <span className="text-[10px] font-bold text-[#006c05] bg-[#006c05]/10 px-2 py-0.5 rounded-full">
                      Sent
                    </span>
                  )}
                  {draft.status === "sending" && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Sending...
                    </span>
                  )}
                  {draft.status === "failed" && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Failed
                    </span>
                  )}
                </div>
                {draft.profileUrl && (
                  <a
                    href={draft.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#006c05] hover:underline mb-2 block"
                  >
                    {draft.profileUrl.replace("https://www.", "").replace("https://", "")}
                  </a>
                )}
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {draft.preview}
                </p>
                {draft.error && (
                  <p className="text-xs text-red-500 mt-2">{draft.error}</p>
                )}
              </div>

              {/* Send / Retry Button */}
              {hasCookie && draft.profileUrl ? (
                <button
                  onClick={() => sendOne(idx)}
                  disabled={draft.status === "sending" || draft.status === "sent"}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    draft.status === "sent"
                      ? "bg-[#006c05]/10 text-[#006c05]"
                      : draft.status === "failed"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : draft.status === "sending"
                      ? "bg-gray-200 text-gray-500"
                      : "bg-[#1b1b1b] text-white hover:bg-[#333]"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {draft.status === "sent" ? "check" : draft.status === "sending" ? "hourglass_empty" : draft.status === "failed" ? "refresh" : "send"}
                  </span>
                  {draft.status === "sent" ? "Sent" : draft.status === "sending" ? "Sending" : draft.status === "failed" ? "Retry" : "Send"}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(draft.preview);
                    setDrafts((prev) =>
                      prev.map((d, i) => (i === idx ? { ...d, status: "sent" as const } : d))
                    );
                  }}
                  disabled={draft.status === "sent"}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    draft.status === "sent"
                      ? "bg-[#006c05]/10 text-[#006c05]"
                      : "bg-[#1b1b1b] text-white hover:bg-[#333]"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {draft.status === "sent" ? "check" : "content_copy"}
                  </span>
                  {draft.status === "sent" ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
        ))}

        {drafts.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 block">drafts</span>
            <p className="text-slate-500 mb-4">No approved drafts to send.</p>
            <Link
              href={`/templates/${slug}/drafting`}
              className="text-sm font-semibold text-[#006c05] hover:underline"
            >
              Go back to drafting
            </Link>
          </div>
        )}
      </div>

      {/* Back Link */}
      {drafts.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href={`/templates/${slug}/drafting`}
            className="text-sm font-semibold text-slate-500 hover:text-[#006c05] transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to drafting
          </Link>
        </div>
      )}
    </div>
  );
}
