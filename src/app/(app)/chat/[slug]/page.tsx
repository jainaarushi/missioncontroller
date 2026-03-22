"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const AGENTS: Record<string, { name: string; icon: string; color: string }> = {
  "ui-ux-designer": { name: "UI/UX Designer", icon: "brush", color: "#ec4899" },
  "data-scientist": { name: "Data Scientist", icon: "science", color: "#8b5cf6" },
  researcher: { name: "Research Strategist", icon: "travel_explore", color: "#3b82f6" },
  developer: { name: "Full-Stack Developer", icon: "terminal", color: "#0ea5e9" },
  "data-analyst": { name: "Data Analyst", icon: "bar_chart", color: "#14b8a6" },
  "content-strategist": { name: "Content Strategist", icon: "edit_note", color: "#f59e0b" },
};

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
  time: string;
  searchWidget?: { label: string };
  highlight?: string;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    role: "user",
    text: "I need a list of the top 10 AI researchers currently at DeepMind specializing in multi-modal LLMs. Focus on those who have published in the last 6 months.",
    time: "10:42 AM",
  },
  {
    id: 2,
    role: "agent",
    text: "Understood. I've initiated the research protocol. I'm currently scraping verified publications from NeurIPS and ICML, cross-referencing with the official DeepMind team directory.",
    time: "10:43 AM",
    searchWidget: { label: "Searching: Multi-modal LLM Researchers" },
  },
  {
    id: 3,
    role: "user",
    text: "Great. Once you have the list, pull their LinkedIn profile URLs and draft a personalized outreach message for a technical collaboration request.",
    time: "10:45 AM",
  },
  {
    id: 4,
    role: "agent",
    text: "Task updated: Sequence [Research \u2192 Extraction \u2192 Drafting] initiated.",
    time: "10:46 AM",
    highlight: "I've identified the first 5 researchers. You can see the live data stream in the right panel.",
  },
];

export default function AgentChatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const agent = AGENTS[slug] || { name: "Research Strategist", icon: "travel_explore", color: "#3b82f6" };
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <section className="flex-1 flex flex-col bg-white relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/agents/${slug}`}
              className="text-[#717785] hover:text-[#1b1b1b] transition-colors mr-1"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: agent.color }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {agent.icon}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-[#1b1b1b]">{agent.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#006c05] animate-pulse" />
                <span className="text-xs text-[#717785] font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-[#717785] hover:text-[#006c05] transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button className="p-2 text-[#717785] hover:text-[#006c05] transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {MESSAGES.map((msg) =>
            msg.role === "user" ? (
              <UserMessage key={msg.id} msg={msg} />
            ) : (
              <AgentMessage key={msg.id} msg={msg} agent={agent} />
            )
          )}
        </div>

        {/* Message Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex items-end gap-3 bg-[#f3f3f3] border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#006c05]/20 focus-within:border-[#006c05] transition-all">
            <button className="p-2 text-[#717785] hover:text-[#006c05] transition-colors rounded-xl">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2 px-2 resize-none placeholder:text-[#717785]/60 min-h-[40px]"
              placeholder="Type a message or command..."
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="bg-[#006c05] text-white p-2.5 rounded-xl shadow-lg shadow-[#006c05]/20 hover:scale-105 active:scale-95 transition-all">
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-[#717785] uppercase tracking-widest font-bold">
            {agent.name} (Active)
          </p>
        </div>
      </section>
    </div>
  );
}

function UserMessage({ msg }: { msg: Message }) {
  return (
    <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto">
      <div className="bg-[#006c05] text-white px-4 py-3 rounded-xl rounded-tr-none text-sm leading-relaxed shadow-sm">
        {msg.text}
      </div>
      <span className="text-[10px] text-[#717785] font-medium">{msg.time}</span>
    </div>
  );
}

function AgentMessage({
  msg,
  agent,
}: {
  msg: Message;
  agent: { name: string; icon: string; color: string };
}) {
  return (
    <div className="flex gap-4 max-w-[90%]">
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white"
        style={{ backgroundColor: agent.color }}
      >
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {agent.icon}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-[#f9f9f9] border border-gray-100 p-4 rounded-xl rounded-tl-none shadow-sm space-y-4">
          {msg.highlight && (
            <p className="text-sm leading-relaxed font-medium text-[#006c05]">
              {msg.text}
            </p>
          )}
          {!msg.highlight && (
            <p className="text-sm text-[#414753] leading-relaxed">{msg.text}</p>
          )}
          {msg.searchWidget && (
            <>
              <div className="bg-white p-3 rounded-lg border border-[#c1c6d5]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#006c05]">
                    data_exploration
                  </span>
                  <span className="text-xs font-semibold text-[#1b1b1b]">
                    {msg.searchWidget.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-[#006c05] rounded-full" />
                  <span className="w-1 h-1 bg-[#006c05]/40 rounded-full" />
                  <span className="w-1 h-1 bg-[#006c05]/20 rounded-full" />
                </div>
              </div>
              <p className="text-sm text-[#414753] leading-relaxed">
                I found 14 potential candidates. Refining the list based on your
                6-month publication recency requirement.
              </p>
            </>
          )}
          {msg.highlight && (
            <p className="text-sm text-[#414753]">{msg.highlight}</p>
          )}
        </div>
        <span className="text-[10px] text-[#717785] font-medium">{msg.time}</span>
      </div>
    </div>
  );
}
