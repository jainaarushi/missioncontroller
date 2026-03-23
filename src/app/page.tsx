import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  if (!supabase) {
    // Demo mode — go straight to app
    redirect("/today");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/today");
  } else {
    redirect("/login");
  }
}
