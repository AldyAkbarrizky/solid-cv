import { CVReviewResult } from "../cv-review-types";

type BuildATSCVPromptParams = {
  cvText: string;
  targetRole: string;
  jobRequirement?: string;
  reviewResult: CVReviewResult;
};

export function buildATSCVSystemPrompt() {
  return `
Anda adalah asisten penulisan CV ATS untuk pasar kerja Indonesia.

Aturan wajib:
- Gunakan HANYA data yang ada di CV sumber.
- Dilarang menambah pengalaman, jabatan, perusahaan, tanggal, metrik, skill, sertifikasi, atau proyek yang tidak tertulis di CV sumber.
- Jika suatu detail tidak ada, kosongkan field tersebut atau gunakan array kosong. Jangan membuat placeholder seperti [Lengkapi ...].
- Pertahankan fakta asli, Anda hanya boleh merapikan struktur, bahasa, dan urutan.
- Jawab dalam Bahasa Indonesia.
- Output WAJIB JSON valid tanpa markdown code block.

Struktur JSON wajib:
{
  "candidateName": string,
  "contact": {
    "email": string,
    "phone": string,
    "location": string,
    "links": string[]
  },
  "headline": string,
  "summary": string,
  "skills": [
    {
      "category": string,
      "items": string[]
    }
  ],
  "experiences": [
    {
      "title": string,
      "company": string,
      "location": string,
      "period": string,
      "bullets": string[]
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string,
      "bullets": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "period": string,
      "details": string[]
    }
  ],
  "certifications": string[],
  "additionalSections": [
    {
      "title": string,
      "items": string[]
    }
  ],
  "dataUseChecklist": string[]
}

Ketentuan struktur:
- Gunakan nama kandidat dari CV sumber. Jika tidak ada, isi candidateName dengan "Kandidat".
- Contact hanya boleh berisi data kontak yang ada di CV sumber dan tidak dimasking.
- Experiences wajib dipisah per role/perusahaan/periode jika datanya tersedia.
- Bullets pengalaman harus berupa kalimat aksi ringkas dari data CV sumber.
- Skills hanya boleh memakai skill yang tertulis di CV sumber.
- Projects, education, certifications, dan additionalSections hanya diisi jika datanya ada di CV sumber.
- Jangan tulis format Markdown di field mana pun.
- Jangan gunakan tanda markdown seperti **bold**, # heading, atau bullet prefix di dalam string.
- Jangan menulis placeholder seperti "[Lengkapi detail ini]", "[Tambahkan ...]", atau "[Nama Kandidat]".
- Fokus pada format ATS: ringkas, jelas, dan mudah dipindai.
- Jangan menulis informasi sensitif yang sudah dimasking sebagai data asli.
- Jika token masking muncul (mis. [EMAIL], [PHONE], [ID_NUMBER], [URL]), kosongkan field terkait. Jangan tampilkan token masking di CV akhir.

Ketentuan dataUseChecklist:
- Isi 5-8 poin singkat tentang data apa saja yang dipakai dari CV sumber.
- Tidak boleh menambahkan data baru.
`.trim();
}

export function buildATSCVUserPrompt({
  cvText,
  targetRole,
  jobRequirement,
  reviewResult,
}: BuildATSCVPromptParams) {
  const recommendationText =
    reviewResult.recommendations.length > 0
      ? reviewResult.recommendations
          .map(
            (item, index) =>
              `${index + 1}. ${item.title} [${item.priority}] - ${item.explanation}`,
          )
          .join("\n")
      : "-";

  return `
Target posisi:
${targetRole}

Requirement pekerjaan (opsional):
${jobRequirement || "-"}

Poin hasil review yang perlu diterapkan:
- Ringkasan: ${reviewResult.summary}
- Area perbaikan:
${reviewResult.weaknesses.map((item) => `  - ${item}`).join("\n") || "  - -"}
- Rekomendasi:
${recommendationText}

CV sumber (sudah dimasking):
${cvText}

Tugas:
Susun ulang CV menjadi versi ATS-ready dalam Bahasa Indonesia, tetap setia 100% pada data CV sumber. Jangan mengarang informasi baru.
`.trim();
}
