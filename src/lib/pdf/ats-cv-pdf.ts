import type { ATSCVResult } from "@/lib/ai/ats-cv-types";

type TextStyle = {
  size?: number;
  font?: "regular" | "bold";
  color?: [number, number, number];
  lineGap?: number;
  indent?: number;
  align?: "left" | "center";
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 44;
const MARGIN_TOP = 44;
const MARGIN_BOTTOM = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function normalizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/^\s*[-*•]\s+/, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfString(value: string) {
  return normalizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function estimateTextWidth(text: string, fontSize: number) {
  return normalizePdfText(text).length * fontSize * 0.48;
}

function wrapText(text: string, maxWidth: number, fontSize: number) {
  const normalized = normalizePdfText(text);
  if (!normalized) return [];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      lines.push(word);
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function clampTextX(x: number) {
  return Math.max(MARGIN_X, Math.min(PAGE_WIDTH - MARGIN_X, x));
}

class SimplePdfDocument {
  private pages: string[][] = [];
  private currentPage: string[] = [];
  private y = PAGE_HEIGHT - MARGIN_TOP;

  constructor() {
    this.addPage();
  }

  addPage() {
    this.currentPage = [];
    this.pages.push(this.currentPage);
    this.y = PAGE_HEIGHT - MARGIN_TOP;
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN_BOTTOM) {
      this.addPage();
    }
  }

  ensureBlockSpace(height: number) {
    this.ensureSpace(height);
  }

  private setTextColor([r, g, b]: [number, number, number]) {
    this.currentPage.push(`${r} ${g} ${b} rg`);
  }

  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.currentPage.push("0.42 0.47 0.55 RG");
    this.currentPage.push("0.6 w");
    this.currentPage.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m`);
    this.currentPage.push(`${x2.toFixed(2)} ${y2.toFixed(2)} l`);
    this.currentPage.push("S");
  }

  private drawTextLine(
    value: string,
    x: number,
    y: number,
    style: TextStyle = {},
  ) {
    const normalized = normalizePdfText(value);
    if (!normalized) return;

    const fontSize = style.size ?? 10;
    const fontName = style.font === "bold" ? "F2" : "F1";

    this.setTextColor(style.color ?? [0.08, 0.1, 0.16]);
    this.currentPage.push("BT");
    this.currentPage.push(`/${fontName} ${fontSize} Tf`);
    this.currentPage.push(`${clampTextX(x).toFixed(2)} ${y.toFixed(2)} Td`);
    this.currentPage.push(`(${escapePdfString(normalized)}) Tj`);
    this.currentPage.push("ET");
  }

  moveDown(value: number) {
    this.y -= value;
  }

  text(value: string, style: TextStyle = {}) {
    const fontSize = style.size ?? 10;
    const lineGap = style.lineGap ?? 4;
    const indent = style.indent ?? 0;
    const lineHeight = fontSize + lineGap;
    const lines = wrapText(value, CONTENT_WIDTH - indent, fontSize);

    for (const line of lines) {
      this.ensureSpace(lineHeight);
      const textWidth = estimateTextWidth(line, fontSize);
      const x =
        style.align === "center"
          ? MARGIN_X + (CONTENT_WIDTH - textWidth) / 2
          : MARGIN_X + indent;

      this.drawTextLine(line, x, this.y, style);
      this.y -= lineHeight;
    }
  }

  sectionTitle(value: string) {
    const title = normalizePdfText(value).toUpperCase();
    if (!title) return;

    this.ensureSpace(28);
    this.moveDown(8);
    this.drawTextLine(title, MARGIN_X, this.y, {
      size: 9.5,
      font: "bold",
      color: [0.14, 0.15, 0.17],
    });
    this.y -= 5;
    this.drawLine(MARGIN_X, this.y, PAGE_WIDTH - MARGIN_X, this.y);
    this.y -= 10;
  }

  bullet(value: string) {
    const normalized = normalizePdfText(value);
    if (!normalized) return;

    const fontSize = 9.3;
    const lineGap = 3.2;
    const lineHeight = fontSize + lineGap;
    const textIndent = 13;
    const lines = wrapText(normalized, CONTENT_WIDTH - textIndent, fontSize);
    const style: TextStyle = {
      size: fontSize,
      color: [0.13, 0.15, 0.2],
    };

    for (const [index, line] of lines.entries()) {
      this.ensureSpace(lineHeight);

      if (index === 0) {
        this.drawTextLine("-", MARGIN_X + 2, this.y, style);
      }

      this.drawTextLine(line, MARGIN_X + textIndent, this.y, style);
      this.y -= lineHeight;
    }
  }

  render() {
    const objects: string[] = [];
    const addObject = (content: string) => {
      objects.push(content);
      return objects.length;
    };

    const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
    void catalogId;
    const pagesId = addObject("PAGES_PLACEHOLDER");
    const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

    const pageIds: number[] = [];

    for (const pageOps of this.pages) {
      const stream = pageOps.join("\n");
      const streamBuffer = Buffer.from(stream, "latin1");
      const contentId = addObject(
        `<< /Length ${streamBuffer.length} >>\nstream\n${stream}\nendstream`,
      );
      const pageId = addObject(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`,
      );
      pageIds.push(pageId);
    }

    objects[pagesId - 1] =
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

    const parts: string[] = ["%PDF-1.4\n"];
    const offsets: number[] = [0];
    let offset = Buffer.byteLength(parts[0], "latin1");

    objects.forEach((object, index) => {
      offsets.push(offset);
      const serialized = `${index + 1} 0 obj\n${object}\nendobj\n`;
      parts.push(serialized);
      offset += Buffer.byteLength(serialized, "latin1");
    });

    const xrefOffset = offset;
    const xref = [
      `xref\n0 ${objects.length + 1}`,
      "0000000000 65535 f ",
      ...offsets
        .slice(1)
        .map((item) => `${String(item).padStart(10, "0")} 00000 n `),
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>`,
      "startxref",
      String(xrefOffset),
      "%%EOF",
    ].join("\n");

    parts.push(xref);
    return Buffer.from(parts.join(""), "latin1");
  }
}

function joinDefined(values: string[]) {
  return values.map(normalizePdfText).filter(Boolean).join(" | ");
}

function addSectionIfItems(
  pdf: SimplePdfDocument,
  title: string,
  items: string[],
) {
  const validItems = items.map(normalizePdfText).filter(Boolean);
  if (validItems.length === 0) return;

  pdf.ensureBlockSpace(56);
  pdf.sectionTitle(title);
  validItems.forEach((item) => pdf.bullet(item));
}

export function generateAtsCvPdf(result: ATSCVResult) {
  const pdf = new SimplePdfDocument();
  const contactLine = joinDefined([
    result.contact.email,
    result.contact.phone,
    result.contact.location,
    ...result.contact.links,
  ]);
  const candidateName = normalizePdfText(result.candidateName) || "Kandidat";

  pdf.text(candidateName.toUpperCase(), {
    size: 20,
    font: "bold",
    color: [0.06, 0.07, 0.1],
    lineGap: 5,
    align: "center",
  });

  if (contactLine) {
    pdf.text(contactLine, {
      size: 8.6,
      color: [0.2, 0.22, 0.27],
      lineGap: 4,
      align: "center",
    });
  }

  if (result.headline) {
    pdf.text(result.headline, {
      size: 9,
      font: "bold",
      color: [0.2, 0.22, 0.27],
      lineGap: 4,
      align: "center",
    });
  }

  const summary = normalizePdfText(result.summary);

  if (summary) {
    pdf.ensureBlockSpace(72);
    pdf.sectionTitle("Ringkasan");
    pdf.text(summary, {
      size: 9.6,
      color: [0.13, 0.15, 0.2],
      lineGap: 3.4,
    });
  }

  const skillGroups = result.skills
    .map((skillGroup) => ({
      category: normalizePdfText(skillGroup.category),
      items: skillGroup.items.map(normalizePdfText).filter(Boolean),
    }))
    .filter((skillGroup) => skillGroup.category && skillGroup.items.length > 0);

  if (skillGroups.length > 0) {
    pdf.ensureBlockSpace(54);
    pdf.sectionTitle("Keahlian");
    for (const skillGroup of skillGroups) {
      pdf.text(`${skillGroup.category}: ${skillGroup.items.join(", ")}`, {
        size: 9.5,
        color: [0.13, 0.15, 0.2],
        lineGap: 3.2,
      });
    }
  }

  if (result.experiences.length > 0) {
    pdf.ensureBlockSpace(86);
    pdf.sectionTitle("Pengalaman Kerja");
    for (const experience of result.experiences) {
      const roleLine = joinDefined([
        experience.title,
        experience.company,
        experience.location,
      ]);
      pdf.ensureBlockSpace(44);
      pdf.text(roleLine, {
        size: 9.8,
        font: "bold",
        color: [0.07, 0.1, 0.17],
        lineGap: 3.2,
      });

      if (experience.period) {
        pdf.text(experience.period, {
          size: 8.6,
          color: [0.36, 0.4, 0.5],
          lineGap: 3.2,
        });
      }

      experience.bullets.forEach((bullet) => pdf.bullet(bullet));
      pdf.moveDown(3);
    }
  }

  if (result.projects.length > 0) {
    pdf.ensureBlockSpace(76);
    pdf.sectionTitle("Proyek");
    for (const project of result.projects) {
      pdf.ensureBlockSpace(38);
      pdf.text(project.name, {
        size: 9.8,
        font: "bold",
        color: [0.07, 0.1, 0.17],
        lineGap: 3.2,
      });
      if (project.description) {
        pdf.text(project.description, {
          size: 9.5,
          color: [0.13, 0.15, 0.2],
          lineGap: 3.2,
        });
      }
      project.bullets.forEach((bullet) => pdf.bullet(bullet));
      pdf.moveDown(3);
    }
  }

  if (result.education.length > 0) {
    pdf.ensureBlockSpace(64);
    pdf.sectionTitle("Pendidikan");
    for (const education of result.education) {
      pdf.ensureBlockSpace(34);
      pdf.text(
        joinDefined([
          education.institution,
          education.degree,
          education.period,
        ]),
        {
          size: 9.6,
          font: "bold",
          color: [0.07, 0.1, 0.17],
          lineGap: 3.2,
        },
      );
      education.details.forEach((detail) => pdf.bullet(detail));
    }
  }

  addSectionIfItems(pdf, "Sertifikasi", result.certifications);

  for (const section of result.additionalSections) {
    addSectionIfItems(pdf, section.title, section.items);
  }

  return pdf.render();
}
