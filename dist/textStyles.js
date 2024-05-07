"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chapterTitleStyle = exports.bodyTextStyle = exports.globalStyles = void 0;
const pdf_lib_1 = require("pdf-lib");
/**
 * This file defines global and specific text styles used for creating PDFs.
 * It includes styles for body text and chapter titles.
 */
exports.globalStyles = {
    margin: 100,
    fontName: pdf_lib_1.StandardFonts.TimesRoman,
    parIndent: 36,
    paragraphBreakHeight: 10,
    minLinesThreshold: 4
};
exports.bodyTextStyle = {
    size: 14,
    color: (0, pdf_lib_1.rgb)(0, 0, 0),
    lineHeight: 20
};
exports.chapterTitleStyle = {
    size: 18,
    color: (0, pdf_lib_1.rgb)(0, 0, 0),
    lineHeight: 24
};
