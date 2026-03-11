/**
 * File parser — extracts text content from uploaded files.
 * Supports: PDF, DOCX, DOC, XLSX, XLS, TXT, CSV, JSON, MD
 * Images (JPG, PNG, GIF, WEBP) return base64 for LLM vision APIs.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const MIME_TO_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-excel": "xls",
  "text/plain": "txt",
  "text/csv": "csv",
  "text/markdown": "md",
  "application/json": "json",
  "image/jpeg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
};

// Fallback: detect from file extension when MIME type is missing/wrong
const EXT_TO_TYPE: Record<string, string> = {
  ".pdf": "pdf",
  ".docx": "docx",
  ".doc": "doc",
  ".xlsx": "xlsx",
  ".xls": "xls",
  ".txt": "txt",
  ".csv": "csv",
  ".md": "md",
  ".json": "json",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".gif": "image",
  ".webp": "image",
};

export interface ParsedFile {
  filename: string;
  mimeType: string;
  fileType: string;
  textContent: string | null;
  base64Image: string | null;
  sizeBytes: number;
  error?: string;
}

function detectType(mimeType: string, filename: string): string {
  if (MIME_TO_TYPE[mimeType]) return MIME_TO_TYPE[mimeType];
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
  return EXT_TO_TYPE[ext] || "unknown";
}

export function isSupported(mimeType: string, filename?: string): boolean {
  if (MIME_TO_TYPE[mimeType]) return true;
  if (filename) {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
    return ext in EXT_TO_TYPE;
  }
  return false;
}

export function getSupportedExtensions(): string[] {
  return Object.keys(EXT_TO_TYPE);
}

export async function parseFile(buffer: Buffer, filename: string, mimeType: string): Promise<ParsedFile> {
  const fileType = detectType(mimeType, filename);
  const result: ParsedFile = {
    filename,
    mimeType,
    fileType,
    textContent: null,
    base64Image: null,
    sizeBytes: buffer.length,
  };

  if (buffer.length > MAX_FILE_SIZE) {
    result.error = `File too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Max is 10MB.`;
    return result;
  }

  if (fileType === "unknown") {
    result.error = `Unsupported file type: ${mimeType || "unknown"} (${filename})`;
    return result;
  }

  try {
    switch (fileType) {
      case "pdf": {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pdfModule = await import("pdf-parse") as any;
          const pdfParse = pdfModule.default || pdfModule;
          const data = await pdfParse(buffer);
          result.textContent = (data.text || "").trim();
          if (!result.textContent) {
            result.error = "PDF appears to be image-only (no extractable text). Try uploading as an image instead.";
          }
        } catch (pdfErr) {
          console.error("pdf-parse error:", pdfErr);
          result.error = `Could not parse PDF: ${pdfErr instanceof Error ? pdfErr.message : "Unknown error"}. The file may be corrupted or encrypted.`;
        }
        break;
      }

      case "docx":
      case "doc": {
        try {
          const mammoth = await import("mammoth");
          const { value } = await mammoth.extractRawText({ buffer });
          result.textContent = (value || "").trim();
          if (!result.textContent) {
            result.error = "Document appears to be empty.";
          }
        } catch (docErr) {
          console.error("mammoth error:", docErr);
          result.error = `Could not parse document: ${docErr instanceof Error ? docErr.message : "Unknown error"}`;
        }
        break;
      }

      case "xlsx":
      case "xls": {
        try {
          const XLSX = await import("xlsx");
          const workbook = XLSX.read(buffer, { type: "buffer" });
          const sheets: string[] = [];
          for (const name of workbook.SheetNames) {
            const sheet = workbook.Sheets[name];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv.trim()) {
              sheets.push(`--- Sheet: ${name} ---\n${csv.trim()}`);
            }
          }
          result.textContent = sheets.join("\n\n");
          if (!result.textContent) {
            result.error = "Spreadsheet appears to be empty.";
          }
        } catch (xlsErr) {
          console.error("xlsx error:", xlsErr);
          result.error = `Could not parse spreadsheet: ${xlsErr instanceof Error ? xlsErr.message : "Unknown error"}`;
        }
        break;
      }

      case "txt":
      case "csv":
      case "md":
      case "json": {
        result.textContent = buffer.toString("utf-8").trim();
        if (!result.textContent) {
          result.error = "File appears to be empty.";
        }
        break;
      }

      case "image": {
        result.base64Image = buffer.toString("base64");
        break;
      }
    }
  } catch (err) {
    console.error(`Parse error for ${filename}:`, err);
    result.error = `Failed to parse ${filename}: ${err instanceof Error ? err.message : "Unknown error"}`;
  }

  return result;
}
