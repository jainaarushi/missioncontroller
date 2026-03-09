"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
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

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/today`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
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
      style={{
        background: "linear-gradient(145deg, #fffbf0 0%, #fff2c9 40%, #ffe9a8 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink mb-2">
            Cadre
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
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "rgba(0, 0, 0, 0.08)" }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-ink-tertiary" style={{ background: "rgba(255, 255, 255, 0.7)" }}>or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            style={{
              background: "rgba(255, 255, 255, 0.5)",
              borderColor: "rgba(0, 0, 0, 0.08)",
            }}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>

          <p className="text-center text-sm text-ink-secondary mt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="font-medium"
              style={{ color: "#b8860b" }}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
