import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ACTIVITY_COLUMNS, type ActivityRow, type HouseholdRow, type ProfileRow } from "./types";

export const DEFAULT_HOUSEHOLD: HouseholdRow = {
  installed_va: 1300,
  base_load_va: 308,
  reserve_fraction: 0.15,
};

export type AppData = {
  userId: string | null;
  profile: ProfileRow | null;
  household: HouseholdRow;
  activities: ActivityRow[];
};

export const getAppData = cache(async (planDate: string): Promise<AppData> => {
  const empty: AppData = {
    userId: null,
    profile: null,
    household: DEFAULT_HOUSEHOLD,
    activities: [],
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return empty;

  const [profile, household, activities] = await Promise.all([
    supabase.from("profiles").select("display_name,onboarded_at").eq("id", user.id).maybeSingle(),
    supabase
      .from("households")
      .select("installed_va,base_load_va,reserve_fraction")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("activities")
      .select(ACTIVITY_COLUMNS)
      .eq("user_id", user.id)
      .eq("plan_date", planDate)
      .order("start_min", { ascending: true }),
  ]);

  return {
    userId: user.id,
    profile: (profile.data as ProfileRow | null) ?? null,
    household: (household.data as HouseholdRow | null) ?? DEFAULT_HOUSEHOLD,
    activities: (activities.data as ActivityRow[] | null) ?? [],
  };
});
