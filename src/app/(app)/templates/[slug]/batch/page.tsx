"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/template-data";

interface Draft {
  initials: string;
  name: string;
  company: string;
  preview: string;
  profileUrl?: string;
  avatarBg: string;
  avatarText: string;
  copied: boolean;
}

export default function BatchPage() {
  const params = useParams();
  const slug = params.slug as string;
  const template = getTemplate(slug);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Load approved drafts from sessionStorage
  useEffect(() => {
    if (!template) return;
    try {
      const raw = sessionStorage.getItem(`template-drafts:${slug}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Draft[];
        setDrafts(parsed.map((d) => ({ ...d, copied: false })));
        return;
      }
    } catch { /* ignore */ }
    setDrafts([]);
  }, [slug, template]);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-[#414753]">Template not found.</p>
      </div>
    );
  }

  const copiedCount = drafts.filter((d) => d.copied).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleCopyAndOpen = async (idx: number) => {
    const draft = drafts[idx];
    await navigator.clipboard.writeText(draft.preview);
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, copied: true } : d))
    );
    if (draft.profileUrl) {
      window.open(draft.profileUrl, "_blank");
    }
    showToast(`Copied message for ${draft.name} — paste it in LinkedIn`);
  };

  const handleCopyOnly = async (idx: number) => {
    const draft = drafts[idx];
    await navigator.clipboard.writeText(draft.preview);
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, copied: true } : d))
    );
    showToast("Message copied to clipboard");
  };

  const handleSendAll = async () => {
    for (let i = 0; i < drafts.length; i++) {
      if (drafts[i].copied) continue;
      const draft = drafts[i];
      await navigator.clipboard.writeText(draft.preview);
      setDrafts((prev) =>
        prev.map((d, j) => (j === i ? { ...d, copied: true } : d))
      );
      if (draft.profileUrl) {
        window.open(draft.profileUrl, "_blank");
      }
      // Small delay between opens so browser doesn't block popups
      if (i < drafts.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    showToast(`Opened ${drafts.length} profiles — paste each message in LinkedIn`);
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
          {toast}
        </div>
      )}

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
              {drafts.length} approved message{drafts.length !== 1 ? "s" : ""}. Click to copy &amp; open each profile in LinkedIn.
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
            <button
              onClick={handleSendAll}
              disabled={copiedCount === drafts.length}
              className="px-4 py-2 text-sm font-semibold bg-[#006c05] text-white rounded-lg flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                {copiedCount === drafts.length ? "check" : "open_in_new"}
              </span>
              {copiedCount === drafts.length ? "All Done!" : "Open All Profiles"}
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-600">info</span>
        <div className="text-xs text-blue-800 leading-relaxed">
          <strong>How it works:</strong> Click &quot;Copy &amp; Open&quot; for each person — the message is copied to your clipboard and their LinkedIn profile opens in a new tab. Then click &quot;Connect&quot; on LinkedIn and paste your personalized message.
        </div>
      </div>

      {/* Progress */}
      {drafts.length > 0 && (
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#006c05] transition-all duration-300 rounded-full"
              style={{ width: `${drafts.length > 0 ? Math.round((copiedCount / drafts.length) * 100) : 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-600">
            {copiedCount}/{drafts.length} done
          </span>
        </div>
      )}

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts.map((draft, idx) => (
          <div
            key={`${draft.name}-${idx}`}
            className={`bg-white rounded-xl border p-5 transition-all ${
              draft.copied
                ? "border-[#006c05]/30 bg-[#006c05]/[0.02]"
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
                  {draft.copied && (
                    <span className="text-[10px] font-bold text-[#006c05] bg-[#006c05]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                      Done
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
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopyAndOpen(idx)}
                  disabled={draft.copied}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    draft.copied
                      ? "bg-[#006c05]/10 text-[#006c05]"
                      : "bg-[#006c05] text-white hover:brightness-110"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {draft.copied ? "check" : "open_in_new"}
                  </span>
                  {draft.copied ? "Done" : "Copy & Open"}
                </button>
                {!draft.copied && (
                  <button
                    onClick={() => handleCopyOnly(idx)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    Copy Only
                  </button>
                )}
              </div>
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
