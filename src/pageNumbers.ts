/**
 * This file contains a function that adds page numbers to a PDF document.
 * The page numbers are rendered using the specified font, size, and color.
 * Additionally, a small line is drawn above each page number as a minimalist embellishment.
 *
 * @param {PDFDocument} pdfDoc - The PDF document object to add page numbers to.
 * @returns {Promise<void>}
 */
import { PDFDocument, rgb, degrees, BlendMode } from 'pdf-lib';
import { globalStyles } from './textStyles';

export async function addPageNumbers(pdfDoc: PDFDocument) {
  const pages = pdfDoc.getPages();
  const { fontName, margin } = globalStyles;

  // Embed the font for rendering page numbers
  const pageNumberFont = await pdfDoc.embedFont(fontName);
  const pageNumberFontSize = 10;
  const pageNumberColor = rgb(0, 0, 0);
  const pageNumberMargin = margin / 1.25;

  // Iterate through each page and add page number
  for (let i = 0; i < pages.length; i++) {
    const pageNumber = i + 1;
    const pageNumberText = `${pageNumber}`;
    const pageNumberWidth = pageNumberFont.widthOfTextAtSize(pageNumberText, pageNumberFontSize);
    const { width } = pages[i].getSize();
    const pageNumberX = width / 2 - pageNumberWidth / 2; // Center the page number
    const pageNumberY = pageNumberMargin;

    // Draw the page number text
    pages[i].drawText(pageNumberText, {
      x: pageNumberX,
      y: pageNumberY,
      size: pageNumberFontSize,
      font: pageNumberFont,
      color: pageNumberColor,
      opacity: 0.8,
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0),
      lineHeight: 12,
      maxWidth: pageNumberWidth,
      blendMode: BlendMode.Normal,
    });

    // Add a small line above the page number as a minimalist embellishment
    const lineWidth = pageNumberWidth + 10;
    const lineHeight = 0.5;
    const lineX = pageNumberX - 5; // Adjust the line position based on the page number width
    const lineY = pageNumberY + pageNumberFontSize + 5;
    pages[i].drawRectangle({
      x: lineX,
      y: lineY,
      width: lineWidth,
      height: lineHeight,
      color: pageNumberColor,
      opacity: 0.8,
      borderWidth: 0,
      borderColor: rgb(0, 0, 0),
      borderOpacity: 1,
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0),
      blendMode: BlendMode.Normal,
    });
  }
}