type ExtractTextParams = {
  buffer: Buffer;
  fileKind: "pdf" | "docx";
};

function normalizeText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractTextFromCV({
  buffer,
  fileKind,
}: ExtractTextParams) {
  if (fileKind === "pdf") {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return normalizeText(result.text || "");
  }

  if (fileKind === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value || "");
  }

  throw new Error("Format file tidak didukung.");
}
