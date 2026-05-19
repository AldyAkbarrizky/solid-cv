import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { supportEmail, companyName } from "@/lib/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Solid CV",
  description:
    "Syarat dan ketentuan penggunaan Solid CV untuk review CV berbasis AI.",
};

const lastUpdated = "19 Mei 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/" backLabel="Beranda" />

      <section className="mx-auto w-full max-w-4xl px-5 py-10 md:py-14">
        <p className="text-sm font-medium text-primary">Terms of Service</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          Syarat dan Ketentuan Solid CV
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          Terakhir diperbarui: {lastUpdated}
        </p>

        <Card className="mt-8 bg-white shadow-sm">
          <CardContent className="prose prose-slate max-w-none p-6 prose-headings:scroll-mt-24 prose-headings:text-slate-950 prose-p:leading-7 prose-li:leading-7">
            <h2>1. Penerimaan Syarat</h2>
            <p>
              Dengan mengakses atau menggunakan Solid CV, Anda menyetujui Syarat
              dan Ketentuan ini. Jika Anda tidak setuju, jangan gunakan layanan
              ini.
            </p>

            <h2>2. Tentang Layanan</h2>
            <p>
              Solid CV adalah aplikasi web yang membantu pengguna meninjau CV
              menggunakan analisis berbasis AI. Layanan dapat memberikan skor,
              ringkasan, rekomendasi perbaikan, keyword yang dapat
              dipertimbangkan, dan langkah berikutnya.
            </p>

            <p>
              Solid CV tidak memberikan jaminan bahwa CV akan lolos screening,
              dipanggil interview, atau diterima kerja.
            </p>

            <h2>3. Akun Pengguna</h2>
            <p>
              Beberapa fitur memerlukan login, misalnya riwayat review, quota
              akun, dan paket berbayar. Anda bertanggung jawab atas penggunaan
              akun Anda dan wajib memastikan informasi akun yang digunakan
              benar.
            </p>

            <h2>4. Penggunaan yang Diperbolehkan</h2>
            <p>Anda boleh menggunakan Solid CV untuk:</p>

            <ul>
              <li>Menganalisis CV milik Anda sendiri.</li>
              <li>Mendapatkan rekomendasi perbaikan CV.</li>
              <li>Menyimpan dan membuka kembali riwayat review jika login.</li>
              <li>Menggunakan quota sesuai paket yang tersedia.</li>
            </ul>

            <h2>5. Penggunaan yang Dilarang</h2>
            <p>Anda tidak boleh menggunakan Solid CV untuk:</p>

            <ul>
              <li>Mengunggah CV atau data pribadi orang lain tanpa izin.</li>
              <li>
                Mengunggah file berbahaya, malware, atau file manipulatif.
              </li>
              <li>
                Mencoba membobol, mengganggu, atau menyalahgunakan sistem.
              </li>
              <li>
                Mencoba mengeksploitasi API, payment flow, quota, atau rate
                limit.
              </li>
              <li>
                Menggunakan layanan untuk aktivitas ilegal, penipuan, atau
                pelanggaran hukum.
              </li>
              <li>
                Menyalin, menjual ulang, atau mengeksploitasi layanan tanpa
                izin.
              </li>
            </ul>

            <h2>6. Hasil Analisis AI</h2>
            <p>
              Hasil analisis AI bersifat rekomendasi otomatis. Hasil dapat
              berbeda jika pengguna melakukan review ulang, meskipun CV dan
              posisi tujuan yang digunakan sama.
            </p>

            <p>
              Pengguna bertanggung jawab untuk meninjau kembali hasil analisis
              sebelum menerapkannya pada CV. Solid CV tidak bertanggung jawab
              atas keputusan rekrutmen, hasil lamaran kerja, atau interpretasi
              pihak ketiga terhadap CV pengguna.
            </p>

            <h2>7. File CV dan Data Pengguna</h2>
            <p>
              File CV diproses untuk kebutuhan analisis dan tidak dimaksudkan
              untuk disimpan sebagai dokumen permanen. Detail lebih lanjut
              dijelaskan dalam{" "}
              <Link href="/privacy" className="text-primary">
                Kebijakan Privasi
              </Link>
              .
            </p>

            <h2>8. Penghapusan Review dan Akun</h2>
            <p>
              Pengguna dapat menghapus hasil review CV melalui fitur yang
              tersedia di aplikasi. Penghapusan hasil review akan menghapus data
              hasil analisis dari database aplikasi, tetapi tidak mengembalikan
              kuota yang sudah digunakan.
            </p>

            <p>
              Pengguna dapat meminta penghapusan akun dengan menghubungi kami
              melalui email kontak resmi. Kami dapat meminta verifikasi tambahan
              untuk memastikan bahwa permintaan benar-benar berasal dari pemilik
              akun.
            </p>

            <p>
              Penghapusan akun dapat menyebabkan pengguna kehilangan akses ke
              riwayat review, quota, entitlement, dan data lain yang terkait
              dengan akun. Data tertentu dapat tetap disimpan secara terbatas
              jika diperlukan untuk hukum, keamanan, audit transaksi, atau
              penyelesaian sengketa.
            </p>

            <h2>9. Quota dan Paket</h2>
            <p>
              Solid CV dapat menyediakan mode guest, free user, beta tester, dan
              paid user. Setiap status akun dapat memiliki batas quota review
              yang berbeda.
            </p>

            <p>
              Quota dihitung berdasarkan review yang berhasil dibuat. Kegagalan
              upload, file invalid, atau kegagalan sistem tertentu tidak selalu
              dihitung sebagai penggunaan quota.
            </p>

            <p>
              Penghapusan hasil review tidak mengembalikan quota yang sudah
              digunakan.
            </p>

            <h2>10. Pembayaran</h2>
            <p>
              Pembayaran paket berbayar diproses melalui Duitku. Paket akan
              aktif setelah sistem menerima dan memvalidasi callback pembayaran.
            </p>

            <p>
              Selama mode sandbox atau masa uji coba, transaksi dapat digunakan
              untuk keperluan verifikasi integrasi dan belum tentu
              merepresentasikan transaksi produksi.
            </p>

            <h2>11. Refund dan Pembatalan</h2>
            <p>
              Untuk MVP atau masa uji coba awal, pembelian paket bersifat
              one-time untuk periode tertentu dan tidak otomatis recurring.
              Kebijakan refund atau pembatalan akan mengikuti ketentuan yang
              ditampilkan pada halaman paket atau komunikasi resmi Solid CV.
            </p>

            <h2>12. Ketersediaan Layanan</h2>
            <p>
              Kami berupaya menjaga layanan tetap tersedia, tetapi tidak
              menjamin layanan akan selalu bebas gangguan, bebas error, atau
              tersedia tanpa interupsi. Layanan dapat terganggu karena
              maintenance, gangguan penyedia AI, payment gateway, hosting,
              database, atau faktor lain di luar kendali kami.
            </p>

            <h2>13. Perubahan Layanan</h2>
            <p>
              Solid CV dapat mengubah fitur, quota, paket, harga, atau ketentuan
              layanan dari waktu ke waktu. Perubahan penting akan ditampilkan di
              aplikasi atau halaman terkait.
            </p>

            <h2>14. Batasan Tanggung Jawab</h2>
            <p>
              Sepanjang diperbolehkan oleh hukum yang berlaku, Solid CV tidak
              bertanggung jawab atas kehilangan peluang kerja, keputusan
              rekrutmen, kerugian tidak langsung, atau kerugian yang timbul dari
              penggunaan hasil analisis AI tanpa peninjauan mandiri oleh
              pengguna.
            </p>

            <h2>15. Pelanggaran</h2>
            <p>
              Kami dapat membatasi, menangguhkan, atau menghentikan akses
              pengguna jika terdapat indikasi penyalahgunaan sistem, pelanggaran
              ketentuan, eksploitasi quota/payment, atau aktivitas yang
              merugikan layanan maupun pengguna lain.
            </p>

            <h2>16. Hukum yang Berlaku</h2>
            <p>
              Syarat dan Ketentuan ini mengikuti hukum yang berlaku di Republik
              Indonesia, termasuk ketentuan terkait pelindungan data pribadi dan
              transaksi elektronik yang relevan.
            </p>

            <h2>17. Kontak</h2>
            <p>
              Untuk pertanyaan terkait Syarat dan Ketentuan ini, hubungi{" "}
              {companyName} melalui email{" "}
              <a href={`mailto:${supportEmail}`} className="text-primary">
                {supportEmail}
              </a>
              .
            </p>

            <p>
              Halaman kontak tersedia di{" "}
              <Link href="/contact" className="text-primary">
                /contact
              </Link>
              .
            </p>

            <p className="not-prose mt-8 text-sm text-muted-foreground">
              Lihat juga{" "}
              <Link href="/privacy" className="font-medium text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
