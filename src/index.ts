// src/index.ts
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { bodyTextStyle, chapterTitleStyle, globalStyles } from './textStyles';
import {
  capitalizeChapterTitle,
  splitTextIntoParagraphs,
  splitParagraphIntoLines,
  getNewChapterIndices,
  insertSpaceAfterDash,
} from './createParagraphs';
import { drawTextLines } from './drawText';
import { addPageNumbers } from './pageNumbers';

/**
 * Creates a PDF document with formatted text content.
 * @async
 * @function createPDF
 * @returns {Promise<void>}
 */
async function createPDF(): Promise<void> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  pdfDoc.registerFontkit(fontkit);

  // Get page dimensions and global styles
  const { width, height } = page.getSize();
  const { margin, fontName, paragraphBreakHeight, minLinesThreshold } = globalStyles;
  const { size: fontSize, color, lineHeight } = bodyTextStyle;
  const { size: chapterTitleFontSize } = chapterTitleStyle;

  // Load and embed the font
  const fontBytes = await readFile(join(__dirname, '..', 'fonts', 'GoudyModernMTStd.ttf'));
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });

  // Read and process the text content
  const textContent = await readFile(join(__dirname, '..', 'example.txt'), 'utf8');
  const textMaxWidth = width - 2 * margin;
  const textContentNoDashes = insertSpaceAfterDash(textContent);
  const paragraphs = splitTextIntoParagraphs(textContentNoDashes);
  const capitalizedParagraphs = paragraphs.map(capitalizeChapterTitle);

  // Split paragraphs into lines
  const lines: string[] = [];
  const isLastLine: boolean[] = [];
  const isFirstLine: boolean[] = [];
  capitalizedParagraphs.forEach((paragraph) => {
    const {
      lines: paragraphLines,
      isLastLine: paragraphIsLastLine,
      isFirstLine: paragraphIsFirstLine,
    } = splitParagraphIntoLines(paragraph, font, fontSize, textMaxWidth);
    lines.push(...paragraphLines);
    isLastLine.push(...paragraphIsLastLine);
    isFirstLine.push(...paragraphIsFirstLine);
  });

  // Get new chapter indices
  const newChapterIndices = getNewChapterIndices(lines);

  // Draw text lines on the page
  const result = drawTextLines(
    lines,
    page,
    margin,
    height,
    fontSize,
    chapterTitleFontSize,
    font,
    color,
    lineHeight,
    paragraphBreakHeight,
    textMaxWidth,
    newChapterIndices,
    isLastLine,
    isFirstLine
  );
  page = result.page;

  // Add page numbers to the document
  await addPageNumbers(pdfDoc);

  // Save the PDF document
  const pdfBytes = await pdfDoc.save();
  const outputPath = join(__dirname, '..', 'output', 'examplePDF.pdf');
  await writeFile(outputPath, pdfBytes);
  console.log(`PDF saved to ${outputPath}`);
}

createPDF();