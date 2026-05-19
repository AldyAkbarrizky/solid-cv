# Dokumentasi Developer

Folder ini isinya catatan teknis untuk tim yang lanjut mengembangkan Solid CV.

Urutan baca yang disarankan:

1. [Local Setup](./local-setup.md)
2. [Arsitektur & Alur Data](./architecture-and-flow.md)
3. [Billing & Admin](./billing-and-admin.md)
4. [Security, Privacy, dan Operasional](./security-privacy-ops.md)

Kalau butuh konteks cepat:

- Entry UI utama: `src/app/page.tsx`
- Header global: `src/components/layout/site-header.tsx`
- Halaman form review: `src/app/review/page.tsx`
- Halaman pricing dan status kuota: `src/app/pricing/page.tsx`
- API utama analisis CV: `src/app/api/cv/analyze/route.ts`
- API checkout: `src/app/api/billing/checkout/route.ts`
- Callback Duitku: `src/app/api/billing/duitku/callback/route.ts`
- Admin dashboard: `src/app/admin/page.tsx`
- Model data: `src/db/schema.ts`
- Validasi env production: `src/lib/config/env.ts`
