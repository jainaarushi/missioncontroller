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
  const [copiedAll, setCopiedAll] = useState(false);

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

    // Fallback — empty
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

  const handleCopy = async (idx: number) => {
    const draft = drafts[idx];
    const text = draft.preview;
    await navigator.clipboard.writeText(text);
    setDrafts((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, copied: true } : d))
    );
  };

  const handleCopyAll = async () => {
    const allText = drafts
      .map((d) => `--- ${d.name} (${d.company}) ---\n${d.preview}\n${d.profileUrl ? d.profileUrl : ""}`)
      .join("\n\n");
    await navigator.clipboard.writeText(allText);
    setDrafts((prev) => prev.map((d) => ({ ...d, copied: true })));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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
              {drafts.length} approved message{drafts.length !== 1 ? "s" : ""}. Copy each message and paste it into LinkedIn.
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
              onClick={handleCopyAll}
              className="px-4 py-2 text-sm font-semibold bg-[#006c05] text-white rounded-lg flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-sm">
                {copiedAll ? "check" : "content_copy"}
              </span>
              {copiedAll ? "Copied All!" : "Copy All Messages"}
            </button>
          </div>
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
            {copiedCount}/{drafts.length} copied
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
                    <span className="text-[10px] font-bold text-[#006c05] bg-[#006c05]/10 px-2 py-0.5 rounded-full">
                      Copied
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

              {/* Copy Button */}
              <button
                onClick={() => handleCopy(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                  draft.copied
                    ? "bg-[#006c05]/10 text-[#006c05]"
                    : "bg-[#1b1b1b] text-white hover:bg-[#333]"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {draft.copied ? "check" : "content_copy"}
                </span>
                {draft.copied ? "Copied" : "Copy"}
              </button>
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
