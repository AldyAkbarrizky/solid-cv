# Security, Privacy, dan Operasional

## Privacy model saat ini

- File CV tidak disimpan sebagai dokumen permanen.
- Yang diproses hanya teks hasil ekstraksi.
- Sebelum ke AI, data sensitif dasar di-mask (`email`, `phone`, `id number`, `url`) lewat `src/lib/cv/mask-pii.ts`.
- Hasil review punya masa retensi (`REVIEW_RETENTION_DAYS`), default 30 hari.
- Data pembayaran yang disimpan hanya data order yang diperlukan untuk rekonsiliasi: plan, nominal, status, merchant order ID, reference Duitku, dan waktu transaksi.
- Data support/legal menggunakan `NEXT_PUBLIC_SUPPORT_EMAIL` dan `NEXT_PUBLIC_COMPANY_NAME`.

## Security controls yang sudah ada

1. **Security headers** di `next.config.ts`:
   - CSP
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer-Policy
   - Permissions-Policy
   - COOP
2. **Rate limiting** per identity hash di `src/lib/security/rate-limit.ts`
   - identity hash dibentuk dari request header yang dinormalisasi aman untuk `Request`, `Headers`, dan `ReadonlyHeaders` Next.js (`src/lib/security/request-identity.ts`)
3. **Quota limiting**:
   - guest: 1 review / 24 jam
   - user free: 15 review / bulan (default)
4. **File validation berlapis**:
   - extension
   - MIME type
   - magic bytes
   - max file size 3 MB
5. **Schema validation**:
   - request payload (`zod`)
   - AI output JSON (`zod`)
6. **Production env guard**:
   - `src/lib/config/env.ts` mengecek env wajib di production
   - file ini juga mencegah secret penting memakai prefix `NEXT_PUBLIC_`
7. **Billing callback validation**:
   - callback Duitku divalidasi dengan signature
   - nominal callback dicocokkan dengan nominal order
   - aktivasi paket dilakukan setelah status pembayaran divalidasi

## Hal yang perlu dijaga saat lanjut develop

### 1) Endpoint delete review

File: `src/app/api/review/[id]/route.ts`

Status saat ini:
- wajib login untuk delete
- hanya owner review yang bisa delete
- review milik user lain akan ditolak

### 2) CSP connect-src

Di `next.config.ts`, `connect-src` sudah membuka domain Groq, DeepSeek, dan Duitku.
Kalau ada kebutuhan endpoint eksternal baru, whitelist domain satu per satu dan hindari wildcard yang terlalu luas.

### 3) Monitoring error AI

Error penting dicatat lewat `console.error` dan `console.warn`:

- `CV_ANALYZE_ERROR` — error utama flow analisis CV
- `CV_TEXT_EXTRACTION_SHORT` — teks terekstrak < 200 karakter (warning, bukan error), log charCount tersedia
- `CV_AI_FIRST_ATTEMPT_FAILED` — AI attempt pertama gagal, akan otomatis retry
- `CV_AI_SCHEMA_MISMATCH` — response AI tidak cocok schema Zod, log path + snippet tersedia
- `REVIEW_QUOTA_RELEASE_ERROR` — gagal release reserved quota
- `DELETE_REVIEW_ERROR`
- `CHECKOUT_ERROR`
- `DUITKU_CALLBACK_ERROR`
- `ADMIN_CHECK_PAYMENT_STATUS_ERROR`

Untuk production, sebaiknya sambungkan ke log aggregator (Datadog/Sentry/ELK) supaya mudah ditelusuri.

### 4) Payment reconciliation

Callback payment bisa gagal karena network, timeout, atau konfigurasi URL.
Admin sudah punya tombol `Check Duitku`, tetapi tetap perlu SOP operasional:

- cek order pending dari `/admin`
- buka detail order
- tekan `Check Duitku`
- pastikan audit log tercatat

### 5) Data retention

Halaman review sudah mengecek `expiresAt`, tetapi cleanup fisik row lama tetap perlu dijalankan dari job terjadwal jika ingin database benar-benar bersih.

## Checklist rilis singkat

Sebelum deploy:

1. `npm run lint`
2. `npm run build` — wajib pakai env production asli (lihat catatan di bawah)
3. Semua env wajib sudah terisi di platform deploy
4. Migrasi DB sudah dijalankan (`npm run db:migrate`)
5. OAuth redirect Google sudah sesuai domain production
6. Callback dan return URL Duitku sudah sesuai domain production

### Catatan `npm run build` di lokal

`src/lib/config/env.ts` menolak `APP_URL` / `BETTER_AUTH_URL` yang masih pakai `localhost`.
Kalau mau test build di mesin lokal, sementara override env-nya:

```bash
APP_URL=https://cv.solidtechno.com \
BETTER_AUTH_URL=https://cv.solidtechno.com \
NEXT_PUBLIC_BETTER_AUTH_URL=https://cv.solidtechno.com \
npm run build
```

Ini bukan bypass — guard tetap aktif di production. Override hanya untuk keperluan verifikasi build lokal.

### Smoke test manual sebelum publish

Jalankan minimal skenario ini dengan akun dan lingkungan yang nyata (bisa pakai Duitku sandbox):

**1. Guest review**
- Buka `/review` tanpa login
- Upload PDF CV valid, isi target role, submit
- Pastikan hasil review tampil lengkap
- Coba submit kedua kali → harus muncul error kuota habis

**2. Free user review**
- Login dengan akun Google
- Upload PDF CV valid
- Pastikan hasil review tersimpan dan muncul di riwayat `/history`
- Cek `/pricing` → kuota berkurang 1 dari 15

**3. Kuota habis (user free)**
- Pakai akun yang sudah `used = limit`
- Submit review → harus dapat respon 403 kuota habis, bukan 500

**4. Checkout Duitku sandbox**
- Login → buka `/pricing` → klik upgrade paket
- Pastikan redirect ke halaman pembayaran Duitku sandbox
- Pastikan row `payment_orders` terbuat dengan status `pending`

**5. Callback Duitku berhasil**
- Selesaikan pembayaran di Duitku sandbox
- Duitku akan hit `POST /api/billing/duitku/callback`
- Pastikan status order berubah jadi `paid`
- Pastikan row `user_entitlements` terbuat/terupdate dengan `status = active`

**6. Entitlement aktif setelah bayar**
- Login dengan akun yang baru bayar
- Buka `/pricing` → badge paket harus tampil (paid_basic / paid_pro)
- Kuota review harus sesuai plan yang dibeli

**7. Review setelah paid menggunakan kuota baru**
- Submit review dengan akun paid
- Kuota di `/pricing` berkurang dari limit paid, bukan dari 15
- Hasil review tersimpan dan bisa dibuka di riwayat

**8. File invalid**
- Upload gambar `.jpg` yang di-rename jadi `.pdf` → harus tolak
- Upload file kosong → harus tolak
- Upload file > 3 MB → harus tolak

**9. Admin check**
- Login sebagai admin
- Buka `/admin` → pastikan list order dan entitlement tampil
- Buka detail order → tombol `Check Duitku` berfungsi dan audit log tercatat
