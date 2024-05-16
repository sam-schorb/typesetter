/**
 * A collection of utility functions for text processing and formatting.
 * These functions are used to prepare text for rendering in a PDF document.
 */

import { PDFFont } from 'pdf-lib';
import { globalStyles } from './textStyles';

/**
 * Splits a text string into an array of paragraphs.
 * @param {string} textContent - The text content to split into paragraphs.
 * @returns {string[]} An array of paragraphs.
 */
export function splitTextIntoParagraphs(textContent: string): string[] {
  return textContent.split('\n');
}

/**
 * Inserts a space after dashes that are not followed by a space.
 * @param {string} text - The text to process.
 * @returns {string} The text with spaces inserted after dashes.
 */
export function insertSpaceAfterDash(text: string): string {
  return text.replace(/—(?!\s)/g, '— ');
}

/**
 * Finds the indices of new chapters in an array of paragraphs.
 * @param {string[]} lines - The array of lines.
 * @returns {number[]} An array of indices representing the start of each new chapter.
 */
export function getNewChapterIndices(lines: string[]): number[] {
  const newChapterIndices: number[] = [];

  lines.forEach((line, index) => {
    if (line.match(/^CHAPTER \d+\. /)) {
      newChapterIndices.push(index);
    }
  });

  return newChapterIndices;
}

/**
 * Capitalizes the chapter title in a chapter heading paragraph.
 * @param {string} paragraph - The chapter heading paragraph.
 * @returns {string} The chapter heading with the title capitalized.
 */
export function capitalizeChapterTitle(paragraph: string): string {
  const chapterMatch = paragraph.match(/^(CHAPTER \d+\. )(.+)\./);
  if (chapterMatch) {
    const chapterNumber = chapterMatch[1];
    const chapterTitle = chapterMatch[2].toUpperCase();
    return chapterNumber + chapterTitle + '.';
  }
  return paragraph;
}


/**
 * Creates lines from the given paragraphs as wordArrays, based on the available width and font metrics.
 * @param {string[][]} paragraphsAsWordArrays - The array of paragraphs split into words.
 * @param {PDFFont} font - The font used for text rendering.
 * @param {number} fontSize - The font size used for text rendering.
 * @param {number} textMaxWidth - The maximum width available for the text.
 * @returns {{lines: string[], isLastLine: boolean[], isFirstLine: boolean[]}} - The created lines and their properties.
 */
export function createLines(
  paragraphsAsWordArrays: string[][],
  font: PDFFont,
  fontSize: number,
  textMaxWidth: number
): { lines: string[]; isLastLine: boolean[]; isFirstLine: boolean[] } {
  const lines: string[] = [];
  const isLastLine: boolean[] = [];
  const isFirstLine: boolean[] = [];

  const { parIndentWidth } = globalStyles;

  paragraphsAsWordArrays.forEach((wordArray) => {
    let currentLine = '';
    let isFirstLineOfParagraph = true;

    // Process each word and add it to the lines array
    for (let i = 0; i < wordArray.length; i++) {
      const word = wordArray[i];
      const maxWidth = isFirstLineOfParagraph ? textMaxWidth - parIndentWidth : textMaxWidth;
      const result = addWordToLine(
        word,
        currentLine,
        lines,
        isLastLine,
        isFirstLine,
        isFirstLineOfParagraph,
        maxWidth,
        font,
        fontSize
      );
      currentLine = result.currentLine;
      isFirstLineOfParagraph = result.isFirstLineOfParagraph;
    }

    // Process the last line if it's not empty
    if (currentLine.trim().length > 0) {
      processLastLine(currentLine, lines, isLastLine, isFirstLine, isFirstLineOfParagraph);
    }
  });

  // Handle orphans
  handleOrphans(lines, isLastLine);

  return { lines, isLastLine, isFirstLine };
}

/**
 * Adds a word to the current line or starts a new line if the word exceeds the maximum width.
 * @param {string} word - The word to be added.
 * @param {string} currentLine - The current line being built.
 * @param {string[]} lines - The array of lines.
 * @param {boolean[]} isLastLine - The array indicating if each line is the last line of a paragraph.
 * @param {boolean[]} isFirstLine - The array indicating if each line is the first line of a paragraph.
 * @param {boolean} isFirstLineOfParagraph - Indicates if the current line is the first line of a paragraph.
 * @param {number} maxWidth - The maximum width allowed for a line.
 * @param {PDFFont} font - The font used for text rendering.
 * @param {number} fontSize - The font size used for text rendering.
 * @returns {{currentLine: string, isFirstLineOfParagraph: boolean}} - The updated current line and paragraph status.
 */
function addWordToLine(
  word: string,
  currentLine: string,
  lines: string[],
  isLastLine: boolean[],
  isFirstLine: boolean[],
  isFirstLineOfParagraph: boolean,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): { currentLine: string; isFirstLineOfParagraph: boolean } {
  const potentialLine = currentLine + (currentLine ? ' ' : '') + word;
  const potentialLineWidth = font.widthOfTextAtSize(potentialLine, fontSize);

  // If the potential line fits within the maximum width, add the word to the current line
  if (potentialLineWidth <= maxWidth) {
    return { currentLine: potentialLine, isFirstLineOfParagraph };
  }

  // Start a new line with the current word
  lines.push(currentLine.trim());
  isLastLine.push(false);
  isFirstLine.push(isFirstLineOfParagraph);
  return { currentLine: word, isFirstLineOfParagraph: false };
}

/**
 * Processes the last line of the paragraph.
 * @param {string} currentLine - The current line being built.
 * @param {string[]} lines - The array of lines.
 * @param {boolean[]} isLastLine - The array indicating if each line is the last line of a paragraph.
 * @param {boolean[]} isFirstLine - The array indicating if each line is the first line of a paragraph.
 * @param {boolean} isFirstLineOfParagraph - Indicates if the current line is the first line of a paragraph.
 */
function processLastLine(
  currentLine: string,
  lines: string[],
  isLastLine: boolean[],
  isFirstLine: boolean[],
  isFirstLineOfParagraph: boolean
): void {
  lines.push(currentLine.trim());
  isLastLine.push(true);
  isFirstLine.push(isFirstLineOfParagraph);
}

/**
 * Handles orphan words by ensuring that the last line of a paragraph
 * has at least two words. If an orphan is detected, the last word
 * from the previous line is removed and prepended to the current line.
 * @param {string[]} lines - The array of lines.
 * @param {boolean[]} isLastLine - The array indicating if each line is the last line of a paragraph.
 * @param {boolean[]} isFirstLine - The array indicating if each line is the first line of a paragraph.
 */
function handleOrphans(
  lines: string[],
  isLastLine: boolean[],
): void {

  if (lines.length < 2) return; // No need to process if fewer than two lines

  for (let i = 1; i < lines.length; i++) {
    if (isLastLine[i] && lines[i].split(' ').length === 1) {
      // Handle orphan
      const previousLineWords = lines[i - 1].split(' ');
      const lastWord = previousLineWords.pop();
      if (lastWord) {
        lines[i - 1] = previousLineWords.join(' ');
        lines[i] = lastWord + ' ' + lines[i];
      }
    }
  }
}