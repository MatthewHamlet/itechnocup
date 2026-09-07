import type { Metadata } from "next";
import SettingsView from "../components/SettingsView";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function Page() {
  const user = isSupabaseConfigured() ? await getUser() : null;
  return <SettingsView email={user?.email ?? null} />;
}
