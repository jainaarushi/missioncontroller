"use client";

const LOGO_TOKEN = "pk_L7siVlltSTuo-xbA1lvUKA";

const AI_PROVIDERS = [
  {
    name: "OpenAI",
    model: "GPT-4o Mini",
    placeholder: "sk-...",
    logo: `https://img.logo.dev/openai.com?token=${LOGO_TOKEN}`,
    bgFallback: "bg-black",
  },
  {
    name: "Google Gemini",
    model: "Free Tier",
    placeholder: "AIzaSy...",
    logo: `https://img.logo.dev/deepmind.google?token=${LOGO_TOKEN}`,
    bgFallback: "bg-blue-500",
  },
];

const TOOL_KEYS = [
  {
    name: "Tavily",
    icon: "travel_explore",
    iconColor: "text-blue-500",
    description: "Professional web search for agents.",
    placeholder: "tvly-...",
  },
  {
    name: "Firecrawl",
    icon: "webhook",
    iconColor: "text-orange-500",
    description: "High-speed web scraping & crawling.",
    placeholder: "fc-...",
  },
  {
    name: "SerpAPI",
    icon: "search_insights",
    iconColor: "text-purple-500",
    description: "Google Search results API access.",
    placeholder: "serp-...",
  },
];

const INTEGRATION_ICONS = [
  "terminal", "database", "forum", "mail",
  "calendar_month", "cloud", "code", "analytics",
  "storage", "dataset", "api", "share",
  "folder_shared", "shield", "layers", "integration_instructions",
];

