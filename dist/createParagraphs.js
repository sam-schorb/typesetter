"use strict";
/**
 * A collection of utility functions for text processing and formatting.
 * These functions are used to prepare text for rendering in a PDF document.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLines = exports.capitalizeChapterTitle = exports.getNewChapterIndices = exports.insertSpaceAfterDash = exports.splitTextIntoParagraphs = void 0;
const textStyles_1 = require("./textStyles");
/**
 * Splits a text string into an array of paragraphs.
 * @param {string} textContent - The text content to split into paragraphs.
 * @returns {string[]} An array of paragraphs.
 */
function splitTextIntoParagraphs(textContent) {
    return textContent.split('\n');
}
exports.splitTextIntoParagraphs = splitTextIntoParagraphs;
/**
 * Inserts a space after dashes that are not followed by a space.
 * @param {string} text - The text to process.
 * @returns {string} The text with spaces inserted after dashes.
 */
function insertSpaceAfterDash(text) {
    return text.replace(/—(?!\s)/g, '— ');
}
exports.insertSpaceAfterDash = insertSpaceAfterDash;
/**
 * Finds the indices of new chapters in an array of paragraphs.
 * @param {string[]} lines - The array of lines.
 * @returns {number[]} An array of indices representing the start of each new chapter.
 */
function getNewChapterIndices(lines) {
    const newChapterIndices = [];
    lines.forEach((line, index) => {
        if (line.match(/^CHAPTER \d+\. /)) {
            newChapterIndices.push(index);
        }
    });
    return newChapterIndices;
}
exports.getNewChapterIndices = getNewChapterIndices;
/**
 * Capitalizes the chapter title in a chapter heading paragraph.
 * @param {string} paragraph - The chapter heading paragraph.
 * @returns {string} The chapter heading with the title capitalized.
 */
function capitalizeChapterTitle(paragraph) {
    const chapterMatch = paragraph.match(/^(CHAPTER \d+\. )(.+)\./);
    if (chapterMatch) {
        const chapterNumber = chapterMatch[1];
        const chapterTitle = chapterMatch[2].toUpperCase();
        return chapterNumber + chapterTitle + '.';
    }
    return paragraph;
}
exports.capitalizeChapterTitle = capitalizeChapterTitle;
/**
 * Splits paragraphs into lines based on the available width and font metrics.
 * @param {string[]} paragraphs - The array of paragraphs to split into lines.
 * @param {PDFFont} font - The font used for text rendering.
 * @param {number} fontSize - The font size used for text rendering.
 * @param {number} textMaxWidth - The maximum width available for the text.
 * @returns {{lines: string[], isLastLine: boolean[], isFirstLine: boolean[]}} - The split lines and their properties.
 */
/**
 * Creates lines from the given paragraphs as words, based on the available width and font metrics.
 * @param {string[][]} paragraphsAsWordArrays - The array of paragraphs split into words.
 * @param {PDFFont} font - The font used for text rendering.
 * @param {number} fontSize - The font size used for text rendering.
 * @param {number} textMaxWidth - The maximum width available for the text.
 * @returns {{lines: string[], isLastLine: boolean[], isFirstLine: boolean[]}} - The created lines and their properties.
 */
function createLines(paragraphsAsWordArrays, font, fontSize, textMaxWidth) {
    const lines = [];
    const isLastLine = [];
    const isFirstLine = [];
    const { parIndent } = textStyles_1.globalStyles;
    paragraphsAsWordArrays.forEach((wordArray) => {
        let currentLine = '';
        let isFirstLineOfParagraph = true;
        // Process each word and add it to the lines array
        for (let i = 0; i < wordArray.length; i++) {
            const word = wordArray[i];
            const maxWidth = isFirstLineOfParagraph ? textMaxWidth - parIndent : textMaxWidth;
            const result = addWordToLine(word, currentLine, lines, isLastLine, isFirstLine, isFirstLineOfParagraph, maxWidth, font, fontSize);
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
exports.createLines = createLines;
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
function addWordToLine(word, currentLine, lines, isLastLine, isFirstLine, isFirstLineOfParagraph, maxWidth, font, fontSize) {
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
function processLastLine(currentLine, lines, isLastLine, isFirstLine, isFirstLineOfParagraph) {
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
function handleOrphans(lines, isLastLine) {
    if (lines.length < 2)
        return; // No need to process if fewer than two lines
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
