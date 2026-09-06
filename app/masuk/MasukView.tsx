"use client";

import { useActionState, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeSlash, EnvelopeSimple } from "@phosphor-icons/react";
import { signInWithGoogle, submitAuth, type AuthState } from "./actions";

function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.6-3.9-12.3-9.1H4.4v5.7C8 41.5 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.7 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-2.9.7-4.3v-5.7H4.4A22 22 0 0 0 2 24c0 3.6.9 6.9 2.4 9.9l7.3-5.6z" />
      <path fill="#EA4335" d="M24 10.6c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4 29.9 2 24 2 15.4 2 8 6.5 4.4 13.1l7.3 5.7c1.7-5.2 6.6-9.1 12.3-9.1z" />
    </svg>
  );
}

export default function MasukView({
  next = "/app",
  initialError = null,
}: {
  next?: string;
  initialError?: string | null;
}) {
  const uid = useId();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [visible, setVisible] = useState(false);

  const [authState, authAction, authPending] = useActionState<AuthState, FormData>(
    submitAuth,
    { error: initialError },
  );
  const [googleState, googleAction, googlePending] = useActionState<AuthState, FormData>(
    signInWithGoogle,
    { error: null },
  );

  const daftar = mode === "daftar";
  const busy = authPending || googlePending;
  const error = googleState.error ?? authState.error;
  const checkEmail = authState.checkEmail === true;

  const field =
    "mt-2 h-13 w-full rounded-full bg-farad-paper px-5 text-[15px] text-farad-ink outline-none transition placeholder:text-farad-muted/70 focus-visible:ring-2 focus-visible:ring-farad-forest/45";

  return (
    <main className="grid min-h-dvh grid-cols-1 bg-white lg:grid-cols-2">
      <section className="relative isolate h-56 overflow-hidden sm:h-72 lg:h-auto">
        <Image
          src="/kitchen.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-farad-ink/85 via-farad-ink/25 to-farad-ink/10" />

        <Link
          href="/"
          className="farad-press absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur-md transition hover:bg-white/25 sm:left-8 sm:top-8"
        >
          <ArrowLeft size={15} weight="bold" aria-hidden />
          Kembali
        </Link>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12">
          <p className="text-[26px] font-extrabold leading-tight tracking-tight text-white sm:text-[32px] lg:text-[38px]">
            Rumah Nyala, Listrik Aman
          </p>
          <p className="mt-2 max-w-md text-[14px] leading-6 text-white/85 sm:text-[15px]">
            Atur giliran alat rumahmu, tanpa takut listrik jeglek.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:py-16">
        <div className="w-full max-w-[380px]">
          <header className="text-center">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-farad-ink sm:text-[32px]">
              {daftar ? "Daftar ke Farad" : "Masuk ke Farad"}
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-farad-muted">
              {daftar
                ? "Simpan profil listrik rumah dan rencana harianmu."
                : "Rencana listrik rumahmu, tersimpan rapi."}
            </p>
          </header>

          {error && (
            <p
              role="alert"
              className="mt-7 rounded-2xl border border-farad-clay/30 bg-farad-claysoft/70 px-4 py-3 text-[13.5px] font-medium leading-5 text-farad-clay"
            >
              {error}
            </p>
          )}

          {checkEmail && (
            <p
              role="status"
              className="mt-7 flex items-start gap-2.5 rounded-2xl border border-farad-border bg-farad-sage/50 px-4 py-3 text-[13.5px] font-medium leading-5 text-farad-forest"
            >
              <EnvelopeSimple size={17} className="mt-0.5 shrink-0" aria-hidden />
              Akunmu dibuat. Cek email untuk mengonfirmasi, lalu masuk lagi ya.
            </p>
          )}

          <form action={googleAction}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              disabled={busy}
              className="farad-press mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-full border border-farad-border bg-white text-[15px] font-semibold text-farad-ink transition hover:bg-farad-paper focus-visible:ring-2 focus-visible:ring-farad-forest/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark />
              {googlePending
                ? "Menghubungkan…"
                : daftar
                  ? "Daftar dengan Google"
                  : "Masuk dengan Google"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-farad-border" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-farad-muted">
              atau
            </span>
            <span className="h-px flex-1 bg-farad-border" />
          </div>

          <form action={authAction}>
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="mode" value={mode} />

            {daftar && (
              <div className="mb-5">
                <label htmlFor={`${uid}-nama`} className="text-[13px] font-bold text-farad-ink">
                  Nama
                </label>
                <input
                  id={`${uid}-nama`}
                  name="nama"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={busy}
                  placeholder="Nama panggilanmu"
                  className={field}
                />
              </div>
            )}

            <div>
              <label htmlFor={`${uid}-email`} className="text-[13px] font-bold text-farad-ink">
                Email
              </label>
              <input
                id={`${uid}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                disabled={busy}
                placeholder="contoh@gmail.com"
                className={field}
              />
            </div>

            <div className="mt-5">
              <label htmlFor={`${uid}-sandi`} className="text-[13px] font-bold text-farad-ink">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id={`${uid}-sandi`}
                  name="sandi"
                  type={visible ? "text" : "password"}
                  autoComplete={daftar ? "new-password" : "current-password"}
                  required
                  disabled={busy}
                  minLength={6}
                  placeholder="Masukkan kata sandi"
                  className={`${field} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  aria-pressed={visible}
                  aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute inset-y-0 right-0 mt-2 grid w-13 place-items-center rounded-r-full text-farad-muted transition hover:text-farad-ink focus-visible:ring-2 focus-visible:ring-farad-forest/45"
                >
                  {visible ? <EyeSlash size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="farad-press mt-8 h-13 w-full rounded-full bg-farad-forest text-[15px] font-bold text-white transition hover:bg-farad-ink focus-visible:ring-2 focus-visible:ring-farad-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authPending ? "Sebentar…" : daftar ? "Daftar" : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-farad-muted">
            {daftar ? "Sudah punya akun? " : "Belum punya akun? "}
            <button
              type="button"
              onClick={() => setMode(daftar ? "masuk" : "daftar")}
              disabled={busy}
              className="rounded font-bold text-farad-primary underline-offset-2 transition hover:underline focus-visible:ring-2 focus-visible:ring-farad-forest/45"
            >
              {daftar ? "Masuk" : "Daftar"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
