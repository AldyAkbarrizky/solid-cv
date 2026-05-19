import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { supportEmail, companyName } from "@/lib/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Solid CV",
  description:
    "Kebijakan privasi Solid CV terkait pemrosesan CV, akun, riwayat review, quota, dan pembayaran.",
};

const lastUpdated = "19 Mei 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader backHref="/" backLabel="Beranda" />

      <section className="mx-auto w-full max-w-4xl px-5 py-10 md:py-14">
        <p className="text-sm font-medium text-primary">Privacy Policy</p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          Kebijakan Privasi Solid CV
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          Terakhir diperbarui: {lastUpdated}
        </p>

        <Card className="mt-8 bg-white shadow-sm">
          <CardContent className="prose prose-slate max-w-none p-6 prose-headings:scroll-mt-24 prose-headings:text-slate-950 prose-p:leading-7 prose-li:leading-7">
            <h2>1. Ringkasan</h2>
            <p>
              Solid CV adalah aplikasi web untuk membantu pengguna meninjau CV
              berdasarkan struktur, kejelasan isi, relevansi dengan posisi yang
              dituju, dan rekomendasi perbaikan. Hasil analisis bersifat
              rekomendasi dan tidak menjamin pengguna diterima kerja.
            </p>

            <p>
              Kami menerapkan pendekatan data minimal. File CV yang diunggah
              tidak dimaksudkan untuk disimpan sebagai dokumen permanen. File CV
              diproses sementara untuk membaca teks dan menghasilkan analisis.
            </p>

            <h2>2. Data yang Kami Proses</h2>
            <p>
              Bergantung pada cara Anda menggunakan layanan, kami dapat
              memproses data berikut:
            </p>

            <ul>
              <li>Data akun, seperti nama dan email dari login Google.</li>
              <li>
                File CV yang Anda unggah untuk dianalisis secara sementara.
              </li>
              <li>
                Teks hasil ekstraksi dari CV untuk dikirim ke sistem analisis.
              </li>
              <li>
                Posisi tujuan, catatan tambahan, dan preferensi yang Anda isi.
              </li>
              <li>
                Hasil analisis CV, seperti skor, ringkasan, rekomendasi, dan
                riwayat review.
              </li>
              <li>
                Data penggunaan, seperti kuota review, riwayat pemakaian, waktu
                review, dan status paket.
              </li>
              <li>
                Data teknis, seperti hashed identifier dari IP dan user-agent
                untuk rate limit dan pencegahan penyalahgunaan.
              </li>
              <li>
                Data pembayaran terbatas, seperti status order, plan, nominal,
                merchant order ID, dan referensi pembayaran dari Duitku.
              </li>
            </ul>

            <h2>3. Data yang Tidak Kami Simpan</h2>
            <p>
              Solid CV tidak menyimpan file CV asli sebagai dokumen permanen.
              Setelah teks diekstrak untuk proses analisis, file asli tidak
              digunakan lagi oleh sistem.
            </p>

            <p>
              Kami juga tidak menyimpan data kartu, rekening, atau informasi
              sensitif pembayaran lain yang diproses oleh penyedia payment
              gateway.
            </p>

            <h2>4. Tujuan Pemrosesan Data</h2>
            <p>Kami memproses data untuk:</p>

            <ul>
              <li>Menyediakan fitur review CV berbasis AI.</li>
              <li>Menyimpan riwayat hasil review untuk pengguna yang login.</li>
              <li>Mengelola quota review berdasarkan status akun dan paket.</li>
              <li>Memproses pembayaran dan aktivasi paket berbayar.</li>
              <li>Mencegah penyalahgunaan sistem, spam, dan abuse endpoint.</li>
              <li>Meningkatkan keamanan, stabilitas, dan kualitas layanan.</li>
            </ul>

            <h2>5. Penggunaan AI dan Pihak Ketiga</h2>
            <p>
              Untuk menghasilkan analisis CV, teks dari CV yang sudah diproses
              dapat dikirim ke penyedia layanan AI yang digunakan oleh Solid CV.
              Kami berupaya melakukan masking terhadap informasi pribadi seperti
              email, nomor telepon, URL, dan nomor identitas sebelum teks
              dikirim ke penyedia AI.
            </p>

            <p>
              Namun, masking otomatis tidak selalu sempurna. Pengguna disarankan
              untuk tidak mengunggah CV yang memuat informasi yang tidak
              diperlukan untuk proses review.
            </p>

            <p>Layanan pihak ketiga yang dapat digunakan meliputi:</p>

            <ul>
              <li>Google OAuth untuk autentikasi akun.</li>
              <li>Groq atau DeepSeek untuk proses analisis AI.</li>
              <li>Neon DB untuk penyimpanan database.</li>
              <li>Duitku untuk pemrosesan pembayaran.</li>
              <li>
                Vercel atau penyedia hosting lain untuk menjalankan aplikasi.
              </li>
            </ul>

            <h2>6. Penyimpanan dan Retensi Data</h2>
            <p>
              Hasil review CV dapat disimpan sementara agar pengguna dapat
              membuka kembali hasil analisis. Retensi default dapat dibatasi
              sesuai konfigurasi sistem, misalnya 7 hari untuk hasil review
              sementara atau sesuai kebutuhan paket pengguna.
            </p>

            <p>
              Pengguna dapat menghapus hasil review melalui fitur yang tersedia
              di aplikasi. Penghapusan hasil review tidak selalu mengembalikan
              kuota yang sudah digunakan.
            </p>

            <h2>7. Pembayaran</h2>
            <p>
              Pembayaran paket berbayar diproses melalui Duitku. Solid CV hanya
              menyimpan informasi yang diperlukan untuk mencocokkan transaksi,
              seperti merchant order ID, referensi transaksi, nominal, plan, dan
              status pembayaran.
            </p>

            <p>
              Aktivasi paket hanya dilakukan setelah callback pembayaran dari
              Duitku diterima dan tervalidasi oleh sistem. Halaman return
              setelah pembayaran tidak digunakan sebagai bukti pembayaran final.
            </p>

            <h2>8. Keamanan</h2>
            <p>
              Kami menerapkan beberapa langkah keamanan dasar, termasuk validasi
              upload file, pembatasan ukuran file, rate limit, penyimpanan
              secret di server-side environment variables, security headers, dan
              pembatasan akses terhadap hasil review yang terhubung ke akun
              tertentu.
            </p>

            <p>
              Meskipun demikian, tidak ada sistem yang sepenuhnya bebas risiko.
              Pengguna tetap perlu berhati-hati dan hanya mengunggah CV yang
              relevan untuk dianalisis.
            </p>

            <h2>9. Hak Pengguna</h2>
            <p>
              Sesuai prinsip pelindungan data pribadi, pengguna dapat meminta
              akses, koreksi, pembaruan, atau penghapusan data pribadi tertentu
              yang diproses oleh Solid CV, sepanjang permintaan tersebut dapat
              diverifikasi dan sesuai dengan ketentuan hukum yang berlaku.
            </p>

            <h2 id="delete-policy">
              10. Kebijakan Penghapusan Review dan Akun
            </h2>

            <h3>10.1 Penghapusan Hasil Review</h3>
            <p>
              Pengguna dapat menghapus hasil review CV melalui tombol hapus pada
              halaman hasil review. Jika hasil review dihapus, data hasil
              analisis terkait akan dihapus dari database aplikasi.
            </p>

            <p>
              Penghapusan hasil review tidak mengembalikan kuota yang sudah
              digunakan, karena kuota dihitung berdasarkan proses review yang
              berhasil dibuat, bukan berdasarkan apakah hasil review masih
              disimpan.
            </p>

            <p>
              Untuk hasil review yang terhubung ke akun, akses dan penghapusan
              hasil review hanya dapat dilakukan oleh pemilik akun yang sesuai.
              Untuk hasil review dalam mode guest, siapa pun yang memiliki URL
              hasil review dapat membuka hasil tersebut selama hasil belum
              kedaluwarsa, sehingga pengguna wajib menjaga URL tersebut.
            </p>

            <h3>10.2 Penghapusan Akun</h3>
            <p>
              Pengguna dapat meminta penghapusan akun dengan menghubungi kami
              melalui email kontak resmi. Permintaan perlu dikirim menggunakan
              email yang sama dengan akun Google yang digunakan untuk login,
              atau disertai informasi lain yang cukup untuk verifikasi
              kepemilikan akun.
            </p>

            <p>
              Setelah permintaan diverifikasi, kami akan menghapus atau
              menganonimkan data yang tidak lagi diperlukan untuk penyediaan
              layanan, termasuk hasil review CV yang terhubung ke akun, data
              quota penggunaan, dan entitlement aktif jika tidak lagi relevan.
            </p>

            <p>
              Beberapa data dapat tetap disimpan secara terbatas jika diperlukan
              untuk kepentingan hukum, keamanan, audit transaksi, penyelesaian
              sengketa, atau kewajiban administratif, misalnya data transaksi
              pembayaran yang diperlukan untuk rekonsiliasi dengan payment
              gateway.
            </p>

            <h3>10.3 Data Pembayaran</h3>
            <p>
              Data pembayaran yang diproses melalui Duitku tidak dihapus secara
              otomatis saat hasil review dihapus. Data pembayaran tertentu dapat
              tetap disimpan secara terbatas untuk audit, pencocokan transaksi,
              investigasi penyalahgunaan, atau kewajiban hukum yang berlaku.
            </p>

            <h2>11. Perubahan Kebijakan</h2>
            <p>
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
              Perubahan akan ditampilkan di halaman ini dengan tanggal pembaruan
              terbaru.
            </p>

            <h2>12. Kontak</h2>
            <p>
              Untuk pertanyaan terkait privasi, permintaan penghapusan hasil
              review, atau permintaan penghapusan akun, hubungi {companyName}{" "}
              melalui email{" "}
              <a href={`mailto:${supportEmail}`} className="text-primary">
                {supportEmail}
              </a>
              .
            </p>

            <p>
              Anda juga dapat membuka halaman{" "}
              <Link href="/contact" className="text-primary">
                Kontak
              </Link>{" "}
              untuk melihat informasi bantuan dan jenis permintaan yang dapat
              diajukan.
            </p>

            <p className="not-prose mt-8 text-sm text-muted-foreground">
              Lihat juga{" "}
              <Link href="/terms" className="font-medium text-primary">
                Terms of Service
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
