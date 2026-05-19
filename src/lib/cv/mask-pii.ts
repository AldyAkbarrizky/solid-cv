export function maskPII(text: string) {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]")
    .replace(/(\+62|62|0)[\s-]?8[0-9\s-]{7,14}/g, "[PHONE]")
    .replace(/\b\d{16}\b/g, "[ID_NUMBER]")
    .replace(/https?:\/\/[^\s]+/gi, "[URL]")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}
