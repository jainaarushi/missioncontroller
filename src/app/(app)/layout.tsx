"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/today", icon: "dashboard", label: "Dashboard" },
  { href: "/agents", icon: "group", label: "Specialists" },
  { href: "/tasks", icon: "task_alt", label: "Tasks" },
  { href: "/templates", icon: "apps", label: "Templates" },
  { href: "/analytics", icon: "analytics", label: "Analytics" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

const BOTTOM_ITEMS = [
  { href: "https://agentstudio.world", icon: "help", label: "Help" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitial, setUserInitial] = useState("U");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setUserEmail("demo@agentstudio.world");
      setUserInitial("D");
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
        setUserInitial(user.email[0].toUpperCase());
      } else {
        setUserEmail(null);
        setUserInitial("D");
      }
    });
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/agents?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1b1b]">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 flex items-center justify-between px-6 h-16 font-['Inter'] antialiased">
        <div className="flex items-center gap-8">
          <Link href="/today" className="text-xl font-bold text-black">Agent Studio</Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/today" className="text-gray-600 hover:text-black transition-colors">
              Workspaces
            </Link>
            <Link href="/templates" className="text-gray-600 hover:text-black transition-colors">
              Models
            </Link>
            <Link href="/tasks" className="text-gray-600 hover:text-black transition-colors">
              Tasks
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#717785] text-sm">
              search
            </span>
            <input
              className="pl-10 pr-4 py-1.5 bg-[#f3f3f3] border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#006c05] outline-none"
              placeholder="Search agents..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <button
            onClick={() => router.push("/tasks")}
            className="p-2 text-[#717785] hover:bg-gray-100 transition-colors cursor-pointer rounded-full"
            title="View tasks"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Link href="/settings" className="p-2 text-[#717785] hover:bg-gray-100 transition-colors cursor-pointer rounded-full">
            <span className="material-symbols-outlined">settings</span>
          </Link>
          <div className="w-8 h-8 rounded-full bg-[#4d4bff] flex items-center justify-center text-white text-xs font-bold" title={userEmail || "User"}>
            {userInitial}
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 flex flex-col p-4 space-y-2 font-['Inter'] text-sm font-medium z-40">
          <div className="mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#006c05] rounded-lg flex items-center justify-center text-white">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  smart_toy
                </span>
              </div>
              <div>
                <h2 className="text-lg font-black text-black leading-tight">Orchestrator</h2>
                <p className="text-[10px] text-[#717785] uppercase tracking-wider">v2.1.0</p>
              </div>
            </div>
          </div>

          <Link
            href="/agents"
            className="w-full bg-[#006c05] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 mb-4 hover:opacity-90 transition-opacity font-semibold"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Agent
          </Link>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-50 text-green-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:translate-x-1"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-gray-100 space-y-1">
            {/* User info */}
            {userEmail && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-[#4d4bff] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {userInitial}
                </div>
                <span className="text-xs text-[#414753] truncate">{userEmail}</span>
              </div>
            )}
            {BOTTOM_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </a>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 w-full text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
