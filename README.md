# Farad

Aplikasi perencana giliran listrik rumah. Landing page ada di `/`, aplikasinya di `/app`, halaman masuk di `/masuk`.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Menyambungkan Supabase (autentikasi)

Tanpa langkah ini aplikasi tetap jalan: `/app` terbuka bebas dan tombol masuk memberi pesan bahwa Supabase belum tersambung.

1. Buat proyek di [supabase.com](https://supabase.com), lalu salin **Project URL** dan **anon public key** dari Settings → API.
2. Buat file `.env.local` di root (lihat `.env.local.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

3. Di Supabase → Authentication → URL Configuration:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: tambahkan `http://localhost:3000/**` (dan URL produksi bila sudah dideploy).
4. Tanpa SMTP, matikan konfirmasi email: Authentication → Sign In / Providers → **Email** → matikan **Confirm email**. Kalau ini menyala sementara SMTP belum diatur, akun baru tidak akan pernah bisa masuk karena emailnya tidak pernah terkirim.
5. Untuk tombol Google:
   - Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web application).
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Salin Client ID + Client Secret ke Supabase → Authentication → Providers → **Google**, lalu aktifkan.
6. Jalankan ulang `npm run dev`.

Setelah tersambung, `/app` hanya bisa dibuka setelah masuk; pengunjung yang belum masuk dialihkan ke `/masuk?next=...`. Tombol keluar ada di Pengaturan → Data di perangkat.

## Skema database

Jalankan berurutan di Supabase → SQL Editor (semuanya idempotent, aman diulang):

| File | Isi |
| --- | --- |
| `supabase/schema.sql` | Tabel `profiles`, `households`, `activities`, RLS, trigger pendaftaran |
| `supabase/002-onboarding.sql` | Kolom `profiles.onboarded_at` |
| `supabase/003-profile.sql` | Kolom `profiles.avatar_url` dan bucket Storage `avatars` beserta policy-nya |
| `supabase/004-komunitas.sql` | Tabel komunitas (grup, anggota, postingan, komentar, vote, follow, pesan grup), view `community_feed`, RLS, kolom `profiles.headline`/`verified`, bucket Storage `community`, policy baca profil antar-pengguna, dan realtime chat grup |

## Scan alat dari foto

Halaman Aktivitas → Tambah → **Foto** memakai Gemini untuk mengenali alat listrik di foto
dan membaca stiker dayanya. Ambil kunci gratis di [aistudio.google.com/apikey](https://aistudio.google.com/apikey),
lalu tambahkan di `.env.local`:

```
GEMINI_API_KEY=AIza...
```

Kuncinya khusus server, jangan diberi awalan `NEXT_PUBLIC_`. Fotonya dikecilkan di browser
(maksimal 1024px, JPEG) sebelum dikirim ke server action, lalu diteruskan ke Gemini.
Tanpa kunci ini, tombol fotonya tetap ada tapi memberi pesan bahwa scan belum aktif.

Modelnya dicoba berurutan `gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3.1-flash-lite`,
jadi kalau satu model kena batas kuota gratis, yang berikutnya dipakai. Kalau semuanya kena
batas, panelnya bilang kuota harian habis.

Di Vercel, tambahkan `GEMINI_API_KEY` sebagai environment variable juga.

## Deploy ke Vercel

1. Vercel → Project Settings → Environment Variables, isi untuk **Production**, **Preview**, dan **Development**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

2. Supabase → Authentication → URL Configuration:
   - **Site URL**: `https://<nama-proyek>.vercel.app`
   - **Redirect URLs**: `http://localhost:3000/**`, `https://<nama-proyek>.vercel.app/**`, dan
     `https://<nama-proyek>-*-<akun-vercel>.vercel.app/**` untuk deployment preview.
3. Google Cloud Console tidak perlu diubah. Authorized redirect URI-nya tetap satu,
   yaitu `https://<project-ref>.supabase.co/auth/v1/callback`, karena Google selalu
   kembali ke Supabase dulu, bukan ke domain aplikasi.

Jangan pakai `https://*.vercel.app/**` di daftar redirect: pola itu mengizinkan aplikasi
Vercel milik siapa pun menerima kode login pengguna.

### Peta file autentikasi

| File | Isi |
| --- | --- |
| `lib/supabase/config.ts` | Env var dan pengecekan `isSupabaseConfigured()` |
| `lib/supabase/server.ts` | Client Supabase untuk Server Component & Server Action |
| `lib/supabase/proxy.ts` | Penyegaran sesi berbasis cookie untuk `proxy.ts` |
| `proxy.ts` | Penjaga rute `/app/*` dan pengalihan `/masuk` bila sudah masuk |
| `app/masuk/actions.ts` | Server action: `signIn`, `signUp`, `signInWithGoogle`, `signOut` |
| `app/auth/callback/route.ts` | Menukar kode OAuth / tautan email jadi sesi |

## Tes

```bash
npm run test
npm run typecheck
```