const CONNECTED_APPS = [
  {
    name: "LinkedIn",
    runs: "0 / 50 runs",
    logo: `https://img.logo.dev/linkedin.com?token=${LOGO_TOKEN}`,
    connected: false,
  },
  {
    name: "Gmail",
    runs: "12 / 50 runs",
    logo: `https://img.logo.dev/gmail.com?token=${LOGO_TOKEN}`,
    connected: true,
  },
  {
    name: "GitHub",
    runs: "0 / 50 runs",
    logo: `https://img.logo.dev/github.com?token=${LOGO_TOKEN}`,
    connected: false,
  },
];

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 bg-[#f9f9f9] min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Status */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e8e8e8] pb-6">
          <div>
            <h1 className="text-3xl font-black text-[#1b1b1b] tracking-tight">
              Studio Settings
            </h1>
            <p className="text-[#414753] mt-1">
              Configure your orchestration environment and AI credentials.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#f3f3f3] px-4 py-2 rounded-xl border border-[#c1c6d5]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#006c05]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#414753]">
                DB: Connected
              </span>
            </div>
            <div className="w-px h-4 bg-[#c1c6d5]" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#414753]">
                AI: No Key
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI Providers */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c05]">
                    psychology
                  </span>
                  AI Providers
                </h2>
                <span className="text-[10px] px-2 py-1 bg-[#4d4bff] text-white rounded font-bold uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    lock
                  </span>
                  AES-256 Encrypted
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_PROVIDERS.map((provider) => (
                  <div
                    key={provider.name}
                    className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                          <img
                            alt={provider.name}
                            className="w-8 h-8 object-contain"
                            src={provider.logo}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{provider.name}</h3>
                          <p className="text-[10px] text-[#414753]">
                            {provider.model}
                          </p>
                        </div>
                      </div>
                      <a
                        className="text-[#3028e9] text-[11px] font-semibold hover:underline"
                        href="#"
                      >
                        Get Key
                      </a>
                    </div>
                    <div className="space-y-3">
                      <input
                        className="w-full text-xs bg-[#f3f3f3] border border-[#c1c6d5] rounded-lg px-3 py-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                        placeholder={provider.placeholder}
                        type="password"
                      />
                      <button className="w-full bg-[#1b1b1b] text-white text-xs py-2 rounded-lg font-bold hover:bg-[#303030] transition-colors">
                        Save Provider
                      </button>
                    </div>
                  </div>
                ))}

                {/* Anthropic Claude - Full Width */}
                <div className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                        <img
                          alt="Anthropic"
                          className="w-8 h-8 object-contain"
                          src={`https://img.logo.dev/anthropic.com?token=${LOGO_TOKEN}`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Anthropic Claude</h3>
                        <p className="text-[10px] text-[#414753]">
                          Claude 3.5 Sonnet
                        </p>
                      </div>
                    </div>
                    <a
                      className="text-[#3028e9] text-[11px] font-semibold hover:underline"
                      href="#"
                    >
                      Get Key
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <input
                      className="flex-1 text-xs bg-[#f3f3f3] border border-[#c1c6d5] rounded-lg px-3 py-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                      placeholder="sk-ant-..."
                      type="password"
                    />
                    <button className="bg-[#1b1b1b] text-white px-6 text-xs py-2 rounded-lg font-bold hover:bg-[#303030] transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Tool API Keys */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c05]">
                  construction
                </span>
                Tool API Keys
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TOOL_KEYS.map((tool) => (
                  <div
                    key={tool.name}
                    className="bg-white p-4 rounded-xl border border-[#e8e8e8]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`material-symbols-outlined ${tool.iconColor}`}
                      >
                        {tool.icon}
                      </span>
                      <span className="font-bold text-sm">{tool.name}</span>
                    </div>
                    <p className="text-[10px] text-[#414753] mb-3">
                      {tool.description}
                    </p>
                    <input
                      className="w-full text-[10px] bg-[#f3f3f3] border border-[#c1c6d5] rounded-md px-3 py-1.5 mb-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                      placeholder={tool.placeholder}
                      type="password"
                    />
                    <button className="w-full text-[10px] py-1.5 font-bold border border-[#1b1b1b] rounded-md hover:bg-[#1b1b1b] hover:text-white transition-colors">
                      Save
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Marketplace Integrations */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006c05]">
                    hub
                  </span>
                  Marketplace Integrations
                </h2>
                <a
                  className="text-[#3028e9] text-xs font-bold hover:underline"
                  href="#"
                >
                  Show all 32 integrations
                </a>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {INTEGRATION_ICONS.map((icon) => (
                  <div
                    key={icon}
                    className="aspect-square bg-white rounded-lg border border-[#e8e8e8] flex items-center justify-center group cursor-pointer hover:border-[#006c05] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#414753] group-hover:text-[#006c05] transition-colors">
                      {icon}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* My AI Avatars */}
            <section className="bg-[#ece0d6] border border-[#c1c6d5] p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#201b15]">
                <span className="material-symbols-outlined">face</span>
                My AI Avatars
              </h2>
              <div className="aspect-video bg-white border-2 border-dashed border-[#717785] rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-[#f9f9f9] transition-colors">
                <span className="material-symbols-outlined text-4xl text-[#c1c6d5] mb-3 opacity-50">
                  auto_fix_high
                </span>
                <p className="text-sm font-black text-[#1b1b1b] uppercase tracking-widest opacity-40">
                  Coming Soon
                </p>
                <p className="text-[10px] text-[#414753] mt-1 font-medium">
                  Custom Ghibli-style avatars are in training.
                </p>
              </div>
              <div className="bg-[#e1dfff] text-[#3028e9] p-3 rounded-lg text-[10px] flex gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>
                  Requires <strong>Gemini API key</strong> for image generation
                  processing.
                </span>
              </div>
            </section>

            {/* Voice Input */}
            <section className="bg-white border border-[#e8e8e8] p-6 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c05]">
                  mic
                </span>
                <h2 className="text-lg font-bold">Voice Input</h2>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <img
                  alt="Wispr Flow"
                  className="w-6 h-6 rounded"
                  src={`https://img.logo.dev/wisprflow.ai?token=${LOGO_TOKEN}`}
                />
                <span className="font-bold text-sm">Wispr Flow</span>
              </div>
              <input
                className="w-full text-xs bg-[#f3f3f3] border border-[#c1c6d5] rounded-lg px-3 py-2 focus:ring-[#006c05] focus:border-[#006c05] outline-none"
                placeholder="Flow API Key"
                type="password"
              />
              <a
                className="block text-center text-xs text-[#3028e9] font-bold py-2 bg-[#e1dfff] rounded-lg hover:bg-[#c1c1ff] transition-colors"
                href="https://platform.wisprflow.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Wispr Key
              </a>
            </section>

            {/* Connected Apps */}
            <section className="bg-white border border-[#e8e8e8] p-6 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold">Connected Apps</h2>
              <div className="space-y-4">
                {CONNECTED_APPS.map((app) => (
                  <div
                    key={app.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                        <img
                          alt={app.name}
                          className="w-7 h-7 object-contain"
                          src={app.logo}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{app.name}</p>
                        <p className="text-[10px] text-[#414753]">
                          {app.runs}
                        </p>
                      </div>
                    </div>
                    {app.connected ? (
                      <button className="text-[10px] font-bold px-3 py-1 bg-[#006c05] text-white rounded-full">
                        Active
                      </button>
                    ) : (
                      <button className="text-[10px] font-bold px-3 py-1 border border-[#717785] rounded-full hover:bg-[#eeeeee] transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Sign Out */}
            <section className="p-6 border border-[#ffdad6] bg-[#ffdad6]/20 rounded-2xl flex flex-col items-center">
              <div className="w-12 h-12 bg-[#ba1a1a] rounded-full flex items-center justify-center text-white mb-3">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <h3 className="font-bold text-[#1b1b1b]">Account Access</h3>
              <p className="text-xs text-[#414753] text-center mt-1 mb-4">
                You are currently logged in as developer@agentos.io
              </p>
              <button className="w-full bg-[#ba1a1a] text-white py-2 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all">
                Sign Out
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
