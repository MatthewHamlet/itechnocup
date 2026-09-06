"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  NOT_CONFIGURED_MESSAGE,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export type AuthState = { error: string | null; checkEmail?: boolean };

function readableError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed")) return "Email kamu belum dikonfirmasi. Cek kotak masuk dulu ya.";
  if (m.includes("user already registered")) return "Email ini sudah terdaftar. Coba masuk saja.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  if (m.includes("provider is not enabled"))
    return "Login Google belum diaktifkan di proyek Supabase kamu.";
  return "Gagal memproses. Coba lagi sebentar lagi.";
}

function safePath(value: FormDataEntryValue | null): string {
  const next = String(value ?? "/app");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("sandi") ?? "");
  const next = safePath(formData.get("next"));

  if (!email || !password) return { error: "Email dan kata sandi harus diisi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: readableError(error.message) };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };

  const name = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("sandi") ?? "");
  const next = safePath(formData.get("next"));

  if (!name) return { error: "Nama harus diisi." };
  if (!email || !password) return { error: "Email dan kata sandi harus diisi." };
  if (password.length < 6) return { error: "Kata sandi minimal 6 karakter." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { error: readableError(error.message) };

  if (!data.session) {
    return { error: null, checkEmail: true };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

/* Supabase tetap mengembalikan URL authorize walau providernya mati, jadi tanpa
   pengecekan ini pengguna mendarat di halaman JSON error milik Supabase. */
async function googleEnabled(): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: "no-store",
    });
    if (!response.ok) return true;
    const settings = (await response.json()) as { external?: Record<string, boolean> };
    return settings.external?.google === true;
  } catch {
    return true;
  }
}

export async function signInWithGoogle(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED_MESSAGE };

  if (!(await googleEnabled())) {
    return {
      error:
        "Login Google belum diaktifkan di proyek Supabase kamu. Nyalakan di Authentication → Providers → Google.",
    };
  }

  const next = safePath(formData.get("next"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { error: readableError(error.message) };
  if (!data.url) return { error: "Google tidak mengembalikan alamat login." };

  redirect(data.url);
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/masuk");
}

export async function submitAuth(prev: AuthState, formData: FormData): Promise<AuthState> {
  return String(formData.get("mode") ?? "masuk") === "daftar"
    ? signUp(prev, formData)
    : signIn(prev, formData);
}
