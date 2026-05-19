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
APP_URL=http://localhost:3000
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
ADMIN_EMAILS=

REVIEW_RATE_LIMIT_MAX=5
REVIEW_RATE_LIMIT_WINDOW_SECONDS=3600
REVIEW_RETENTION_DAYS=30

DUITKU_ENV=sandbox
DUITKU_MERCHANT_CODE=
DUITKU_API_KEY=
DUITKU_SANDBOX_BASE_URL=https://api-sandbox.duitku.com
DUITKU_PRODUCTION_BASE_URL=https://api-prod.duitku.com

NEXT_PUBLIC_SUPPORT_EMAIL=support@solidtechno.com
NEXT_PUBLIC_COMPANY_NAME=SolidTechno ID
```

Catatan:

- `IP_HASH_SALT` wajib diisi di production.
- `APP_URL`, `BETTER_AUTH_URL`, dan `NEXT_PUBLIC_BETTER_AUTH_URL` perlu mengarah ke domain aplikasi yang sama.
- `ADMIN_EMAILS` berisi daftar email admin, dipisahkan koma. Contoh: `admin@domain.com,ops@domain.com`.
- Provider AI aktif saat ini adalah Groq. File provider DeepSeek masih disiapkan untuk pengembangan berikutnya.
- Duitku bisa berjalan dalam mode `sandbox` atau `production`, tergantung `DUITKU_ENV`.

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
npm run build
```

`npm run build` berguna untuk menangkap error route App Router, dynamic page, dan env usage sebelum deploy.

Catatan untuk local build:

- `npm run build` berjalan dengan mode production.
- `src/lib/config/env.ts` akan menolak `APP_URL`, `BETTER_AUTH_URL`, atau `NEXT_PUBLIC_BETTER_AUTH_URL` yang masih memakai `http://localhost`.
- Kalau ingin test build di lokal, gunakan override sementara:

```bash
APP_URL=https://cv.solidtechno.com \
BETTER_AUTH_URL=https://cv.solidtechno.com \
NEXT_PUBLIC_BETTER_AUTH_URL=https://cv.solidtechno.com \
npm run build
```
