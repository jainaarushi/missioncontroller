"use client";

import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { P } from "@/lib/palette";

export default function SettingsPage() {
  const router = useRouter();
  const supabaseEnabled = isSupabaseEnabled();

  async function handleSignOut() {
    if (supabaseEnabled) {
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
    }
    router.push("/login");
  }

  return (
    <>
      <div style={{ marginBottom: 28, animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, color: P.text, margin: "0 0 6px",
          letterSpacing: "-0.04em",
        }}>
          Settings
        </h1>
      </div>

      {/* Mode indicator */}
      <div style={{
        padding: "18px 22px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow, marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
          Mode
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            backgroundColor: supabaseEnabled ? P.emerald : P.amber,
            boxShadow: `0 0 8px ${supabaseEnabled ? P.emerald : P.amber}40`,
          }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: P.text }}>
            {supabaseEnabled ? "Live" : "Demo"}
          </span>
          <span style={{ fontSize: 13, color: P.textTer }}>
            {supabaseEnabled
              ? "Connected to Supabase + Anthropic"
              : "Using in-memory mock data — add API keys to .env.local for live mode"
            }
          </span>
        </div>
      </div>

      {/* Account */}
      <div style={{
        padding: "18px 22px", backgroundColor: P.card, borderRadius: 16,
        border: `1.5px solid ${P.border}`, boxShadow: P.shadow,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.textSec, marginBottom: 12 }}>
          Account
        </div>
        <button
          onClick={handleSignOut}
          style={{
            padding: "9px 20px", borderRadius: 10,
            border: `1.5px solid #FECACA`,
            backgroundColor: "#FEF2F2", color: "#DC2626",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEE2E2"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
        >
          Sign Out
        </button>
      </div>
    </>
  );
}
