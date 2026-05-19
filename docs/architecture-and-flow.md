# Arsitektur & Alur Data

## Stack utama

- Next.js 16 (App Router)
- React 19
- Drizzle ORM + PostgreSQL
- Better Auth (Google login)
- Groq API (via SDK `openai`)

## Struktur direktori yang penting

- `src/app`:
  - halaman UI (`/`, `/review`, `/review/[id]`, `/history`, `/login`)
  - API route (`/api/cv/analyze`, `/api/review/[id]`, `/api/auth/[...all]`)
- `src/lib/ai`: prompt, schema hasil AI, dan client AI
- `src/lib/cv`: ekstraksi teks CV + masking PII
- `src/lib/security`: rate-limit + identity hashing
- `src/lib/quota`: logika kuota guest/user
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
   - PDF: `pdf-parse`
   - DOCX: `mammoth`
5. Teks CV di-mask (`maskPII`) sebelum dikirim ke AI.
6. AI menghasilkan JSON review sesuai schema (`CVReviewResultSchema`).
7. Hasil disimpan ke `cv_reviews`.
8. Event kuota disimpan ke `review_usage_events`.
9. Frontend redirect ke `/review/{id}`.

## Tabel data domain

Lihat detail di `src/db/schema.ts`.

- `cv_reviews`: hasil analisis CV
- `review_attempts`: jejak rate-limit per identity hash
- `user_entitlements`: plan + limit review bulanan user login
- `review_usage_events`: pemakaian kuota guest/user

Tabel auth (`user`, `session`, `account`, dst) ada di `src/db/auth-schema.ts`.

## Catatan rendering hasil review

- Halaman hasil: `src/app/review/[id]/page.tsx`
- Review akan `notFound()` jika:
  - ID tidak ada
  - review sudah expired
  - review milik user lain (untuk review yang punya `userId`)

Perilaku saat ini:

- Review guest (`userId = null`) bisa dibuka lewat URL sampai masa retensi habis.

