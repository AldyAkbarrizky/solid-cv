import Link from "next/link";
import { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { companyName, supportEmail } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Privacy Policy - Solid CV",
  description:
    "Kebijakan privasi Solid CV terkait pemrosesan CV, akun, riwayat review, quota, dan pembayaran.",
};

const lastUpdated = "19 Mei 2026";

const privacySections = [
  {
    id: "ringkasan",
    title: "Ringkasan",
    content: (
      <>
        <p>
          Solid CV membantu pengguna meninjau CV berdasarkan struktur, kejelasan
          isi, relevansi dengan posisi tujuan, dan rekomendasi perbaikan. Hasil
          analisis bersifat rekomendasi dan tidak menjamin pengguna diterima
          kerja.
        </p>
        <p>
          Kami menerapkan pendekatan data minimal. File CV yang diunggah tidak
          dimaksudkan untuk disimpan sebagai dokumen permanen. File diproses
          sementara untuk membaca teks dan menghasilkan analisis.
        </p>
      </>
    ),
  },
  {
    id: "data-yang-diproses",
    title: "Data yang kami proses",
    content: (
      <>
        <p>
          Bergantung pada cara Anda menggunakan layanan, kami dapat memproses:
        </p>
        <ul>
          <li>Data akun, seperti nama dan email dari login Google.</li>
          <li>File CV yang Anda unggah untuk dianalisis secara sementara.</li>
          <li>
            Teks hasil ekstraksi dari CV untuk dikirim ke sistem analisis.
          </li>
          <li>
            Posisi tujuan, catatan tambahan, dan preferensi yang Anda isi.
          </li>
          <li>
            Hasil analisis CV, seperti skor, ringkasan, rekomendasi, dan riwayat
            review.
          </li>
          <li>
            Data penggunaan, seperti kuota review, riwayat pemakaian, waktu
            review, dan status paket.
          </li>
          <li>
            Data teknis, seperti hashed identifier dari IP dan user-agent untuk
            rate limit dan pencegahan penyalahgunaan.
          </li>
          <li>
            Data pembayaran terbatas, seperti status order, plan, nominal,
            merchant order ID, dan referensi pembayaran dari Duitku.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "data-yang-tidak-disimpan",
    title: "Data yang tidak kami simpan",
    content: (
      <>
        <p>
          Solid CV tidak menyimpan file CV asli sebagai dokumen permanen.
          Setelah teks diekstrak untuk proses analisis, file asli tidak
          digunakan lagi oleh sistem.
        </p>
        <p>
          Kami juga tidak menyimpan data kartu, rekening, atau informasi
          sensitif pembayaran lain yang diproses oleh penyedia payment gateway.
        </p>
      </>
    ),
  },
  {
    id: "tujuan-pemrosesan",
    title: "Tujuan pemrosesan data",
    content: (
      <>
        <p>Kami memproses data untuk:</p>
        <ul>
          <li>Menyediakan fitur review CV berbasis AI.</li>
          <li>Menyimpan riwayat hasil review untuk pengguna yang login.</li>
          <li>Mengelola kuota review berdasarkan status akun dan paket.</li>
          <li>Memproses pembayaran dan aktivasi paket berbayar.</li>
          <li>Mencegah penyalahgunaan sistem, spam, dan abuse endpoint.</li>
          <li>Meningkatkan keamanan, stabilitas, dan kualitas layanan.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-dan-pihak-ketiga",
    title: "Penggunaan AI dan pihak ketiga",
    content: (
      <>
        <p>
          Untuk menghasilkan analisis CV, teks dari CV yang sudah diproses dapat
          dikirim ke penyedia layanan AI yang digunakan oleh Solid CV. Kami
          berupaya melakukan masking terhadap informasi pribadi seperti email,
          nomor telepon, URL, dan nomor identitas sebelum teks dikirim ke
          penyedia AI.
        </p>
        <p>
          Masking otomatis tidak selalu sempurna. Pengguna disarankan untuk
          tidak mengunggah CV yang memuat informasi yang tidak diperlukan untuk
          proses review.
        </p>
        <p>Layanan pihak ketiga yang dapat digunakan meliputi:</p>
        <ul>
          <li>Google OAuth untuk autentikasi akun.</li>
          <li>Groq atau DeepSeek untuk proses analisis AI.</li>
          <li>Neon DB untuk penyimpanan database.</li>
          <li>Duitku untuk pemrosesan pembayaran.</li>
          <li>Vercel atau penyedia hosting lain untuk menjalankan aplikasi.</li>
        </ul>
      </>
    ),
  },
  {
    id: "retensi",
    title: "Penyimpanan dan retensi data",
    content: (
      <>
        <p>
          Hasil review CV disimpan selama 30 hari secara default agar pengguna
          dapat membuka kembali hasil analisis. Periode ini dapat berbeda sesuai
          konfigurasi sistem. Pengguna dapat menghapus hasil review lebih awal
          melalui tombol hapus yang tersedia di aplikasi.
        </p>
        <p>
          Penghapusan hasil review tidak selalu mengembalikan kuota yang sudah
          digunakan.
        </p>
      </>
    ),
  },
  {
    id: "pembayaran",
    title: "Pembayaran",
    content: (
      <>
        <p>
          Pembayaran paket berbayar diproses melalui Duitku. Solid CV hanya
          menyimpan informasi yang diperlukan untuk mencocokkan transaksi,
          seperti merchant order ID, referensi transaksi, nominal, plan, dan
          status pembayaran.
        </p>
        <p>
          Aktivasi paket hanya dilakukan setelah callback pembayaran dari Duitku
          diterima dan tervalidasi oleh sistem. Halaman return setelah
          pembayaran tidak digunakan sebagai bukti pembayaran final.
        </p>
      </>
    ),
  },
  {
    id: "keamanan",
    title: "Keamanan",
    content: (
      <>
        <p>
          Kami menerapkan beberapa langkah keamanan dasar, termasuk validasi
          upload file, pembatasan ukuran file, rate limit, penyimpanan secret di
          server-side environment variables, security headers, dan pembatasan
          akses terhadap hasil review yang terhubung ke akun tertentu.
        </p>
        <p>
          Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko.
          Pengguna tetap perlu berhati-hati dan hanya mengunggah CV yang relevan
          untuk dianalisis.
        </p>
      </>
    ),
  },
  {
    id: "hak-pengguna",
    title: "Hak pengguna",
    content: (
      <p>
        Sesuai prinsip pelindungan data pribadi, pengguna dapat meminta akses,
        koreksi, pembaruan, atau penghapusan data pribadi tertentu yang diproses
        oleh Solid CV, sepanjang permintaan tersebut dapat diverifikasi dan
        sesuai dengan ketentuan hukum yang berlaku.
      </p>
    ),
  },
  {
    id: "penghapusan",
    title: "Penghapusan review dan akun",
    content: (
      <>
        <p>
          Pengguna dapat menghapus hasil review CV melalui tombol hapus pada
          halaman hasil review. Jika hasil review dihapus, data hasil analisis
          terkait akan dihapus dari database aplikasi.
        </p>
        <p>
          Penghapusan hasil review tidak mengembalikan kuota yang sudah
          digunakan, karena kuota dihitung berdasarkan proses review yang
          berhasil dibuat.
        </p>
        <p>
          Untuk review yang terhubung ke akun, akses dan penghapusan hanya dapat
          dilakukan oleh pemilik akun. Untuk mode guest, siapa pun yang memiliki
          URL hasil review dapat membuka hasil selama belum kedaluwarsa,
          sehingga pengguna wajib menjaga URL tersebut.
        </p>
        <p>
          Pengguna dapat meminta penghapusan akun dengan menghubungi email
          kontak resmi. Permintaan perlu dikirim menggunakan email yang sama
          dengan akun Google yang digunakan untuk login, atau disertai informasi
          lain yang cukup untuk verifikasi kepemilikan akun.
        </p>
        <p>
          Beberapa data dapat tetap disimpan secara terbatas jika diperlukan
          untuk hukum, keamanan, audit transaksi, penyelesaian sengketa, atau
          kewajiban administratif.
        </p>
      </>
    ),
  },
  {
    id: "perubahan-dan-kontak",
    title: "Perubahan kebijakan dan kontak",
    content: (
      <>
        <p>
          Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
          Perubahan akan ditampilkan di halaman ini dengan tanggal pembaruan
          terbaru.
        </p>
        <p>
          Untuk pertanyaan terkait privasi, permintaan penghapusan review, atau
          permintaan penghapusan akun, hubungi {companyName} melalui email{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
        <p>
          Anda juga dapat membuka halaman <Link href="/contact">Kontak</Link>{" "}
          untuk melihat informasi bantuan dan jenis permintaan yang dapat
          diajukan.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacy Policy"
      title="Kebijakan Privasi Solid CV"
      description="Penjelasan tentang data yang diproses Solid CV, bagaimana file CV digunakan, dan bagaimana akun, kuota, AI, serta pembayaran dikelola."
      lastUpdated={lastUpdated}
      summaryItems={[
        "File CV tidak disimpan sebagai dokumen permanen.",
        "Teks CV dapat dikirim ke penyedia AI setelah proses masking dasar.",
        "Data akun, riwayat, kuota, dan pembayaran dipakai untuk menjalankan layanan.",
        "Hasil review disimpan sementara (default 30 hari) dan dapat dihapus kapan saja.",
        "Pengguna dapat menghapus review dan meminta penghapusan akun.",
      ]}
      sections={privacySections}
      relatedLink={{
        href: "/terms",
        label: "Baca Terms of Service",
      }}
    />
  );
}
