"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdf_lib_1 = require("pdf-lib");
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const textStyles_1 = require("./textStyles");
const createParagraphs_1 = require("./createParagraphs");
const drawText_1 = require("./drawText");
const pageNumbers_1 = require("./pageNumbers");
/**
 * Creates a PDF document with formatted text content.
 * @async
 * @function createPDF
 * @returns {Promise<void>}
 */
async function createPDF() {
    // Create a new PDF document
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    let page = pdfDoc.addPage();
    pdfDoc.registerFontkit(fontkit_1.default);
    // Get page dimensions and global styles
    const { width, height } = page.getSize();
    const { margin, paragraphBreakHeight } = textStyles_1.globalStyles;
    const { size: fontSize, color, lineHeight } = textStyles_1.bodyTextStyle;
    const { size: chapterTitleFontSize } = textStyles_1.chapterTitleStyle;
    // Load and embed the font
    const font = await (0, textStyles_1.loadFont)(pdfDoc);
    // Read and process the text content
    const textContent = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '..', 'example.txt'), 'utf8');
    const textMaxWidth = width - 2 * margin;
    const textContentNoDashes = (0, createParagraphs_1.insertSpaceAfterDash)(textContent);
    const paragraphs = (0, createParagraphs_1.splitTextIntoParagraphs)(textContentNoDashes);
    const capitalizedParagraphs = paragraphs.map(createParagraphs_1.capitalizeChapterTitle);
    const paragraphsAsWordArrays = capitalizedParagraphs.map((paragraph) => paragraph.split(/\s+/));
    // Create lines from paragraphs as words
    const { lines, isLastLine, isFirstLine } = (0, createParagraphs_1.createLines)(paragraphsAsWordArrays, font, fontSize, textMaxWidth);
    // Get new chapter indices
    const newChapterIndices = (0, createParagraphs_1.getNewChapterIndices)(lines);
    // Draw text lines on the page
    const result = (0, drawText_1.drawTextLines)(lines, page, margin, height, fontSize, chapterTitleFontSize, font, color, lineHeight, paragraphBreakHeight, textMaxWidth, newChapterIndices, isLastLine, isFirstLine);
    page = result.page;
    // Add page numbers to the document
    await (0, pageNumbers_1.addPageNumbers)(pdfDoc);
    // Save the PDF document
    const pdfBytes = await pdfDoc.save();
    const outputPath = (0, path_1.join)(__dirname, '..', 'output', 'examplePDF.pdf');
    await (0, promises_1.writeFile)(outputPath, pdfBytes);
    console.log(`PDF saved to ${outputPath}`);
}
createPDF();
