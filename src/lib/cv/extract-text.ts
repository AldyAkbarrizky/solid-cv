type ExtractTextParams = {
  buffer: Buffer;
  fileKind: "pdf" | "docx";
};

let isPdfWorkerConfigured = false;

function normalizeText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function ensurePdfWorker() {
  if (isPdfWorkerConfigured) {
    return;
  }

  const [{ PDFParse }, { createRequire }, { pathToFileURL }] = await Promise.all(
    [
      import("pdf-parse"),
      import("node:module"),
      import("node:url"),
    ],
  );

  const require = createRequire(import.meta.url);
  const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  PDFParse.setWorker(pathToFileURL(workerPath).href);

  isPdfWorkerConfigured = true;
}

export async function extractTextFromCV({
  buffer,
  fileKind,
}: ExtractTextParams) {
  if (fileKind === "pdf") {
    await ensurePdfWorker();

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });

    try {
      const result = await parser.getText();
      return normalizeText(result.text || "");
    } finally {
      await parser.destroy();
    }
  }

  if (fileKind === "docx") {
    const mammoth = await import("mammoth");

    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value || "");
  }

  throw new Error("Format file tidak didukung.");
}
