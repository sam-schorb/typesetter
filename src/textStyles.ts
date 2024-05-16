import { rgb, PDFDocument } from 'pdf-lib';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * This file defines global and specific text styles used for creating PDFs.
 * It includes styles for body text and chapter titles, as well as font loading and embedding.
 */

// Load and embed the font
export const loadFont = async (pdfDoc: PDFDocument) => {
  const fontBytes = await readFile(join(__dirname, '..', 'fonts', 'GoudyModernMTStd.ttf'));
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  return font;
};

export const globalStyles = {
  margin: 100,
  fontName: 'GoudyModernMTStd',
  parIndentWidth: 18,
  paragraphBreakHeight: 10,
};

export const bodyTextStyle = {
  size: 14,
  color: rgb(0, 0, 0),
  lineHeight: 20,
};

export const chapterTitleStyle = {
  size: 18,
  color: rgb(0, 0, 0),
  lineHeight: 24,
};