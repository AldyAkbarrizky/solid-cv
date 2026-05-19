type ExtractTextParams = {
  buffer: Buffer;
  fileKind: "pdf" | "docx";
};

// Represents a single text item from pdfjs-dist v2 getTextContent()
type PdfTextItem = {
  str: string;
  transform: number[]; // [scaleX, skewX, skewY, scaleY, x, y]
  width: number;
  height: number;
};

/**
 * Custom page renderer for pdf-parse that reconstructs spacing between text
 * items based on their X/Y coordinates.
 *
 * pdfjs-dist extracts text as individual positioned items. When two items are
 * on the same line, it does NOT automatically insert a space between them —
 * resulting in words being concatenated ("Designingglobaldesignsystems").
 *
 * We fix this by:
 *   1. Detecting line breaks via Y-coordinate jumps > 50% of character height.
 *   2. Inserting a space between same-line items when the horizontal gap
 *      between the end of the previous item and the start of the current item
 *      exceeds 15% of character height (≈ a thin space in most fonts).
 */
type PdfPage = {
  getTextContent: (options?: {
    normalizeWhitespace?: boolean;
  }) => Promise<{ items: PdfTextItem[] }>;
};

async function renderPdfPage(pageData: PdfPage): Promise<string> {
  const textContent = (await pageData.getTextContent({
    normalizeWhitespace: true,
  })) as { items: PdfTextItem[] };

  let text = "";
  let lastY: number | null = null;
  let lastX = 0;
  let lastWidth = 0;
  let charHeight = 10;

  for (const item of textContent.items) {
    const str = item.str ?? "";
    const x = item.transform[4];
    const y = item.transform[5];
    const width = item.width ?? 0;

    // Use item.height; fall back to the absolute scaleY value in the matrix
    const rawHeight =
      item.height > 0 ? item.height : Math.abs(item.transform[3]);
    if (rawHeight > 0) charHeight = rawHeight;

    if (lastY === null) {
      // First item on the page
      text += str;
    } else if (Math.abs(y - lastY) > charHeight * 0.5) {
      // Y jumped enough to be a new line
      text += "\n" + str;
    } else {
      // Same line — insert a space when there is a visible gap between items
      const gap = x - (lastX + lastWidth);
      text += (gap > charHeight * 0.15 ? " " : "") + str;
    }

    lastY = y;
    lastX = x;
    lastWidth = width;
  }

  return text;
}

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
    const result = await pdfParse(buffer, { pagerender: renderPdfPage });
    return normalizeText(result.text || "");
  }

  if (fileKind === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value || "");
  }

  throw new Error("Format file tidak didukung.");
}
