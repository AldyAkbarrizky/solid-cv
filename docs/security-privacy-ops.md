# Security, Privacy, dan Operasional

## Privacy model saat ini

- File CV tidak disimpan sebagai dokumen permanen.
- Yang diproses hanya teks hasil ekstraksi.
- Sebelum ke AI, data sensitif dasar di-mask (`email`, `phone`, `id number`, `url`) lewat `src/lib/cv/mask-pii.ts`.
- Hasil review punya masa retensi (`REVIEW_RETENTION_DAYS`), default 30 hari.

## Security controls yang sudah ada

1. **Security headers** di `next.config.ts`:
   - CSP
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer-Policy
   - Permissions-Policy
   - COOP
2. **Rate limiting** per identity hash di `src/lib/security/rate-limit.ts`
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

## Hal yang perlu dijaga saat lanjut develop

### 1) Endpoint delete review

File: `src/app/api/review/[id]/route.ts`

Saat ini endpoint delete belum memeriksa kepemilikan review.  
UI memang menyembunyikan tombol berdasarkan konteks halaman, tapi endpoint tetap perlu authz check di server.

Minimal yang disarankan:

- wajib login untuk delete
- hanya owner review yang boleh delete
- guest review sebaiknya tidak bisa di-delete dari endpoint publik tanpa token khusus

### 2) CSP connect-src

Di `next.config.ts`, `connect-src` saat ini masih `'self'`.  
Kalau ada kebutuhan akses endpoint eksternal langsung dari browser di masa depan, whitelist domain dengan hati-hati.

### 3) Monitoring error AI

Error penting dicatat lewat `console.error`:

- `CV_ANALYZE_ERROR`
- `DELETE_REVIEW_ERROR`

Untuk production, sebaiknya sambungkan ke log aggregator (Datadog/Sentry/ELK) supaya mudah ditelusuri.

## Checklist rilis singkat

Sebelum deploy:

1. `npm run lint`
2. `npm run build`
3. cek semua env wajib sudah terisi
4. cek migrasi DB sudah jalan
5. smoke test:
   - login
   - upload PDF valid
   - upload file invalid
   - kuota habis
   - buka hasil review by id

