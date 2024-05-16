import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { bodyTextStyle, chapterTitleStyle, globalStyles, loadFont } from './textStyles';
import { capitalizeChapterTitle, splitTextIntoParagraphs, createLines, getNewChapterIndices, insertSpaceAfterDash } from './createParagraphs';
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
  const { margin, paragraphBreakHeight } = globalStyles;
  const { size: fontSize, color, lineHeight } = bodyTextStyle;
  const { size: chapterTitleFontSize } = chapterTitleStyle;

  // Load and embed the font
  const font = await loadFont(pdfDoc);

  // Read and process the text content
  const textContent = await readFile(join(__dirname, '..', 'example.txt'), 'utf8');
  const textMaxWidth = width - 2 * margin;
  const textContentNoDashes = insertSpaceAfterDash(textContent);
  const paragraphs = splitTextIntoParagraphs(textContentNoDashes);
  const capitalizedParagraphs = paragraphs.map(capitalizeChapterTitle);
  const paragraphsAsWordArrays = capitalizedParagraphs.map((paragraph) => paragraph.split(/\s+/));

  // Create lines from paragraphs as words
  const { lines, isLastLine, isFirstLine } = createLines(paragraphsAsWordArrays, font, fontSize, textMaxWidth);

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