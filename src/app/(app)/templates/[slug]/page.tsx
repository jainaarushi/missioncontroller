"use client";

import { useState } from "react";

export default function TemplateConfigPage() {
  const [batchSize, setBatchSize] = useState(25);

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="flex items-center gap-4 px-8 pt-8 pb-4">
        <span className="material-symbols-outlined text-gray-400 cursor-pointer">
          arrow_back
        </span>
        <h1 className="text-xl font-bold text-black">
          Configure LinkedIn Outreach Pipeline
        </h1>
      </div>

      <div className="px-8 pb-8 max-w-6xl mx-auto space-y-8">
        {/* Pipeline Overview Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#414753]">
              Pipeline Overview
            </h2>
            <span className="text-xs text-[#3028e9] font-semibold bg-[#e1dfff] px-2 py-1 rounded">
              3 Nodes Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4">
            {/* Agent 1 - Research Specialist */}
            <div className="col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#008808] text-[#f8fff0] rounded-lg flex items-center justify-center mb-3">
                <span className="material-symbols-outlined">travel_explore</span>
              </div>
              <h3 className="font-bold text-sm">Research Specialist</h3>
              <p className="text-xs text-[#414753] mt-1">
                Scrapes profiles &amp; company data
              </p>
            </div>
            {/* Connector */}
            <div className="col-span-1 flex justify-center">
              <span className="material-symbols-outlined text-[#c1c6d5]">
                trending_flat
              </span>
            </div>
            {/* Agent 2 - Copywriter Agent */}
            <div className="col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#4d4bff] text-[#e8e6ff] rounded-lg flex items-center justify-center mb-3">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <h3 className="font-bold text-sm">Copywriter Agent</h3>
              <p className="text-xs text-[#414753] mt-1">
                Drafts personalized messages
              </p>
            </div>
            {/* Connector */}
            <div className="col-span-1 flex justify-center">
              <span className="material-symbols-outlined text-[#c1c6d5]">
                trending_flat
              </span>
            </div>
            {/* Tool 1 - LinkedIn Integration */}
            <div className="col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                <img alt="LinkedIn" className="w-12 h-12" src="https://img.logo.dev/linkedin.com?token=pk_L7siVlltSTuo-xbA1lvUKA" />
              </div>
              <h3 className="font-bold text-sm">LinkedIn Integration</h3>
              <p className="text-xs text-[#414753] mt-1">
                Automates connection requests
              </p>
            </div>
          </div>
        </section>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Required Inputs Form */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#006c05]">
                  tune
                </span>
                <h2 className="text-lg font-bold">Required Inputs</h2>
              </div>
              <div className="space-y-4">
                {/* Target Profile URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1b1b1b]">
                    Target Profile URL
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
                    placeholder="https://linkedin.com/in/username"
                    type="text"
                  />
                  <p className="text-xs text-[#414753]">
                    Paste a direct profile or a LinkedIn search result URL.
                  </p>
                </div>
                {/* Outreach Objective */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#1b1b1b]">
                    Outreach Objective
                  </label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
                    placeholder="e.g. Schedule a demo for our new AI tool, or network with CTOs in Fintech..."
                    rows={4}
                  />
                </div>
                {/* Batch Size Slider */}
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-[#1b1b1b]">
                      Batch Size
                    </label>
                    <span className="text-[#006c05] font-bold text-sm">
                      {batchSize} Profiles / day
                    </span>
                  </div>
                  <input
                    className="w-full h-2 bg-[#e8e8e8] rounded-lg appearance-none cursor-pointer accent-[#006c05]"
                    max={100}
                    min={1}
                    type="range"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-[#414753] uppercase font-bold">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tool Connections */}
          <section className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#3028e9]">
                  hub
                </span>
                <h2 className="text-lg font-bold">Tool Connections</h2>
              </div>
              <div className="space-y-4">
                {/* LinkedIn (Disconnected) */}
                <div className="p-4 rounded-lg bg-[#f3f3f3] border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center overflow-hidden">
                        <img alt="LinkedIn" className="w-10 h-10" src="https://img.logo.dev/linkedin.com?token=pk_L7siVlltSTuo-xbA1lvUKA" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">LinkedIn</p>
                        <p className="text-[10px] text-[#ba1a1a] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            error
                          </span>
                          Disconnected
                        </p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-[#1b1b1b] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    Connect Account
                  </button>
                </div>
                {/* Google Search (Connected) */}
                <div className="p-4 rounded-lg bg-[#f3f3f3] border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                        <img
                          alt="Google"
                          className="w-6 h-6"
                          src="https://img.logo.dev/google.com?token=pk_L7siVlltSTuo-xbA1lvUKA"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Google Search</p>
                        <p className="text-[10px] text-[#006c05] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            check_circle
                          </span>
                          Connected
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#414753] cursor-pointer hover:text-[#1b1b1b]">
                      settings
                    </span>
                  </div>
                </div>
              </div>
              {/* Composio footer */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[#414753]">
                  <img
                    alt="Composio"
                    className="w-5 h-5 rounded shadow-sm"
                    src="https://img.logo.dev/composio.dev?token=pk_L7siVlltSTuo-xbA1lvUKA"
                  />
                  <p className="text-[11px] font-medium">
                    Powered by Composio Secure Auth
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Launch Button Wrapper */}
        <div className="pt-8 flex flex-col items-center gap-4">
          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-[#ffdad6]/30 p-4 rounded-xl border border-[#ba1a1a]/10 max-w-2xl">
            <span className="material-symbols-outlined text-[#ba1a1a]">
              warning
            </span>
            <p className="text-xs text-[#93000a] leading-relaxed">
              <strong>Required Action:</strong> You must connect your LinkedIn
              account via Composio before this pipeline can be launched. This
              ensures the Outreach Agent can perform actions on your behalf.
            </p>
          </div>
          {/* Disabled Launch Pipeline button */}
          <button
            className="w-full max-w-md py-4 bg-gray-300 text-gray-500 font-black rounded-xl cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            disabled
          >
            Launch Pipeline
            <span className="material-symbols-outlined">rocket_launch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
