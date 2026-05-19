# Billing & Admin

Dokumen ini menjelaskan bagian billing dan admin yang sekarang sudah ada di aplikasi.

## Plan berbayar

Plan didefinisikan di `src/lib/billing/plans.ts`.

Saat ini ada dua plan:

- `paid_basic`
  - harga: Rp29.000
  - kuota: 60 review
  - aktif: 30 hari
- `paid_pro`
  - harga: Rp79.000
  - kuota: 180 review
  - aktif: 30 hari

Selain plan berbayar:

- `guest`: 1 review / 24 jam
- `free` (login): 15 review / bulan

Halaman yang memakai plan:

- `/pricing`
- `/` bagian Paket
- `POST /api/billing/checkout`

## Checkout

Endpoint utama: `src/app/api/billing/checkout/route.ts`

Flow:

1. User wajib login.
2. Sistem cek apakah user masih punya paket berbayar aktif.
3. Sistem validasi `planCode`.
4. Sistem membuat `merchantOrderId`.
5. Row baru dibuat di `payment_orders` dengan status `pending`.
6. Sistem request invoice ke Duitku.
7. `duitkuReference` dan `paymentUrl` disimpan ke order.
8. Response mengembalikan `paymentUrl` agar frontend bisa redirect user.

Catatan:

- Pembelian paket baru saat paket paid masih aktif belum didukung.
- `merchantOrderId` dibatasi 50 karakter.
- Expiry invoice saat ini 60 menit.

## Callback Duitku

Endpoint utama: `src/app/api/billing/duitku/callback/route.ts`

Callback memproses data form dari Duitku:

- `merchantCode`
- `amount`
- `merchantOrderId`
- `resultCode`
- `reference`
- `signature`

Validasi yang dilakukan:

1. Pastikan parameter wajib ada.
2. Cocokkan signature callback.
3. Cari order berdasarkan `merchantOrderId`.
4. Cocokkan nominal callback dengan nominal order.
5. Kalau `resultCode = 00`, sinkronisasi status ke Duitku.
6. Kalau pembayaran valid, entitlement user diaktifkan.

Aktivasi paket dilakukan melalui `syncPaymentOrderWithDuitku`, bukan hanya dari halaman return.

## Payment sync

File: `src/lib/billing/payment-sync.ts`

Fungsi `syncPaymentOrderWithDuitku` dipakai oleh:

- callback Duitku
- tombol admin "Check Duitku"

Status yang ditangani:

- `00`: paid
- `01`: failed
- `02`: cancelled
- status lain: order tetap pada status sebelumnya, tetapi reference/result code diperbarui

Jika order berubah menjadi `paid`, sistem memanggil `upsertUserEntitlement`.

## Entitlement

File: `src/lib/quota/entitlements.ts`

Entitlement menentukan plan aktif dan kuota review user.

Saat payment berhasil:

- jika user sudah punya entitlement aktif, entitlement diperbarui
- jika belum ada, entitlement baru dibuat

Data entitlement disimpan di tabel `user_entitlements`.

## Status paket dan kuota

Route utama: `/pricing`

Fungsi:

- menampilkan paket aktif user
- menampilkan kuota, pemakaian, dan sisa review
- menampilkan tanggal pembaruan kuota
- menampilkan pilihan paket dan tabel perbandingan

Route `/billing` masih ada, tetapi hanya redirect ke `/pricing` supaya link lama tidak error.

## Return page

Route: `/billing/return`

Halaman ini menampilkan status pembayaran secara real-time berdasarkan status order di DB.

Status yang ditampilkan:
- `paid` — hijau, kuota sudah aktif
- `pending` — kuning, menunggu callback Duitku (auto-refresh tiap 6 detik, maks 8 kali)
- `failed` / `cancelled` — merah, instruksi untuk coba ulang
- tidak ada order — fallback info

Penting:
- halaman return bukan bukti pembayaran final
- aktivasi paket tetap bergantung pada callback Duitku yang valid
- kalau callback lambat, user bisa klik "Cek Status" untuk refresh manual

## Admin

Admin ditentukan dari `ADMIN_EMAILS` di environment.

File utama:

- `src/lib/admin.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/payments/[id]/page.tsx`
- `src/app/api/admin/payments/[id]/check-status/route.ts`

Fitur admin:

- melihat ringkasan revenue, payment order, review, entitlement, dan usage event
- melihat payment order terbaru
- melihat entitlement terbaru
- melihat review terbaru
- melihat audit log admin
- membuka detail payment order
- cek status order ke Duitku secara manual

## Audit log admin

File: `src/lib/admin-audit.ts`

Saat admin menekan "Check Duitku", sistem menulis audit log ke `admin_audit_logs`.

Data yang dicatat:

- admin user id
- admin email
- action
- entity type
- entity id
- metadata
- timestamp

## Cleanup job

Endpoint: `POST /api/cleanup/expired-reviews`

Dijalankan otomatis tiap hari jam 03:00 UTC via Vercel Cron (lihat `vercel.json`).

Apa yang dibersihkan:
- `cv_reviews` di mana `expires_at < now()` (default 30 hari)
- `review_attempts` yang lebih dari 48 jam (data rate-limit)

Bisa juga dijalankan manual:
```bash
curl -X POST https://cv.solidtechno.com/api/cleanup/expired-reviews \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Pastikan `CRON_SECRET` diisi di env variable. Tanpa itu, endpoint selalu return 401.

## Catatan untuk production

- Pastikan `DUITKU_ENV=production` hanya dipakai setelah callback URL, return URL, dan signature sudah dites.
- Jangan expose `DUITKU_API_KEY` ke public env.
- Admin route memakai `notFound()` untuk user non-admin supaya tidak terlalu eksplisit.
- Untuk rekonsiliasi pembayaran, gunakan admin detail page dan tombol `Check Duitku`.
- Prosedur operasional lengkap (tambah admin, aktivasi manual, rollback) ada di `docs/admin-sop.md`.
