"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openPDF = void 0;
// src/utils.ts
const child_process_1 = require("child_process");
function openPDF(filePath) {
    const command = process.platform === 'win32'
        ? `start ${filePath}`
        : process.platform === 'darwin'
            ? `open ${filePath}`
            : `xdg-open ${filePath}`;
    (0, child_process_1.exec)(command, (error) => {
        if (error) {
            console.error('Failed to open PDF:', error);
        }
    });
}
exports.openPDF = openPDF;
