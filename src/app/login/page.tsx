"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      // Demo mode — skip auth
      window.location.href = "/today";
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isForgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the reset link.");
      }
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        // Email confirmation is off — user is signed in immediately
        window.location.href = "/today";
      } else {
        // Email confirmation is on — tell user to check email
        setMessage("Check your email for the confirmation link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/today";
      }
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    if (!supabase) {
      window.location.href = "/today";
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/today`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink mb-2">
            AgentStudio
          </h1>
          <p className="text-ink-secondary text-sm">
            Your daily workspace with AI teammates
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 20px rgba(0, 0, 0, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/60"
              />
            </div>
            {!isForgot && (
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/60"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {message && (
              <p className="text-sm text-emerald-600">{message}</p>
            )}

            <Button
              type="submit"
              className="w-full text-white"
              style={{
                background: "linear-gradient(135deg, #d4a020, #c48d15)",
              }}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : isForgot
                  ? "Send Reset Link"
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
            </Button>
          </form>

          {!isSignUp && !isForgot && (
            <p className="text-center text-xs text-ink-tertiary mt-3">
              <button
                type="button"
                onClick={() => { setIsForgot(true); setError(null); setMessage(null); }}
                className="hover:underline"
                style={{ color: "#999" }}
              >
                Forgot password?
              </button>
            </p>
          )}

          <p className="text-center text-sm text-ink-secondary mt-3">
            {isForgot ? (
              <button
                type="button"
                onClick={() => { setIsForgot(false); setError(null); setMessage(null); }}
                className="font-medium"
                style={{ color: "#b8860b" }}
              >
                Back to sign in
              </button>
            ) : (
              <>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                  className="font-medium"
                  style={{ color: "#b8860b" }}
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
