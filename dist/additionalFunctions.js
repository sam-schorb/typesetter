"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function startNewChapterPage(page, newChapterIndices, lineIndex) {
    if (newChapterIndices.includes(lineIndex)) {
        page = page.doc.addPage();
        return { page, shouldStartNewPage: true };
    }
    return { page, shouldStartNewPage: false };
}
function startNewParagraphPage(lines, currentIndex, yPos, lineHeight, minLinesThreshold, margin) {
    const line = lines[currentIndex];
    if (line === '' && currentIndex > 0 && lines[currentIndex - 1] !== '') {
        const nextLinesCount = lines.slice(currentIndex).filter((l) => l !== '').length;
        if (nextLinesCount < minLinesThreshold || yPos - lineHeight * minLinesThreshold < margin) {
            return true; // Start a new page
        }
    }
    return false;
}
function addNewPageIfNeeded(yPos, lineHeight, margin) {
    if (yPos - lineHeight < margin) {
        return true; // Start a new page
    }
    return false;
}
