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
   - user free: 3 review / bulan (default)
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

Error penting dicatat lewat `console.error`:

- `CV_ANALYZE_ERROR`
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
2. `npm run build`
3. cek semua env wajib sudah terisi
4. cek migrasi DB sudah jalan
5. cek OAuth redirect Google
6. cek callback dan return URL Duitku
7. smoke test:
   - login
   - upload PDF valid
   - upload file invalid
   - kuota habis
   - buka hasil review by id
   - checkout paket sandbox
   - callback Duitku berhasil mengaktifkan entitlement
   - admin bisa cek status payment order
