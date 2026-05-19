# Billing & Admin

Dokumen ini menjelaskan bagian billing dan admin yang sekarang sudah ada di aplikasi.

## Plan berbayar

Plan didefinisikan di `src/lib/billing/plans.ts`.

Saat ini ada dua plan:

- `paid_basic`
  - harga: Rp29.000
  - kuota: 30 review
  - aktif: 30 hari
- `paid_pro`
  - harga: Rp79.000
  - kuota: 100 review
  - aktif: 30 hari

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

Halaman ini hanya memberi status bahwa pembayaran sedang diverifikasi.

Penting:

- halaman return bukan bukti pembayaran final
- aktivasi paket tetap bergantung pada callback Duitku yang valid
- kalau callback lambat, user bisa melihat status internal order dari halaman ini

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

## Catatan untuk production

- Pastikan `DUITKU_ENV=production` hanya dipakai setelah callback URL, return URL, dan signature sudah dites.
- Jangan expose `DUITKU_API_KEY` ke public env.
- Admin route memakai `notFound()` untuk user non-admin supaya tidak terlalu eksplisit.
- Untuk rekonsiliasi pembayaran, gunakan admin detail page dan tombol `Check Duitku`.
