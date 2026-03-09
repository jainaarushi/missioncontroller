"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  const supabase = createClient();

  // Listen for the PASSWORD_RECOVERY event from the URL token
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if already in a valid session (user clicked link and session exists)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/today";
      }, 2000);
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink mb-2">
            Reset Password
          </h1>
          <p className="text-ink-secondary text-sm">
            Enter your new password below
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(0, 0, 0, 0.04)",
            border: "1px solid #EBEBEB",
          }}
        >
          {success ? (
            <div className="text-center py-4">
              <p className="text-emerald-600 font-medium mb-2">Password updated successfully!</p>
              <p className="text-sm text-ink-secondary">Redirecting to your workspace...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <p className="text-sm text-ink-secondary">Verifying reset link...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/60"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full text-white"
                style={{
                  background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
