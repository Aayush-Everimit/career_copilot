"use client";

/**
 * Extracts all text content from a PDF file, entirely client-side.
 * Uses dynamic import to avoid SSR issues with pdfjs-dist.
 * @param file - The PDF File object from a file input or drag-and-drop
 * @returns The full extracted text string
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamic import prevents pdfjs-dist from being evaluated during SSR/prerender
  const pdfjsLib = await import("pdfjs-dist");

  // Set the worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => (item as { str?: string }).str ?? "")
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n\n").trim();
}
