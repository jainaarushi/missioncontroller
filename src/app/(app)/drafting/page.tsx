"use client";

import { useState } from "react";

type DraftStatus = "ready" | "drafting" | "manual" | "approved";

interface DraftState {
  initials: string;
  name: string;
  company: string;
  preview: string;
  status: DraftStatus;
  avatarBg: string;
  avatarText: string;
  editing?: boolean;
  editText?: string;
}

const INITIAL_ROWS: DraftState[] = [
  {
    initials: "SK",
    name: "Sarah Kendrick",
    company: "Lumina Systems",
    preview:
      '"Hi Sarah, I noticed your recent talk on edge computing at DevCon. It really aligned with our..."',
    status: "ready",
    avatarBg: "bg-[#ece0d6]",
    avatarText: "text-[#635b53]",
  },
  {
    initials: "MJ",
    name: "Marcus Jensen",
    company: "Flowstate Labs",
    preview:
      '"Great post about the Series B funding, Marcus! Flowstate seems to be scaling incredibly fast..."',
    status: "drafting",
    avatarBg: "bg-[#e1dfff]",
    avatarText: "text-[#3028e9]",
  },
  {
    initials: "AL",
    name: "Anita Lowe",
    company: "Cognito AI",
    preview:
      '"Hello Anita, saw your interview on the future of LLMs. Your point about context windows..."',
    status: "ready",
    avatarBg: "bg-[#76ff65]",
    avatarText: "text-[#006c05]",
  },
  {
    initials: "DT",
    name: "David Tan",
    company: "Peak Performance",
    preview:
      '"Hi David, hope you\'re having a great week! I\'ve been following Peak Performance\'s growth..."',
    status: "manual",
    avatarBg: "bg-gray-200",
    avatarText: "text-gray-600",
  },
];

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
  const [drafts, setDrafts] = useState<DraftState[]>(() =>
    INITIAL_ROWS.map((r) => ({ ...r }))
  );
  const [filterStatus, setFilterStatus] = useState<DraftStatus | null>(null);

  const approvedCount = drafts.filter((d) => d.status === "approved").length;
  const filteredDrafts = filterStatus
    ? drafts.filter((d) => d.status === filterStatus)
    : drafts;

  const handleApprove = (initials: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials ? { ...d, status: "approved" } : d
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

  const handleRegenerate = (initials: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.initials === initials ? { ...d, status: "drafting" } : d
      )
    );
    setTimeout(() => {
      setDrafts((prev) =>
        prev.map((d) =>
          d.initials === initials ? { ...d, status: "ready" } : d
        )
      );
    }, 2000);
  };

  const cycleFilter = () => {
    const statuses: (DraftStatus | null)[] = [null, "ready", "approved", "drafting", "manual"];
    const currentIdx = statuses.indexOf(filterStatus);
    setFilterStatus(statuses[(currentIdx + 1) % statuses.length]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f3f3f3]">
      {/* Phase Indicator */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-[#006c05] -translate-y-1/2 z-0" />

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#006c05] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="text-xs font-bold text-[#1b1b1b]">Research</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white border-4 border-[#006c05] flex items-center justify-center text-[#006c05] shadow-lg shadow-[#006c05]/20">
              <span className="material-symbols-outlined animate-pulse">edit_note</span>
            </div>
            <span className="text-xs font-bold text-[#006c05]">Drafting</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400">
              <span className="material-symbols-outlined text-sm">send</span>
            </div>
            <span className="text-xs font-medium text-gray-400">Sending</span>
          </div>
        </div>
      </div>

      {/* Drafting Workspace */}
      <div className="flex-1 p-8 overflow-y-auto space-y-6 w-full">
        {/* Status Card */}
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
              <span className="h-2 w-2 rounded-full bg-[#006c05] animate-ping" />
              <h3 className="text-lg font-bold">Drafting in Progress</h3>
            </div>
            <p className="text-sm text-gray-500">
              Research Strategist is synthesizing LinkedIn profiles and company news into personalized outreach.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {approvedCount > 0 && (
              <span className="text-sm font-bold text-[#006c05]">{approvedCount} approved</span>
            )}
            <button
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

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <h4 className="font-bold text-[#1b1b1b]">Generated Message Pipeline</h4>
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
                onClick={() => {
                  setDrafts(INITIAL_ROWS.map((r) => ({ ...r })));
                  setFilterStatus(null);
                }}
                className="p-2 text-gray-400 hover:text-[#1b1b1b] transition-colors"
                title="Reset all drafts"
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
                      <td className="px-6 py-4 text-sm text-gray-600">{row.company}</td>
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
                          <p className="text-sm text-gray-500 truncate italic">{row.preview}</p>
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
            <span>Showing {filteredDrafts.length} of {drafts.length} drafted messages</span>
            <div className="flex gap-2">
              <button
                onClick={() => setDrafts((prev) => prev.map((d) => d.status === "ready" || d.status === "manual" ? { ...d, status: "approved" } : d))}
                className="px-3 py-1 bg-[#006c05] text-white font-bold rounded hover:brightness-110 transition-all"
              >
                Approve All Ready
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
