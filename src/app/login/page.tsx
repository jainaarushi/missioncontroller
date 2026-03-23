"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      router.push("/today");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) setError(error.message);
        else setMessage("Check your email for the reset link.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else if (data.session) {
          router.push("/today");
        } else {
          setMessage("Check your email for the confirmation link.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else router.push("/today");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    if (!supabase) {
      router.push("/today");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/today`,
      },
    });
    if (error) setError(error.message);
  }

  const switchMode = (newMode: "signin" | "signup" | "forgot") => {
    setMode(newMode);
    setError(null);
    setMessage(null);
  };

  // Demo mode — no Supabase configured
  if (!isSupabaseEnabled()) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div>
            <h1 className="text-3xl font-black text-[#1b1b1b] tracking-tight">Agent Studio</h1>
            <p className="text-sm text-[#717785] mt-1">Demo Mode</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <p className="text-sm text-[#414753]">
              Supabase is not configured. You&apos;re running in demo mode with full access.
            </p>
            <a
              href="/today"
              className="block w-full py-3 bg-[#006c05] text-white font-bold rounded-xl hover:bg-[#008808] transition-colors text-center"
            >
              Enter Demo
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="w-14 h-14 bg-[#006c05] rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#1b1b1b] tracking-tight">Agent Studio</h1>
          <p className="text-sm text-[#717785] mt-1">
            {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          {/* Google OAuth */}
          {mode !== "forgot" && (
            <>
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white border border-gray-200 rounded-xl font-semibold text-sm text-[#1b1b1b] hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-[#717785] font-medium">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#414753] block mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#f3f3f3] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#006c05] focus:border-transparent outline-none"
              />
            </div>
            {mode !== "forgot" && (
              <div>
                <label className="text-xs font-semibold text-[#414753] block mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-[#f3f3f3] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#006c05] focus:border-transparent outline-none"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-[#ba1a1a] bg-[#ffdad6]/30 px-3 py-2 rounded-lg">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 text-sm text-[#006c05] bg-green-50 px-3 py-2 rounded-lg">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#006c05] text-white font-bold rounded-xl hover:bg-[#008808] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : null}
              {loading
                ? "Please wait..."
                : mode === "forgot"
                ? "Send Reset Link"
                : mode === "signup"
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Forgot Password Link */}
          {mode === "signin" && (
            <p className="text-center">
              <button
                onClick={() => switchMode("forgot")}
                className="text-xs text-[#717785] hover:text-[#006c05] transition-colors"
              >
                Forgot password?
              </button>
            </p>
          )}
        </div>

        {/* Mode Switch */}
        <p className="text-center text-sm text-[#414753]">
          {mode === "forgot" ? (
            <button onClick={() => switchMode("signin")} className="font-semibold text-[#006c05] hover:underline">
              Back to sign in
            </button>
          ) : mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button onClick={() => switchMode("signin")} className="font-semibold text-[#006c05] hover:underline">
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button onClick={() => switchMode("signup")} className="font-semibold text-[#006c05] hover:underline">
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
