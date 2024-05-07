/**
* This file contains functions for drawing justified text lines on a PDF page.
* It includes handling of chapter titles, paragraph breaks, orphans, and widows.
*
* @module drawTextLines
*/

import { PDFFont, PDFPage, rgb } from 'pdf-lib';

type RGB = ReturnType<typeof rgb>;

/**
* Draws justified text lines on a PDF page.
*
* @param {string[]} lines - The array of text lines to be drawn.
* @param {PDFPage} page - The PDF page to draw the text lines on.
* @param {number} margin - The margin size for the text.
* @param {number} pageHeight - The height of the PDF page.
* @param {number} fontSize - The font size for regular text.
* @param {number} chapterTitleFontSize - The font size for chapter titles.
* @param {PDFFont} font - The font to be used for text rendering.
* @param {RGB} color - The color of the text.
* @param {number} lineHeight - The height of each line of text.
* @param {number} paragraphBreakHeight - The height of a paragraph break.
* @param {number} textMaxWidth - The maximum width of the text on the page.
* @param {number[]} newChapterIndices - The indices of lines that start new chapters.
* @param {boolean[]} isLastLine - Indicates whether each line is the last line of a paragraph.
* @param {boolean[]} isFirstLine - Indicates whether each line is the first line of a paragraph.
* @returns {{page: PDFPage}} - The updated PDF page with the drawn text lines.
*/
export function drawTextLines(
 lines: string[],
 page: PDFPage,
 margin: number,
 pageHeight: number,
 fontSize: number,
 chapterTitleFontSize: number,
 font: PDFFont,
 color: RGB,
 lineHeight: number,
 paragraphBreakHeight: number,
 textMaxWidth: number,
 newChapterIndices: number[],
 isLastLine: boolean[],
 isFirstLine: boolean[]
): { page: PDFPage } {
 let yPos = pageHeight - margin;
 let remainingSpace = yPos - margin;
 let lineIndex = 0;
 let colonEncountered = false;
 let afterColonLineIndex = -1;
 let lastLineOfParagraph = -1;
 let remainingLinesInParagraph = 0;

 /**
  * Starts a new page by adding a new page to the PDF document.
  */
 function startNewPage(): void {
   page = page.doc.addPage();
   yPos = pageHeight - margin;
   remainingSpace = yPos - margin;
 }

 /**
  * Calculates the number of remaining lines in the current paragraph.
  *
  * @param {number} startIndex - The index of the first line in the paragraph.
  * @returns {number} - The number of remaining lines in the paragraph.
  */
 function calculateRemainingLinesInParagraph(startIndex: number): number {
   for (let j = startIndex; j < lines.length; j++) {
     if (isLastLine[j]) {
       return j - startIndex + 1;
     }
   }
   return 0;
 }

 lines.forEach((line, i) => {
   const isChapterTitle = newChapterIndices.includes(i) && /^CHAPTER \d+\./i.test(line.trim());
   const { [i]: isFirstLineOfParagraph } = isFirstLine;
   const { [i]: isLastLineOfParagraph } = isLastLine;

   // Start a new page for chapter titles or new chapters
   if (isChapterTitle || newChapterIndices.includes(lineIndex)) {
     startNewPage();
   }

   // Calculate remaining lines in the paragraph
   if (isFirstLineOfParagraph) {
     remainingLinesInParagraph = calculateRemainingLinesInParagraph(i);
   }

   // Prevent orphans at the start of the page
   if (remainingLinesInParagraph <= 3 && remainingSpace < remainingLinesInParagraph * lineHeight) {
     startNewPage();
   }

   // Prevent widows at the end of the page
   if (isFirstLineOfParagraph && remainingSpace < 3 * lineHeight && remainingLinesInParagraph > 3) {
     startNewPage();
   }

   // Ensure there is sufficient space on the current page
   if (remainingSpace < lineHeight) {
     startNewPage();
   }

   // Handle empty lines and paragraph breaks
   if (line === '') {
     yPos -= paragraphBreakHeight;
     remainingSpace -= paragraphBreakHeight;
     if (colonEncountered && lastLineOfParagraph >= 0) {
       yPos -= lineHeight;
       remainingSpace -= lineHeight;
       colonEncountered = false;
       afterColonLineIndex = -1;
       lastLineOfParagraph = -1;
     }
   } else {
     // Draw the justified line of text
     drawJustifiedLine(
       line,
       page,
       margin,
       yPos,
       fontSize,
       chapterTitleFontSize,
       font,
       color,
       textMaxWidth,
       isLastLineOfParagraph,
       isFirstLineOfParagraph,
       isChapterTitle
     );
     yPos -= lineHeight;
     remainingSpace -= lineHeight;

     remainingLinesInParagraph--;

     // Handle colon-separated lines
     if (line.endsWith(':')) {
       yPos -= lineHeight;
       remainingSpace -= lineHeight;
       colonEncountered = true;
       afterColonLineIndex = i;
     }

     if (isLastLineOfParagraph) {
       lastLineOfParagraph = i;
     }

     if (colonEncountered && lastLineOfParagraph > afterColonLineIndex) {
       yPos -= lineHeight;
       remainingSpace -= lineHeight;
       colonEncountered = false;
       afterColonLineIndex = -1;
       lastLineOfParagraph = -1;
     }

     // Add extra space after chapter titles
     if (isChapterTitle) {
       yPos -= lineHeight;
       remainingSpace -= lineHeight;
     }
   }

   lineIndex++;
 });

 return { page };
}

