import { rgb, StandardFonts } from 'pdf-lib';

/**
 * This file defines global and specific text styles used for creating PDFs.
 * It includes styles for body text and chapter titles.
 */

export const globalStyles = {
  margin: 100,
  fontName: StandardFonts.TimesRoman,
  parIndent: 36,
  paragraphBreakHeight: 10,
  minLinesThreshold: 4
};

export const bodyTextStyle = {
  size: 14,
  color: rgb(0, 0, 0),
  lineHeight: 20
};

export const chapterTitleStyle = {
  size: 18,
  color: rgb(0, 0, 0),
  lineHeight: 24
};
