# Solid CV

Solid CV adalah aplikasi review CV berbasis AI untuk membantu pencari kerja menilai:

- struktur CV
- kejelasan pengalaman
- relevansi dengan posisi yang dituju
- keterbacaan ATS
- rekomendasi perbaikan dan keyword yang bisa dipertimbangkan

Aplikasi ini juga sudah memiliki login Google, riwayat review, quota usage, paket berbayar via Duitku, status paket/kuota di halaman pricing, admin lite, dan halaman legal dasar.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Drizzle ORM + PostgreSQL
- Better Auth (Google login)
- Groq API (via OpenAI SDK)
- Duitku payment gateway
- Neon serverless driver
- Next Image remote config untuk avatar Google

## Menjalankan Project

### 1) Install dependency

```bash
npm install
```

### 2) Siapkan environment

Buat `.env.local` di root project (lihat referensi lengkap di `docs/local-setup.md`).

Variable utama:

```bash
APP_URL=
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GROQ_API_KEY=
GROQ_BASE_URL=
GROQ_MODEL=
IP_HASH_SALT=
ADMIN_EMAILS=
DUITKU_ENV=
DUITKU_MERCHANT_CODE=
DUITKU_API_KEY=
```

### 3) Jalankan migrasi

```bash
npm run db:migrate
```

### 4) Jalankan dev server

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Script yang sering dipakai

```bash
npm run dev          # jalankan local dev server
npm run build        # build production
npm run start        # jalankan hasil build
npm run lint         # linting
npm run db:generate  # generate migration
npm run db:migrate   # run migration
npm run db:studio    # buka Drizzle Studio
```

## Dokumentasi Developer

Dokumentasi teknis ada di folder `docs/`:

- `docs/local-setup.md`
- `docs/architecture-and-flow.md`
- `docs/billing-and-admin.md`
- `docs/security-privacy-ops.md`

Mulai dari `docs/README.md` untuk urutan bacanya.

## Fitur Utama

- Upload CV PDF/DOCX dengan validasi ukuran, MIME, dan magic bytes.
- Ekstraksi teks CV dengan `pdf-parse` dan `mammoth`.
- Masking PII dasar sebelum teks dikirim ke AI.
- Review CV berbasis Groq dengan output JSON tervalidasi Zod.
- Riwayat review untuk user login.
- Guest mode dengan kuota terbatas.
- Paket berbayar `paid_basic` dan `paid_pro`.
- Halaman pricing dengan status paket/kuota akun dan tabel perbandingan paket.
- CTA upgrade paket tersedia di header, halaman review, dan halaman riwayat.
- Checkout Duitku, callback validation, dan activation entitlement.
- Admin dashboard untuk melihat payment order, entitlement, usage, review, dan audit log.
- Privacy Policy, Terms of Service, Contact, robots, dan sitemap.

## Catatan Penting

- File CV tidak disimpan sebagai dokumen permanen.
- Hasil review AI bersifat rekomendasi, bukan jaminan diterima kerja.
- Ada rate limit dan quota usage untuk mencegah penyalahgunaan.
- Halaman `/review` tetap bisa diakses sebagai guest (tanpa login) selama kuota guest masih tersedia.
- Aktivasi paket berbayar dilakukan melalui callback Duitku yang valid, bukan dari halaman return pembayaran.
