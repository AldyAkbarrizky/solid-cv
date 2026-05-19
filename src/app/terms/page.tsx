import Link from "next/link";
import { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { companyName, supportEmail } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms of Service - Solid CV",
  description:
    "Syarat dan ketentuan penggunaan Solid CV untuk review CV berbasis AI.",
};

const lastUpdated = "19 Mei 2026";

const termsSections = [
  {
    id: "penerimaan",
    title: "Penerimaan syarat",
    content: (
      <p>
        Dengan mengakses atau menggunakan Solid CV, Anda menyetujui Syarat dan
        Ketentuan ini. Jika Anda tidak setuju, jangan gunakan layanan ini.
      </p>
    ),
  },
  {
    id: "layanan",
    title: "Tentang layanan",
    content: (
      <>
        <p>
          Solid CV adalah aplikasi web yang membantu pengguna meninjau CV
          menggunakan analisis berbasis AI. Layanan dapat memberikan skor,
          ringkasan, rekomendasi perbaikan, keyword yang dapat dipertimbangkan,
          dan langkah berikutnya.
        </p>
        <p>
          Solid CV tidak memberikan jaminan bahwa CV akan lolos screening,
          dipanggil interview, atau diterima kerja.
        </p>
      </>
    ),
  },
  {
    id: "akun",
    title: "Akun pengguna",
    content: (
      <p>
        Beberapa fitur memerlukan login, misalnya riwayat review, kuota akun,
        dan paket berbayar. Anda bertanggung jawab atas penggunaan akun Anda dan
        wajib memastikan informasi akun yang digunakan benar.
      </p>
    ),
  },
  {
    id: "penggunaan",
    title: "Penggunaan yang diperbolehkan",
    content: (
      <>
        <p>Anda boleh menggunakan Solid CV untuk:</p>
        <ul>
          <li>Menganalisis CV milik Anda sendiri.</li>
          <li>Mendapatkan rekomendasi perbaikan CV.</li>
          <li>Menyimpan dan membuka kembali riwayat review jika login.</li>
          <li>Menggunakan kuota sesuai paket yang tersedia.</li>
        </ul>
      </>
    ),
  },
  {
    id: "larangan",
    title: "Penggunaan yang dilarang",
    content: (
      <>
        <p>Anda tidak boleh menggunakan Solid CV untuk:</p>
        <ul>
          <li>Mengunggah CV atau data pribadi orang lain tanpa izin.</li>
          <li>Mengunggah file berbahaya, malware, atau file manipulatif.</li>
          <li>Mencoba membobol, mengganggu, atau menyalahgunakan sistem.</li>
          <li>
            Mencoba mengeksploitasi API, payment flow, kuota, atau rate limit.
          </li>
          <li>
            Menggunakan layanan untuk aktivitas ilegal, penipuan, atau
            pelanggaran hukum.
          </li>
          <li>
            Menyalin, menjual ulang, atau mengeksploitasi layanan tanpa izin.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ai",
    title: "Hasil analisis AI",
    content: (
      <>
        <p>
          Hasil analisis AI bersifat rekomendasi otomatis. Hasil dapat berbeda
          jika pengguna melakukan review ulang, meskipun CV dan posisi tujuan
          yang digunakan sama.
        </p>
        <p>
          Pengguna bertanggung jawab untuk meninjau kembali hasil analisis
          sebelum menerapkannya pada CV. Solid CV tidak bertanggung jawab atas
          keputusan rekrutmen, hasil lamaran kerja, atau interpretasi pihak
          ketiga terhadap CV pengguna.
        </p>
      </>
    ),
  },
  {
    id: "file-cv",
    title: "File CV dan data pengguna",
    content: (
      <p>
        File CV diproses untuk kebutuhan analisis dan tidak dimaksudkan untuk
        disimpan sebagai dokumen permanen. Detail lebih lanjut dijelaskan dalam{" "}
        <Link href="/privacy">Kebijakan Privasi</Link>.
      </p>
    ),
  },
  {
    id: "penghapusan",
    title: "Penghapusan review dan akun",
    content: (
      <>
        <p>
          Pengguna dapat menghapus hasil review CV melalui fitur yang tersedia
          di aplikasi. Penghapusan hasil review akan menghapus data hasil
          analisis dari database aplikasi, tetapi tidak mengembalikan kuota yang
          sudah digunakan.
        </p>
        <p>
          Pengguna dapat meminta penghapusan akun dengan menghubungi email
          kontak resmi. Kami dapat meminta verifikasi tambahan untuk memastikan
          bahwa permintaan benar-benar berasal dari pemilik akun.
        </p>
        <p>
          Penghapusan akun dapat menyebabkan pengguna kehilangan akses ke
          riwayat review, kuota, entitlement, dan data lain yang terkait dengan
          akun. Data tertentu dapat tetap disimpan secara terbatas jika
          diperlukan untuk hukum, keamanan, audit transaksi, atau penyelesaian
          sengketa.
        </p>
      </>
    ),
  },
  {
    id: "kuota-paket",
    title: "Kuota dan paket",
    content: (
      <>
        <p>
          Solid CV menyediakan empat status akun dengan kuota yang berbeda:
          Guest 1 review / 24 jam, Free (login) 15 review / bulan, Paid Basic 60
          review / 30 hari, dan Paid Pro 180 review / 30 hari.
        </p>
        <p>
          Kuota dihitung berdasarkan review yang berhasil dibuat. Kegagalan
          upload, file invalid, atau kegagalan sistem tertentu tidak selalu
          dihitung sebagai penggunaan kuota.
        </p>
        <p>
          Penghapusan hasil review tidak mengembalikan kuota yang digunakan.
        </p>
      </>
    ),
  },
  {
    id: "pembayaran",
    title: "Pembayaran, refund, dan pembatalan",
    content: (
      <>
        <p>
          Pembayaran paket berbayar diproses melalui Duitku. Paket akan aktif
          setelah sistem menerima dan memvalidasi callback pembayaran.
        </p>
        <p>
          Selama mode sandbox atau masa uji coba, transaksi dapat digunakan
          untuk verifikasi integrasi dan belum tentu merepresentasikan transaksi
          produksi.
        </p>
        <p>
          Untuk MVP atau masa uji coba awal, pembelian paket bersifat one-time
          untuk periode tertentu dan tidak otomatis recurring. Kebijakan refund
          atau pembatalan akan mengikuti ketentuan yang ditampilkan pada halaman
          paket atau komunikasi resmi Solid CV.
        </p>
      </>
    ),
  },
  {
    id: "ketersediaan",
    title: "Ketersediaan dan perubahan layanan",
    content: (
      <>
        <p>
          Kami berupaya menjaga layanan tetap tersedia, tetapi tidak menjamin
          layanan selalu bebas gangguan, bebas error, atau tersedia tanpa
          interupsi. Layanan dapat terganggu karena maintenance, gangguan
          penyedia AI, payment gateway, hosting, database, atau faktor lain di
          luar kendali kami.
        </p>
        <p>
          Solid CV dapat mengubah fitur, kuota, paket, harga, atau ketentuan
          layanan dari waktu ke waktu. Perubahan penting akan ditampilkan di
          aplikasi atau halaman terkait.
        </p>
      </>
    ),
  },
  {
    id: "tanggung-jawab",
    title: "Batasan tanggung jawab",
    content: (
      <p>
        Sepanjang diperbolehkan oleh hukum yang berlaku, Solid CV tidak
        bertanggung jawab atas kehilangan peluang kerja, keputusan rekrutmen,
        kerugian tidak langsung, atau kerugian yang timbul dari penggunaan hasil
        analisis AI tanpa peninjauan mandiri oleh pengguna.
      </p>
    ),
  },
  {
    id: "pelanggaran-hukum-kontak",
    title: "Pelanggaran, hukum yang berlaku, dan kontak",
    content: (
      <>
        <p>
          Kami dapat membatasi, menangguhkan, atau menghentikan akses pengguna
          jika terdapat indikasi penyalahgunaan sistem, pelanggaran ketentuan,
          eksploitasi kuota/payment, atau aktivitas yang merugikan layanan
          maupun pengguna lain.
        </p>
        <p>
          Syarat dan Ketentuan ini mengikuti hukum yang berlaku di Republik
          Indonesia, termasuk ketentuan terkait pelindungan data pribadi dan
          transaksi elektronik yang relevan.
        </p>
        <p>
          Untuk pertanyaan terkait Syarat dan Ketentuan ini, hubungi{" "}
          {companyName} melalui email{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Halaman kontak
          tersedia di <Link href="/contact">/contact</Link>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Terms of Service"
      title="Syarat dan Ketentuan Solid CV"
      description="Ketentuan penggunaan Solid CV, termasuk penggunaan layanan, hasil AI, kuota, pembayaran, penghapusan data, dan batasan tanggung jawab."
      lastUpdated={lastUpdated}
      summaryItems={[
        "Solid CV memberi rekomendasi, bukan jaminan hasil rekrutmen.",
        "Pengguna bertanggung jawab atas CV dan data yang diunggah.",
        "Kuota dihitung dari review yang berhasil dibuat.",
        "Paket aktif setelah callback pembayaran tervalidasi.",
      ]}
      sections={termsSections}
      relatedLink={{
        href: "/privacy",
        label: "Baca Privacy Policy",
      }}
    />
  );
}
