"use client";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-extrabold tracking-tight mb-2">Settings</h1>
      <p className="text-[#414753] mb-8">Manage your account, API keys, and integrations.</p>

      {/* API Keys Section */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006c05]">key</span>
          <h2 className="text-lg font-bold">API Keys</h2>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">OpenAI API Key</label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
              placeholder="sk-..."
              type="password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Anthropic API Key</label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
              placeholder="sk-ant-..."
              type="password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Google Gemini API Key</label>
            <input
              className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
              placeholder="AIza..."
              type="password"
            />
          </div>
        </div>
        <button className="mt-4 bg-[#006c05] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
          Save Keys
        </button>
      </section>

      {/* Integrations Section */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#3028e9]">hub</span>
          <h2 className="text-lg font-bold">Integrations</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#f3f3f3] border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0077b5] rounded-md flex items-center justify-center">
                <span className="material-symbols-outlined text-white">work</span>
              </div>
              <div>
                <p className="text-sm font-bold">LinkedIn</p>
                <p className="text-[10px] text-[#ba1a1a] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  Disconnected
                </p>
              </div>
            </div>
            <button className="py-2 px-4 bg-[#1b1b1b] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
              Connect
            </button>
          </div>
          <div className="p-4 rounded-lg bg-[#f3f3f3] border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-md flex items-center justify-center text-lg">
                G
              </div>
              <div>
                <p className="text-sm font-bold">Google Search</p>
                <p className="text-[10px] text-[#006c05] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">check_circle</span>
                  Connected
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#414753] cursor-pointer hover:text-[#1b1b1b]">
              settings
            </span>
          </div>
        </div>
      </section>

      {/* Voice Input Section */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#635b53]">mic</span>
          <h2 className="text-lg font-bold">Voice Input (Wispr Flow)</h2>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Wispr API Key</label>
          <input
            className="w-full px-4 py-2 rounded-lg border border-[#c1c6d5] focus:ring-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none text-sm"
            placeholder="wispr_..."
            type="password"
          />
        </div>
        <button className="mt-4 bg-[#006c05] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
          Save
        </button>
      </section>
    </div>
  );
}
