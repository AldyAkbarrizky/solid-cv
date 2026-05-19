# Solid CV

Solid CV adalah aplikasi review CV berbasis AI untuk membantu pencari kerja menilai:

- struktur CV
- kejelasan pengalaman
- relevansi dengan posisi yang dituju
- keterbacaan ATS

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Drizzle ORM + PostgreSQL
- Better Auth (Google login)
- Groq API (via OpenAI SDK)

## Menjalankan Project

### 1) Install dependency

```bash
npm install
```

### 2) Siapkan environment

Buat `.env.local` di root project (lihat referensi lengkap di `docs/local-setup.md`).

Variable utama:

```bash
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GROQ_API_KEY=
IP_HASH_SALT=
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
- `docs/security-privacy-ops.md`

Mulai dari `docs/README.md` untuk urutan bacanya.

## Catatan Penting

- File CV tidak disimpan sebagai dokumen permanen.
- Hasil review AI bersifat rekomendasi, bukan jaminan diterima kerja.
- Ada rate limit dan quota usage untuk mencegah penyalahgunaan.
