"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ActivityRow } from "@/lib/data/types";

async function userId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveHouseholdAction(input: {
  installedVA: number;
  baseLoadVA: number;
  reserveFraction: number;
}): Promise<boolean> {
  const id = await userId();
  if (!id) return false;

  const supabase = await createClient();
  const { error } = await supabase.from("households").upsert(
    {
      user_id: id,
      installed_va: input.installedVA,
      base_load_va: input.baseLoadVA,
      reserve_fraction: input.reserveFraction,
    },
    { onConflict: "user_id" },
  );

  if (error) return false;

  revalidatePath("/app", "layout");
  return true;
}

export async function addActivityAction(
  planDate: string,
  row: ActivityRow,
): Promise<boolean> {
  const id = await userId();
  if (!id) return false;

  const supabase = await createClient();
  const { error } = await supabase.from("activities").insert({
    ...row,
    user_id: id,
    plan_date: planDate,
  });

  if (error) return false;

  revalidatePath("/app", "layout");
  return true;
}

export async function moveActivityAction(
  activityId: string,
  startMin: number,
): Promise<boolean> {
  const id = await userId();
  if (!id) return false;

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update({ start_min: startMin })
    .eq("id", activityId)
    .eq("user_id", id);

  return !error;
}

export async function moveManyActivitiesAction(
  moves: { id: string; startMin: number }[],
): Promise<boolean> {
  const id = await userId();
  if (!id) return false;

  const supabase = await createClient();
  const results = await Promise.all(
    moves.map((move) =>
      supabase
        .from("activities")
        .update({ start_min: move.startMin })
        .eq("id", move.id)
        .eq("user_id", id),
    ),
  );

  return results.every((result) => !result.error);
}

export async function removeActivityAction(activityId: string): Promise<boolean> {
  const id = await userId();
  if (!id) return false;

  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId)
    .eq("user_id", id);

  if (error) return false;

  revalidatePath("/app", "layout");
  return true;
}

export async function finishOnboardingAction(): Promise<boolean> {
  const id = await userId();
  if (!id) return false;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return false;

  revalidatePath("/app", "layout");
  return true;
}
