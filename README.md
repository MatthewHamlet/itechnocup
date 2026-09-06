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
