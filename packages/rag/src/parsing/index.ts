import { parse as parseCsv } from "csv-parse/sync";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import { RagProcessingError } from "../errors";
import type { ParsedDocument } from "../types";

export async function parseDocumentBuffer(
  buffer: Buffer,
  mimeType: string | null,
  filename: string,
): Promise<ParsedDocument> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const type = mimeType ?? guessMime(ext);

  if (type === "application/pdf" || ext === "pdf") {
    return parsePdf(buffer);
  }
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    return parseDocx(buffer);
  }
  if (type === "text/csv" || type === "application/csv" || ext === "csv") {
    return parseCsvFile(buffer);
  }
  if (type === "text/markdown" || ext === "md" || ext === "markdown") {
    return { text: buffer.toString("utf8"), metadata: { format: "markdown" } };
  }
  if (type === "text/plain" || ext === "txt") {
    return { text: buffer.toString("utf8"), metadata: { format: "text" } };
  }
  if (type.startsWith("image/")) {
    return parseImageOcr(buffer);
  }

  throw new RagProcessingError(`Unsupported file type: ${type || ext}`);
}

async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  const parsed = await pdfParse(buffer);
  const text = parsed.text?.trim() ?? "";

  if (text.length < 100) {
    return {
      text: text || parsed.text,
      metadata: { pages: parsed.numpages, parser: "pdf-parse", lowText: true },
    };
  }

  if (!text) {
    throw new RagProcessingError(
      "Could not extract text from PDF. Upload a text-based PDF or an image for OCR.",
    );
  }

  return {
    text,
    metadata: { pages: parsed.numpages, parser: "pdf-parse" },
  };
}

async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value.trim();
  if (!text) throw new RagProcessingError("DOCX file contains no extractable text");
  return { text, metadata: { parser: "mammoth", warnings: result.messages.length } };
}

function parseCsvFile(buffer: Buffer): ParsedDocument {
  const rows = parseCsv(buffer, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, string>[];

  const text = rows
    .map((row, index) => `Row ${index + 1}: ${Object.entries(row).map(([k, v]) => `${k}=${v}`).join("; ")}`)
    .join("\n");

  return { text, metadata: { rows: rows.length, parser: "csv-parse" } };
}

async function parseImageOcr(buffer: Buffer): Promise<ParsedDocument> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    const text = data.text.trim();
    if (!text) throw new RagProcessingError("OCR found no text in image");
    return { text, metadata: { parser: "tesseract", confidence: data.confidence } };
  } finally {
    await worker.terminate();
  }
}

function guessMime(ext: string) {
  const map: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}
