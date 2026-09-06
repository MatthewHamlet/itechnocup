"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ActivityRow } from "@/lib/data/types";

const AVATAR_MEDIA = ["image/jpeg", "image/png", "image/webp"];

async function markOnboarded(id: string) {
  const supabase = await createClient();
  const stamp = new Date().toISOString();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id,onboarded_at")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const metaName = String(user?.user_metadata?.full_name ?? "").trim();
    const { error } = await supabase
      .from("profiles")
      .insert({ id, display_name: metaName || "Teman Farad", onboarded_at: stamp });
    return !error;
  }

  if (existing.onboarded_at) return true;

  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: stamp })
    .eq("id", id);
  return !error;
}

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

  await markOnboarded(id);

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

  if (!(await markOnboarded(id))) return false;

  revalidatePath("/app", "layout");
  return true;
}

export async function saveProfileAction(input: {
  name: string;
  avatar?: { base64: string; mediaType: string } | null;
}): Promise<{ ok: boolean; error?: string; avatarUrl?: string }> {
  const id = await userId();
  if (!id) return { ok: false, error: "Masuk dulu untuk menyimpan profil." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Nama tidak boleh kosong." };
  if (name.length > 40) return { ok: false, error: "Nama maksimal 40 karakter." };

  const supabase = await createClient();
  let avatarUrl: string | undefined;

  if (input.avatar) {
    if (!AVATAR_MEDIA.includes(input.avatar.mediaType)) {
      return { ok: false, error: "Format fotonya belum didukung. Pakai JPG, PNG, atau WebP." };
    }

    const bytes = Buffer.from(input.avatar.base64, "base64");
    if (bytes.byteLength > 2_000_000) {
      return { ok: false, error: "Fotonya terlalu besar. Pilih foto yang lebih kecil." };
    }

    const path = `${id}/avatar`;
    const upload = await supabase.storage
      .from("avatars")
      .upload(path, bytes, { contentType: input.avatar.mediaType, upsert: true });

    if (upload.error) {
      return { ok: false, error: "Foto profil gagal diunggah. Coba lagi sebentar lagi." };
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id,
      display_name: name,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    },
    { onConflict: "id", ignoreDuplicates: false },
  );

  if (error) return { ok: false, error: "Profil belum tersimpan. Coba lagi sebentar lagi." };

  revalidatePath("/app", "layout");
  return { ok: true, avatarUrl };
}
