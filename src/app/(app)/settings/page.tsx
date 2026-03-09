"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
          Settings
        </h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-card">
        <h2 className="text-sm font-medium text-ink mb-4">Account</h2>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Sign Out
        </Button>
      </div>
    </>
  );
}
