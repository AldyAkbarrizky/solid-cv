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
- Neon serverless driver (WebSocket, mendukung transaksi)
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
npm test             # unit test kuota
npm run db:generate  # generate migration
npm run db:migrate   # run migration
npm run db:studio    # buka Drizzle Studio
```

> **Catatan build lokal:** `npm run build` berjalan dengan mode production dan akan menolak
> `APP_URL` yang masih pakai `localhost`. Untuk test build di lokal, override sementara:
>
> ```bash
> APP_URL=https://cv.solidtechno.com \
> BETTER_AUTH_URL=https://cv.solidtechno.com \
> NEXT_PUBLIC_BETTER_AUTH_URL=https://cv.solidtechno.com \
> npm run build
> ```

## Dokumentasi Developer

Dokumentasi teknis ada di folder `docs/`:

- `docs/local-setup.md`
- `docs/architecture-and-flow.md`
- `docs/billing-and-admin.md`
- `docs/security-privacy-ops.md`
- `docs/admin-sop.md`

Mulai dari `docs/README.md` untuk urutan bacanya.

## Fitur Utama

- Upload CV PDF/DOCX dengan validasi ukuran, MIME, dan magic bytes.
- Ekstraksi teks CV dengan `pdf-parse@1.x` (custom renderer untuk spasi akurat) dan `mammoth`.
- Masking PII dasar sebelum teks dikirim ke AI.
- Review CV berbasis Groq dengan output JSON tervalidasi Zod.
- Riwayat review untuk user login.
- Guest mode dengan kuota 1 review per 24 jam.
- Free login dengan kuota 15 review per bulan.
- Paket berbayar `paid_basic` dan `paid_pro`.
- Halaman pricing dengan status paket/kuota akun dan tabel perbandingan paket.
- CTA upgrade paket tersedia di header, halaman review, dan halaman riwayat.
- Checkout Duitku, callback validation, dan activation entitlement.
- Halaman return pembayaran dengan status real-time (paid/pending/failed) + auto-refresh.
- Admin dashboard untuk melihat payment order, entitlement, usage, review, dan audit log.
- Cleanup job otomatis (Vercel Cron) untuk hapus review dan rate-limit data yang expired.
- Privacy Policy, Terms of Service, Contact, robots, dan sitemap.

## Catatan Penting

- File CV tidak disimpan sebagai dokumen permanen.
- Hasil review AI bersifat rekomendasi, bukan jaminan diterima kerja.
- Ada rate limit dan quota usage untuk mencegah penyalahgunaan.
- Error production dikirim ke Sentry jika `SENTRY_DSN` diisi (opsional, default off).
- Halaman `/review` tetap bisa diakses sebagai guest (tanpa login) selama kuota guest masih tersedia.
- Aktivasi paket berbayar dilakukan melalui callback Duitku yang valid, bukan dari halaman return pembayaran.
