"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/template-data";
import type { DraftRow } from "@/lib/template-data";
import { api, ApiError } from "@/lib/api";

type DraftStatus = DraftRow["status"] | "approved";

interface DraftState extends Omit<DraftRow, "status"> {
  status: DraftStatus;
  editing?: boolean;
  editText?: string;
}

interface GenerateResponse {
  drafts: DraftRow[];
}

function StatusBadge({ status }: { status: DraftStatus }) {
  switch (status) {
    case "ready":
      return (
        <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
          Ready for Review
        </span>
      );
    case "approved":
      return (
        <span className="px-2.5 py-1 rounded-full bg-[#006c05]/10 text-[#006c05] text-xs font-bold border border-[#006c05]/20 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Approved
        </span>
      );
    case "drafting":
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
          AI Drafting...
        </span>
      );
    case "manual":
      return (
        <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
          Manual Check Req.
        </span>
      );
    default:
      return null;
  }
}

export default function DraftingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const template = getTemplate(slug);

  const [drafts, setDrafts] = useState<DraftState[]>([]);
  const [filterStatus, setFilterStatus] = useState<DraftStatus | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState<string>("Initializing...");
  const [genError, setGenError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateDrafts = useCallback(async () => {
    if (!template) return;

    // Read config saved by the configure page
    let formValues: Record<string, string> = {};
    let rangeValue = 5;
    try {
      const raw = sessionStorage.getItem(`template-config:${slug}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        formValues = parsed.formValues || {};
        rangeValue = parsed.rangeValue || 5;
      }
    } catch {
      // No config — use defaults
    }

    setGenerating(true);
    setGenError(null);
    setGenPhase("Researching targets...");

    // Simulate research phase
    await new Promise((r) => setTimeout(r, 1500));
    setGenPhase("Generating personalized drafts...");

    try {
      const data = await api.post<GenerateResponse>("/api/templates/generate", {
        slug,
        formValues,
        batchSize: Math.min(rangeValue, 20),
      });

      setGenPhase("Finalizing drafts...");
      await new Promise((r) => setTimeout(r, 800));

      setDrafts(data.drafts.map((r) => ({ ...r })));
      setHasGenerated(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setGenError("Sign in to generate drafts.");
        } else if (err.status === 402) {
          setGenError("Add your API key in Settings first.");
        } else {
          setGenError(err.message);
        }
      } else {
        setGenError("Failed to generate drafts. Please try again.");
      }
      // Fall back to template static data so page isn't empty
      setDrafts(template.draftRows.map((r) => ({ ...r })));
      setHasGenerated(true);
    } finally {
      setGenerating(false);
    }
  }, [slug, template]);

  useEffect(() => {
    if (!hasGenerated && template) {
      generateDrafts();
    }
  }, [generateDrafts, hasGenerated, template]);

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-[#414753]">Template not found.</p>
      </div>
    );
  }

  const approvedCount = drafts.filter((d) => d.status === "approved").length;
  const filteredDrafts = filterStatus
    ? drafts.filter((d) => d.status === filterStatus)
    : drafts;

  const handleApprove = (initials: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials ? { ...d, status: "approved" as DraftStatus } : d
      )
    );
  };

  const handleEdit = (initials: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials ? { ...d, editing: true, editText: d.preview } : d
      )
    );
  };

  const handleEditSave = (initials: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials
          ? { ...d, preview: d.editText || d.preview, editing: false, editText: undefined }
          : d
      )
    );
  };

  const handleEditCancel = (initials: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials ? { ...d, editing: false, editText: undefined } : d
      )
    );
  };

  const handleEditChange = (initials: string, value: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials ? { ...d, editText: value } : d
      )
    );
  };

  const handleRegenerate = async (initials: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials ? { ...d, status: "drafting" as DraftStatus } : d
      )
    );

    // Read config for regeneration
    let formValues: Record<string, string> = {};
    try {
      const raw = sessionStorage.getItem(`template-config:${slug}`);
      if (raw) formValues = JSON.parse(raw).formValues || {};
    } catch { /* ignore */ }

    try {
      const data = await api.post<GenerateResponse>("/api/templates/generate", {
        slug,
        formValues,
        batchSize: 1,
      });
      if (data.drafts.length > 0) {
        const newDraft = data.drafts[0];
        setDrafts((prev) =>
          prev.map((d) =>
            d.initials === initials
              ? { ...d, preview: newDraft.preview, status: "ready" as DraftStatus }
              : d
          )
        );
        return;
      }
    } catch {
      // Fall through to ready status
    }

    // Fallback: just mark as ready again
    setTimeout(() => {
      setDrafts((prev) =>
        prev.map((d) =>
          d.initials === initials ? { ...d, status: "ready" as DraftStatus } : d
        )
      );
    }, 1500);
  };

  const cycleFilter = () => {
    const statuses: (DraftStatus | null)[] = [null, "ready", "approved", "drafting", "manual"];
    const currentIdx = statuses.indexOf(filterStatus);
    setFilterStatus(statuses[(currentIdx + 1) % statuses.length]);
  };

  // Update phase indicators based on generation state
  const phases = template.draftPhases.map((p) => {
    if (generating && p.label === "Research") return { ...p, status: "active" as const };
    if (generating && p.label !== "Research") return { ...p, status: "pending" as const };
    return p;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f3f3f3]">
      {/* Phase Indicator */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          {(() => {
            const activeIdx = phases.findIndex((p) => p.status === "active");
            const progress = activeIdx >= 0 ? (activeIdx / (phases.length - 1)) * 100 : 0;
            return (
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#006c05] -translate-y-1/2 z-0"
                style={{ width: `${progress}%` }}
              />
            );
          })()}

          {phases.map((phase) => (
            <div key={phase.label} className="relative z-10 flex flex-col items-center gap-2">
              {phase.status === "done" && (
                <div className="w-8 h-8 rounded-full bg-[#006c05] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-sm">check</span>
                </div>
              )}
              {phase.status === "active" && (
                <div className="w-10 h-10 rounded-full bg-white border-4 border-[#006c05] flex items-center justify-center text-[#006c05] shadow-lg shadow-[#006c05]/20">
                  <span className="material-symbols-outlined animate-pulse">edit_note</span>
                </div>
              )}
              {phase.status === "pending" && (
                <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-sm">send</span>
                </div>
              )}
              <span
                className={`text-xs font-bold ${
                  phase.status === "active"
                    ? "text-[#006c05]"
                    : phase.status === "done"
                    ? "text-[#1b1b1b]"
                    : "text-gray-400 font-medium"
                }`}
              >
                {phase.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Drafting Workspace */}
      <div className="flex-1 p-8 overflow-y-auto space-y-6 w-full">
        {/* Generation Progress */}
        {generating && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-xl bg-[#4d4bff] flex items-center justify-center text-white animate-pulse">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">{genPhase}</h3>
              <p className="text-sm text-gray-500">
                {template.draftingDescription}
              </p>
            </div>
            <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#006c05] rounded-full animate-[progress_3s_ease-in-out_infinite]" style={{ width: "60%" }} />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {genError && (
          <div className="bg-[#ffdad6]/30 border border-[#ba1a1a]/10 rounded-xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#ba1a1a]">warning</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#93000a]">{genError}</p>
              <p className="text-xs text-[#93000a]/70 mt-1">Showing sample drafts. Connect your API key in Settings to generate real ones.</p>
            </div>
            <button
              onClick={() => { setHasGenerated(false); setGenError(null); }}
              className="px-3 py-1 bg-[#006c05] text-white text-xs font-bold rounded-lg hover:brightness-110"
            >
              Retry
            </button>
          </div>
        )}

        {/* Status Card */}
        {!generating && drafts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
            <div className="h-16 w-16 rounded-xl bg-[#4d4bff] flex items-center justify-center text-white">
              <span
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#006c05]" />
                <h3 className="text-lg font-bold">
                  {drafts.length} Drafts Generated
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                Review, edit, and approve drafts before sending.
              </p>
            </div>
            <div className="flex gap-3 items-center">
              {approvedCount > 0 && (
                <span className="text-sm font-bold text-[#006c05]">{approvedCount} approved</span>
              )}
              <button
                onClick={() => {
                  const approved = drafts.filter((d) => d.status === "approved");
                  sessionStorage.setItem(
                    `template-drafts:${slug}`,
                    JSON.stringify(approved)
                  );
                  router.push(`/templates/${slug}/batch`);
                }}
                className={`px-4 py-2 bg-[#006c05] text-white font-semibold rounded-lg hover:brightness-110 transition-all flex items-center gap-2 ${
                  approvedCount === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={approvedCount === 0}
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>Send {approvedCount > 0 ? approvedCount : "All"} Approved Drafts</span>
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!generating && drafts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <h4 className="font-bold text-[#1b1b1b]">
                Generated Message Pipeline
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={cycleFilter}
                  className={`p-2 transition-colors rounded-lg flex items-center gap-1 ${
                    filterStatus ? "text-[#006c05] bg-green-50" : "text-gray-400 hover:text-[#1b1b1b]"
                  }`}
                  title={filterStatus ? `Filtering: ${filterStatus}` : "Filter by status"}
                >
                  <span className="material-symbols-outlined">filter_list</span>
                  {filterStatus && (
                    <span className="text-xs font-bold capitalize">{filterStatus}</span>
                  )}
                </button>
                <button
                  onClick={() => { setHasGenerated(false); setGenError(null); }}
                  className="p-2 text-gray-400 hover:text-[#1b1b1b] transition-colors"
                  title="Regenerate all drafts"
                >
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#eeeeee] text-xs font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Profile Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Drafted Message Preview</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDrafts.map((row) => {
                    const isDrafting = row.status === "drafting";
                    const isApproved = row.status === "approved";
                    return (
                      <tr
                        key={row.initials}
                        className={`hover:bg-white transition-colors group ${
                          isApproved ? "bg-[#006c05]/[0.02]" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full ${row.avatarBg} ${row.avatarText} font-bold flex items-center justify-center text-xs`}
                            >
                              {row.initials}
                            </div>
                            <span className="font-medium">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {row.company}
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          {row.editing ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                className="w-full px-3 py-2 rounded-lg border border-[#006c05] focus:ring-2 focus:ring-[#006c05] outline-none text-sm"
                                rows={3}
                                value={row.editText || ""}
                                onChange={(e) => handleEditChange(row.initials, e.target.value)}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditSave(row.initials)}
                                  className="px-3 py-1 bg-[#006c05] text-white text-xs font-bold rounded-lg"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => handleEditCancel(row.initials)}
                                  className="px-3 py-1 border border-gray-200 text-xs font-bold rounded-lg"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 truncate italic">
                              {row.preview}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {isDrafting ? (
                            <div className="flex justify-end gap-1 opacity-40">
                              <button className="p-2 text-gray-300 cursor-not-allowed">
                                <span className="material-symbols-outlined">check_circle</span>
                              </button>
                              <button className="p-2 text-gray-300 cursor-not-allowed">
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button className="p-2 text-gray-300 cursor-not-allowed">
                                <span className="material-symbols-outlined">refresh</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleApprove(row.initials)}
                                className={`p-2 rounded-lg ${
                                  isApproved
                                    ? "text-[#006c05]/40 cursor-default"
                                    : "text-[#006c05] hover:bg-[#006c05]/10"
                                }`}
                                title={isApproved ? "Already approved" : "Approve"}
                                disabled={isApproved}
                              >
                                <span className="material-symbols-outlined" style={isApproved ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                                  check_circle
                                </span>
                              </button>
                              <button
                                onClick={() => handleEdit(row.initials)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button
                                onClick={() => handleRegenerate(row.initials)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                                title="Regenerate"
                              >
                                <span className="material-symbols-outlined">refresh</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredDrafts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No drafts match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {filteredDrafts.length} of {drafts.length} drafted messages
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setDrafts((prev) => prev.map((d) => d.status === "ready" || d.status === "manual" ? { ...d, status: "approved" as DraftStatus } : d))}
                  className="px-3 py-1 bg-[#006c05] text-white font-bold rounded hover:brightness-110 transition-all"
                >
                  Approve All Ready
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