/**
* Draws a justified line of text on the PDF page.
*
* @param {string} line - The line of text to be drawn.
* @param {PDFPage} page - The PDF page to draw the text line on.
* @param {number} margin - The margin size for the text.
* @param {number} yPos - The vertical position to draw the text line.
* @param {number} fontSize - The font size for regular text.
* @param {number} chapterTitleFontSize - The font size for chapter titles.
* @param {PDFFont} font - The font to be used for text rendering.
* @param {RGB} color - The color of the text.
* @param {number} textMaxWidth - The maximum width of the text on the page.
* @param {boolean} isLastLine - Indicates whether the line is the last line of a paragraph.
* @param {boolean} isFirstLineOfParagraph - Indicates whether the line is the first line of a paragraph.
* @param {boolean} isChapterTitle - Indicates whether the line is a chapter title.
*/
function drawJustifiedLine(
 line: string,
 page: PDFPage,
 margin: number,
 yPos: number,
 fontSize: number,
 chapterTitleFontSize: number,
 font: PDFFont,
 color: RGB,
 textMaxWidth: number,
 isLastLine: boolean,
 isFirstLineOfParagraph: boolean,
 isChapterTitle: boolean
): void {
 const words = line.split(' ');
 const lineWidth = font.widthOfTextAtSize(line, fontSize);
 const indentationWidth = 18;

 const xPos = (isFirstLineOfParagraph && !isChapterTitle) ? margin + indentationWidth : margin;
 const currentFontSize = isChapterTitle ? chapterTitleFontSize : fontSize;

 if (isLastLine) {
   // Draw the last line of a paragraph without justification
   page.drawText(line, { x: xPos, y: yPos, size: currentFontSize, font, color });
 } else {
   // Calculate the available width and extra space for justification
   const availableWidth = (isFirstLineOfParagraph && !isChapterTitle) ? textMaxWidth - indentationWidth : textMaxWidth;
   const extraSpace = availableWidth - lineWidth;
   const numSpaces = words.length - 1;
   const spaceWidth = font.widthOfTextAtSize(' ', fontSize);
   const additionalSpaceWidth = numSpaces > 0 ? extraSpace / numSpaces : 0;

   let currentXPos = xPos;
   for (let j = 0; j < words.length; j++) {
     const word = words[j];
     const wordWidth = font.widthOfTextAtSize(word, currentFontSize);
     page.drawText(word, { x: currentXPos, y: yPos, size: currentFontSize, font, color });
     currentXPos += wordWidth + spaceWidth + additionalSpaceWidth;
   }
 }
}