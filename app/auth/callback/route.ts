import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function readableError(code: string | null, raw: string | null): string {
  switch (code) {
    case "otp_expired":
      return "Tautannya sudah kedaluwarsa atau pernah dibuka. Minta kirim ulang ya.";
    case "access_denied":
      return "Akses ditolak. Coba ulangi dari awal.";
    case "provider_email_needs_verification":
      return "Email kamu belum diverifikasi.";
    default:
      return raw ? "Gagal menyelesaikan proses masuk. Coba lagi ya." : "Tautan tidak dikenali.";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const raw = searchParams.get("next") ?? "/app";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app";

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/masuk?error=${encodeURIComponent(reason)}`);

  if (!isSupabaseConfigured()) return fail("Supabase belum tersambung.");

  const errorCode = searchParams.get("error_code");
  if (searchParams.get("error") || errorCode) {
    return fail(readableError(errorCode, searchParams.get("error_description")));
  }

  const supabase = await createClient();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail(readableError(null, error.message));
    return NextResponse.redirect(`${origin}${next}`);
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail(readableError(null, error.message));
    return NextResponse.redirect(`${origin}${next}`);
  }

  return fail("Tautannya tidak membawa kode apa pun.");
}
