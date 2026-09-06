"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SUPPORTED_MEDIA, detectAppliance, type ScanResult, type SupportedMedia } from "@/lib/scan/detect";

const MAX_BASE64_LENGTH = 900_000;

function isSupportedMedia(value: string): value is SupportedMedia {
  return (SUPPORTED_MEDIA as readonly string[]).includes(value);
}

export async function scanApplianceAction(
  base64: string,
  mediaType: string,
): Promise<ScanResult> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Masuk dulu untuk memakai pembacaan foto." };
  }

  if (!isSupportedMedia(mediaType)) {
    return { ok: false, error: "Format fotonya belum didukung. Pakai JPG, PNG, atau WebP." };
  }

  if (!base64 || base64.length > MAX_BASE64_LENGTH) {
    return { ok: false, error: "Fotonya terlalu besar. Coba potret ulang lebih dekat." };
  }

  return detectAppliance(base64, mediaType);
}
