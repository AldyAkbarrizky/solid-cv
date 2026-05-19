# Arsitektur & Alur Data

## Stack utama

- Next.js 16 (App Router)
- React 19
- Drizzle ORM + PostgreSQL
- Better Auth (Google login)
- Groq API (via SDK `openai`)
- Duitku untuk pembayaran paket berbayar
- Tailwind CSS 4 + komponen UI lokal
- Neon serverless driver (`neon-serverless`) — mendukung transaksi DB

## Struktur direktori yang penting

- `src/app`:
  - halaman publik: `/`, `/privacy`, `/terms`, `/contact`
  - halaman review: `/review`, `/review/[id]`, `/history`
  - auth dan akun: `/login`
  - billing: `/pricing`, `/billing`, `/billing/return`
  - admin: `/admin`, `/admin/payments/[id]`
  - API route: `/api/cv/analyze`, `/api/review/[id]`, `/api/auth/[...all]`, `/api/billing/*`, `/api/admin/*`
- `src/lib/ai`: prompt, schema hasil AI, dan client AI
- `src/lib/billing`: plan, invoice Duitku, dan sinkronisasi status pembayaran
- `src/lib/billing/pricing-display.ts`: data tampilan paket untuk home dan pricing
- `src/lib/cv`: ekstraksi teks CV (`pdf-parse@1.x` + custom renderer) + masking PII
- `src/lib/security`: rate-limit + identity hashing
- `src/lib/quota`: logika kuota guest/user dan entitlement paket
- `src/lib/admin.ts`: pengecekan admin berdasarkan `ADMIN_EMAILS`
- `src/lib/config/env.ts`: validasi env production
- `src/lib/observability.ts`: wrapper `captureError`/`captureWarning` → console + Sentry (opsional)
- `src/instrumentation.ts`: Next.js hook untuk inisialisasi Sentry server-side
- `src/db`: koneksi Drizzle + schema tabel

## Alur end-to-end review CV

1. User upload CV dari `src/app/review/review-form.tsx`.
2. Request masuk ke `POST /api/cv/analyze`.
3. API melakukan:
   - rate limit check
   - kuota check (guest/user)
   - validasi input (`zod`)
   - validasi file (ekstensi + MIME + magic bytes)
4. File diekstrak ke teks:
   - PDF: `pdf-parse@1.x` dengan custom `renderPdfPage` untuk rekonstruksi spasi antar kata
   - DOCX: `mammoth`
5. Teks CV di-mask (`maskPII`) sebelum dikirim ke AI.
6. AI menghasilkan JSON review sesuai schema (`CVReviewResultSchema`).
7. Hasil disimpan ke `cv_reviews`.
8. Event kuota disimpan ke `review_usage_events`.
9. Frontend redirect ke `/review/{id}`.

## Alur akun, kuota, dan entitlement

- Guest mendapat kuota terbatas berdasarkan identity hash dari IP + user-agent.
- User login mendapat kuota free default (15 review / bulan).
- User yang membeli paket berbayar mendapat entitlement baru melalui `upsertUserEntitlement`.
- Status kuota dibaca di halaman `/review` melalui `getReviewQuotaStatus`.
- Status paket dan kuota juga ditampilkan di `/pricing`; route `/billing` hanya redirect ke `/pricing`.
- Halaman `/review` tetap bisa dibuka tanpa login (guest). Jika pengecekan session gagal, aplikasi fallback ke mode guest.

File utama:

- `src/lib/quota/review-quota.ts`
- `src/lib/quota/entitlements.ts`
- `src/db/schema.ts`
- `src/lib/security/request-identity.ts`

## Alur pembayaran singkat

1. User membuka `/pricing`.
2. User memilih plan dan memanggil `POST /api/billing/checkout`.
3. Sistem membuat row `payment_orders`.
4. Sistem membuat invoice ke Duitku.
5. User diarahkan ke `paymentUrl` dari Duitku.
6. Duitku memanggil `POST /api/billing/duitku/callback`.
7. Callback divalidasi dengan signature dan nominal.
8. Jika pembayaran valid, sistem sinkron ke Duitku dan mengaktifkan entitlement.
9. User kembali ke `/billing/return`.

Detail lengkap ada di [Billing & Admin](./billing-and-admin.md).

## Tabel data domain

Lihat detail di `src/db/schema.ts`.

- `cv_reviews`: hasil analisis CV
- `review_attempts`: jejak rate-limit per identity hash
- `user_entitlements`: plan + limit review bulanan user login
- `review_usage_events`: pemakaian kuota guest/user
- `payment_orders`: order pembayaran dan status Duitku
- `admin_audit_logs`: jejak aksi admin, misalnya cek status pembayaran

Tabel auth (`user`, `session`, `account`, dst) ada di `src/db/auth-schema.ts`.

## Catatan rendering hasil review

- Halaman hasil: `src/app/review/[id]/page.tsx`
- Review akan `notFound()` jika:
  - ID tidak ada
  - review sudah expired
  - review milik user lain (untuk review yang punya `userId`)

Perilaku saat ini:

- Review guest (`userId = null`) bisa dibuka lewat URL sampai masa retensi habis.

## Route non-review

- `/pricing`: daftar paket, tabel perbandingan, status paket, dan kuota akun.
- `/billing`: redirect ke `/pricing` agar link lama tetap aman.
- `/billing/return`: halaman setelah user kembali dari Duitku.
- `/admin`: dashboard admin lite.
- `/admin/payments/[id]`: detail order, entitlement, usage, review, dan audit log user terkait.
- `/privacy`, `/terms`, `/contact`: halaman legal dan kontak.
- `/robots.txt` dan `/sitemap.xml`: dibuat dari `src/app/robots.ts` dan `src/app/sitemap.ts`.

## Catatan UI dan layout

- Header global ada di `src/components/layout/site-header.tsx`.
- Header memakai posisi `fixed` dengan spacer `h-16`, supaya tetap di atas saat halaman discroll tanpa menutup konten pertama.
- Brand di header memakai wordmark ringkas `SolidCV` + label `Review`, bukan subtitle dua baris.
- Jika user login dengan Google dan field `user.image` berasal dari `lh3.googleusercontent.com`, header menampilkan avatar user sebagai tombol menu akun. Jika tidak ada image yang valid, fallback memakai inisial nama/email.
- Remote image Google diizinkan di `next.config.ts` melalui `images.remotePatterns`.
