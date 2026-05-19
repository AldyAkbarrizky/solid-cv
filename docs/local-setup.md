# Local Setup

## 1) Prasyarat

- Node.js 20+
- npm
- Database Postgres (saat ini dipakai via Neon driver)

## 2) Install dependency

```bash
npm install
```

## 3) Siapkan environment

Buat `.env.local` di root project.

Variable yang dipakai aplikasi saat ini:

```bash
DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-20b
GROQ_BASE_URL=https://api.groq.com/openai/v1

IP_HASH_SALT=

REVIEW_RATE_LIMIT_MAX=5
REVIEW_RATE_LIMIT_WINDOW_SECONDS=3600
REVIEW_RETENTION_DAYS=30
```

Catatan:

- `IP_HASH_SALT` wajib diisi di production.
- Saat ini provider AI aktif hanya Groq.

## 4) Migrasi database

```bash
npm run db:migrate
```

Kalau ada perubahan schema:

```bash
npm run db:generate
npm run db:migrate
```

## 5) Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

## 6) Quality check

```bash
npm run lint
```

