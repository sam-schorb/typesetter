"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chapterTitleStyle = exports.bodyTextStyle = exports.globalStyles = exports.loadFont = void 0;
const pdf_lib_1 = require("pdf-lib");
const promises_1 = require("fs/promises");
const path_1 = require("path");
/**
 * This file defines global and specific text styles used for creating PDFs.
 * It includes styles for body text and chapter titles, as well as font loading and embedding.
 */
// Load and embed the font
const loadFont = async (pdfDoc) => {
    const fontBytes = await (0, promises_1.readFile)((0, path_1.join)(__dirname, '..', 'fonts', 'GoudyModernMTStd.ttf'));
    const font = await pdfDoc.embedFont(fontBytes, { subset: true });
    return font;
};
exports.loadFont = loadFont;
exports.globalStyles = {
    margin: 100,
    fontName: 'GoudyModernMTStd',
    parIndent: 18,
    paragraphBreakHeight: 10,
};
exports.bodyTextStyle = {
    size: 14,
    color: (0, pdf_lib_1.rgb)(0, 0, 0),
    lineHeight: 20,
};
exports.chapterTitleStyle = {
    size: 18,
    color: (0, pdf_lib_1.rgb)(0, 0, 0),
    lineHeight: 24,
};
