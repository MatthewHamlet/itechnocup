import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type SessionProfile = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  initial: string;
};

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email ?? "";
  const fullName =
    (profile?.display_name as string | undefined)?.trim() ||
    String(user.user_metadata?.full_name ?? "").trim() ||
    email.split("@")[0] ||
    "Teman Farad";

  return {
    id: user.id,
    email,
    fullName,
    avatarUrl: (profile?.avatar_url as string | null | undefined) ?? null,
    initial: fullName.charAt(0).toUpperCase(),
  };
});
