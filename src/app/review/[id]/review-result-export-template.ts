export type ReviewExportRecommendation = {
  priority: "high" | "medium" | "low";
  title: string;
  explanation: string;
  exampleRewrite?: string;
};

export type ReviewExportPayload = {
  targetRole: string;
  jobRequirementSummary?: string | null;
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: ReviewExportRecommendation[];
  nextActions: string[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderList(items: string[]) {
  if (items.length === 0) {
    return "<li>Tidak ada data.</li>";
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderRecommendationList(recommendations: ReviewExportRecommendation[]) {
  if (recommendations.length === 0) {
    return "<li>Tidak ada rekomendasi.</li>";
  }

  return recommendations
    .map((item) => {
      const example = item.exampleRewrite
        ? `<div class="muted">Contoh: ${escapeHtml(item.exampleRewrite)}</div>`
        : "";

      return `<li>
  <strong>${escapeHtml(item.title)}</strong> (${item.priority})
  <div>${escapeHtml(item.explanation)}</div>
  ${example}
</li>`;
    })
    .join("");
}

export function buildReviewPdfHtml(payload: ReviewExportPayload) {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Review CV - ${escapeHtml(payload.targetRole)}</title>
  <style>
    :root {
      color-scheme: dark;
    }
    body {
      font-family: Inter, Arial, sans-serif;
      color: #e6edf8;
      margin: 0;
      line-height: 1.6;
      background: linear-gradient(180deg, #060d1f 0%, #081327 100%);
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .container {
      max-width: 880px;
      margin: 0 auto;
      padding: 28px 24px;
    }
    .surface {
      background: #0b1730;
      border: 1px solid #1e2b49;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 8px 24px rgba(2, 8, 23, 0.28);
    }
    h1 {
      margin: 0;
      font-size: 28px;
      line-height: 1.2;
      color: #f8fbff;
    }
    h2 {
      margin: 20px 0 8px 0;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #79a8ff;
    }
    p, li, div {
      font-size: 14px;
    }
    ul, ol {
      padding-left: 20px;
      margin: 8px 0 0 0;
    }
    li + li {
      margin-top: 4px;
    }
    .header {
      border-bottom: 1px solid #1e2b49;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }
    .meta {
      color: #a8bbdd;
      margin-top: 6px;
      font-size: 13px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .panel {
      background: #0e1d3b;
      border: 1px solid #24365a;
      border-radius: 10px;
      padding: 12px;
    }
    .section-block + .section-block {
      margin-top: 14px;
    }
    .muted {
      color: #9eb1d4;
      margin-top: 4px;
    }
    .disclaimer {
      margin-top: 20px;
      color: #9eb1d4;
      font-size: 12px;
      border-top: 1px solid #1e2b49;
      padding-top: 12px;
    }
    .print-hint {
      margin-top: 10px;
      color: #9eb1d4;
      font-size: 12px;
    }
    @media print {
      @page {
        margin: 10mm;
      }
      .container {
        padding: 0;
      }
      .print-hint {
        display: none;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
    }
  </style>
</head>
<body>
  <main class="container">
    <section class="surface">
      <header class="header">
        <h1>Review CV untuk ${escapeHtml(payload.targetRole)}</h1>
        <div class="meta">Skor CV: ${payload.overallScore}/100</div>
      </header>

      <section class="section-block">
        <h2>Ringkasan</h2>
        <p>${escapeHtml(payload.summary)}</p>
      </section>

      ${
        payload.jobRequirementSummary
          ? `<section class="section-block panel">
        <h2>Requirement pekerjaan</h2>
        <p>${escapeHtml(payload.jobRequirementSummary)}</p>
      </section>`
          : ""
      }

      <section class="section-block grid">
        <div class="panel">
          <h2>Kekuatan CV</h2>
          <ul>${renderList(payload.strengths)}</ul>
        </div>
        <div class="panel">
          <h2>Area yang perlu diperbaiki</h2>
          <ul>${renderList(payload.weaknesses)}</ul>
        </div>
      </section>

      <section class="section-block panel">
        <h2>Rekomendasi perbaikan</h2>
        <ol>${renderRecommendationList(payload.recommendations)}</ol>
      </section>

      <section class="section-block panel">
        <h2>Langkah berikutnya</h2>
        <ul>${renderList(payload.nextActions)}</ul>
      </section>

      <p class="disclaimer">
        Hasil ini bersifat rekomendasi dan tidak menjamin diterima kerja.
      </p>
      <p class="print-hint">
        Jika dialog cetak tidak muncul otomatis, tekan Cmd+P / Ctrl+P lalu pilih "Save as PDF".
      </p>
    </section>
  </main>
  <script>
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        window.print();
      }, 180);
    });
  </script>
</body>
</html>`;
}
