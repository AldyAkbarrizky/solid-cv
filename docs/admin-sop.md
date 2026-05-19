# Admin SOP (Standard Operasional Prosedur)

Dokumen ini mencakup prosedur operasional harian untuk admin Solid CV:
menambah admin, cek order pending, rekonsiliasi Duitku, dan rollback entitlement.

---

## 1) Cara menambah atau menghapus admin

Admin ditentukan dari env variable `ADMIN_EMAILS`. Format: email dipisahkan koma.

```bash
ADMIN_EMAILS=admin@domain.com,ops@domain.com
```

**Langkah menambah admin:**

1. Buka environment variable di platform deploy (Vercel dashboard → Settings → Environment Variables).
2. Edit nilai `ADMIN_EMAILS`, tambahkan email baru dipisah koma.
3. Redeploy aplikasi (atau trigger redeploy) agar perubahan env berlaku.
4. Minta user baru login ke aplikasi — akses admin langsung aktif.

**Langkah mencabut akses admin:**

1. Hapus email dari `ADMIN_EMAILS`.
2. Redeploy.
3. Akses ke `/admin` akan langsung ditolak dengan `notFound()`.

> Tidak ada tabel admin di database. Semua pengecekan dilakukan runtime via `ADMIN_EMAILS`.

---

## 2) Cek order pending

Order bisa stuck di status `pending` karena:
- Callback Duitku belum masuk (delay, timeout, atau URL salah).
- User menutup halaman sebelum pembayaran selesai.
- Masalah sementara di sisi Duitku.

**Cara cek:**

1. Buka `/admin` → lihat tabel "Payment Orders Terbaru".
2. Cari order dengan status `pending`.
3. Klik detail order untuk melihat data lengkap.
4. Klik tombol **Check Duitku** → sistem akan query status terbaru ke Duitku API.
5. Jika Duitku konfirmasi sudah `paid`, entitlement user otomatis aktif dan audit log tercatat.
6. Jika Duitku konfirmasi `failed` atau `cancelled`, status order diupdate sesuai.

**Cek manual via curl (jika admin page tidak bisa diakses):**

```bash
curl -X POST https://cv.solidtechno.com/api/admin/payments/{ORDER_ID}/check-status \
  -H "Cookie: <session_cookie_admin>"
```

---

## 3) Rekonsiliasi Duitku

Kalau ada beberapa order pending yang perlu dicek sekaligus:

1. Buka `/admin`.
2. Scroll ke tabel Payment Orders.
3. Buka masing-masing order yang statusnya `pending` → klik **Check Duitku**.
4. Audit log akan mencatat setiap aksi cek.

**Kalau callback URL Duitku salah konfigurasi:**

1. Pastikan `DUITKU_ENV` sesuai (`sandbox` atau `production`).
2. Pastikan callback URL di dashboard Duitku sudah mengarah ke:
   ```
   https://cv.solidtechno.com/api/billing/duitku/callback
   ```
3. Setelah URL diperbaiki, coba trigger ulang callback dari Duitku dashboard, atau gunakan tombol Check Duitku dari admin.

**Kalau order sudah lebih dari 24 jam dan masih pending:**

- Kemungkinan besar pembayaran memang gagal/dibatalkan user.
- Gunakan tombol Check Duitku untuk konfirmasi final.
- Kalau Duitku bilang paid tapi entitlement belum aktif, ikuti prosedur aktivasi manual di bawah.

---

## 4) Aktivasi entitlement manual

Dipakai kalau callback berhasil tapi entitlement tidak aktif karena bug, atau sebagai override darurat.

**Melalui Drizzle Studio:**

```bash
npm run db:studio
```

Buka browser ke URL yang ditampilkan terminal (biasanya `http://localhost:4983`).

Navigasi ke tabel `user_entitlements`:
- Kalau user belum punya entitlement: buat row baru.
- Kalau sudah ada tapi status salah: edit langsung.

Field yang perlu diisi/diupdate:
```
user_id            = <id user dari tabel user>
plan_code          = paid_basic | paid_pro
status             = active
review_quota_limit = 60 (basic) | 180 (pro)
current_period_start = <tanggal bayar>
current_period_end   = <tanggal bayar + 30 hari>
```

**Melalui Drizzle atau psql langsung (production):**

```sql
-- Cek dulu apakah entitlement sudah ada
SELECT * FROM user_entitlements WHERE user_id = '<USER_ID>';

-- Kalau belum ada, insert
INSERT INTO user_entitlements (
  user_id, plan_code, status, review_quota_limit,
  current_period_start, current_period_end
) VALUES (
  '<USER_ID>',
  'paid_basic',
  'active',
  60,
  NOW(),
  NOW() + INTERVAL '30 days'
);

-- Kalau sudah ada tapi perlu diupdate
UPDATE user_entitlements
SET
  plan_code = 'paid_basic',
  status = 'active',
  review_quota_limit = 60,
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE user_id = '<USER_ID>';
```

> Selalu catat aksi manual ini di somewhere (Notion/Slack/email) untuk audit trail, karena
> perubahan langsung ke DB tidak tercatat di `admin_audit_logs`.

---

## 5) Rollback entitlement (deaktivasi)

Kalau ada entitlement yang perlu dibatalkan (misalnya refund, fraud, atau aktivasi keliru):

```sql
UPDATE user_entitlements
SET
  status = 'inactive',
  updated_at = NOW()
WHERE user_id = '<USER_ID>'
  AND status = 'active';
```

Atau melalui Drizzle Studio: ubah kolom `status` dari `active` ke `inactive`.

> Menonaktifkan entitlement tidak secara otomatis mengubah `review_quota_limit`. User yang
> sudah memakai kuota tidak bisa "dibatalkan" penggunaannya. Tapi akses kuota lebih lanjut
> akan terhenti karena query entitlement memeriksa `status = 'active'`.

---

## 6) Cleanup data expired (manual)

Normalnya cleanup berjalan otomatis tiap hari jam 03:00 UTC via Vercel Cron
(endpoint `POST /api/cleanup/expired-reviews`).

Kalau perlu cleanup manual mendesak:

```bash
curl -X POST https://cv.solidtechno.com/api/cleanup/expired-reviews \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Response sukses:
```json
{ "deletedReviews": 42, "deletedAttempts": 120, "runAt": "2026-05-19T03:00:00.000Z" }
```

> Pastikan `CRON_SECRET` sudah diset di environment variable. Kalau tidak ada,
> endpoint akan selalu return 401.

---

## 7) Cara cek kuota user tertentu

Dari Drizzle Studio atau SQL:

```sql
-- Kuota dan entitlement aktif
SELECT u.email, e.plan_code, e.status, e.review_quota_limit,
       e.current_period_start, e.current_period_end
FROM user_entitlements e
JOIN "user" u ON u.id = e.user_id
WHERE u.email = '<EMAIL_USER>'
  AND e.status = 'active';

-- Pemakaian bulan ini
SELECT COUNT(*) as used
FROM review_usage_events
WHERE user_id = (SELECT id FROM "user" WHERE email = '<EMAIL_USER>')
  AND created_at >= date_trunc('month', NOW());
```

---

## Kontak dan eskalasi

Untuk masalah yang tidak bisa diselesaikan via admin UI atau prosedur di atas:

- Cek log Sentry (jika SENTRY_DSN dikonfigurasi) untuk detail error.
- Cek log Vercel di dashboard → Deployments → Functions.
- Hubungi tim teknis dengan menyertakan: order ID, user ID/email, timestamp kejadian, dan screenshot error (jika ada).
