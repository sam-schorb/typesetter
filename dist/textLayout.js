"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawTextLines = exports.getNewChapterIndices = exports.splitParagraphIntoLines = exports.splitTextIntoParagraphs = exports.capitalizeChapterTitle = void 0;
const textStyles_1 = require("./textStyles");
const minLinesThreshold = textStyles_1.globalStyles.minLinesThreshold;
console.log('minLinesThreshold', minLinesThreshold);
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
function splitTextIntoParagraphs(textContent) {
    return textContent.split('\n');
}
exports.splitTextIntoParagraphs = splitTextIntoParagraphs;
function splitParagraphIntoLines(paragraph, font, fontSize, textMaxWidth) {
    const words = paragraph.split(/\s+/);
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = line + word + ' ';
        const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testLineWidth > textMaxWidth && line !== '') {
            lines.push(line);
            line = word + ' ';
        }
        else {
            line = testLine;
        }
    }
    if (line.trim().length > 0) {
        lines.push(line.trim());
    }
    return lines;
}
exports.splitParagraphIntoLines = splitParagraphIntoLines;
function getNewChapterIndices(paragraphs) {
    const newChapterIndices = [];
    paragraphs.forEach((paragraph, index) => {
        if (paragraph.match(/^CHAPTER \d+\. /)) {
            newChapterIndices.push(index);
        }
    });
    return newChapterIndices;
}
exports.getNewChapterIndices = getNewChapterIndices;
function drawTextLines(lines, page, margin, pageHeight, fontSize, font, color, lineHeight, paragraphBreakHeight, textMaxWidth, newChapterIndices // This parameter will carry indices where new chapters start
) {
    let yPos = pageHeight - margin;
    let lineIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check for new chapter starts and ensure they start on a new page
        if (newChapterIndices.includes(lineIndex)) {
            page = page.doc.addPage();
            yPos = pageHeight - margin;
        }
        // Check if the current line starts a new paragraph and has enough space to fit minLinesThreshold lines
        if (line === '' && i > 0 && lines[i - 1] !== '') {
            const nextLinesCount = lines.slice(i).filter((l) => l !== '').length;
            if (nextLinesCount < minLinesThreshold || yPos - lineHeight * minLinesThreshold < margin) {
                // Not enough space to accommodate minLinesThreshold lines or not enough remaining lines
                page = page.doc.addPage(); // Start a new page
                yPos = pageHeight - margin; // Reset vertical position
            }
        }
        // Add a new page if there's not enough space for another line
        if (yPos - lineHeight < margin) {
            page = page.doc.addPage(); // Start a new page
            yPos = pageHeight - margin; // Reset vertical position
        }
        // Draw the line or adjust vertical position for paragraph breaks
        if (line === '') {
            yPos -= paragraphBreakHeight;
        }
        else {
            const words = line.split(' ');
            const lineWidth = font.widthOfTextAtSize(line, fontSize);
            if (i === lines.length - 1 || lines[i + 1] === '') {
                // Last line of the paragraph or last line of the text, don't justify
                page.drawText(line, {
                    x: margin,
                    y: yPos,
                    size: fontSize,
                    font,
                    color,
                });
            }
            else {
                // Justify the line by adjusting word spacing
                const extraSpace = textMaxWidth - lineWidth;
                const numSpaces = words.length - 1;
                const spaceWidth = font.widthOfTextAtSize(' ', fontSize);
                const additionalSpaceWidth = extraSpace / numSpaces;
                let xPos = margin;
                for (let j = 0; j < words.length; j++) {
                    const word = words[j];
                    const wordWidth = font.widthOfTextAtSize(word, fontSize);
                    page.drawText(word, {
                        x: xPos,
                        y: yPos,
                        size: fontSize,
                        font,
                        color,
                    });
                    xPos += wordWidth + spaceWidth + additionalSpaceWidth; // Move to the next word position
                }
            }
            yPos -= lineHeight; // Move down the page by one line height
        }
        lineIndex++; // Increment the current line index
    }
    return { page };
}
exports.drawTextLines = drawTextLines;
