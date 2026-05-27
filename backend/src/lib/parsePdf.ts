// import fs from 'fs';
import { PdfReader } from 'pdfreader';

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
    return new Promise((resolve) => {
        const textItems: string[] = [];

        new PdfReader(null).parseFileItems(filePath, (err, item) => {
            if (err) {
                console.error('PDF parse error:', err);
                resolve('');
                return;
            }

            if (!item) {
                // end of file
                const text = textItems.join(' ').trim().slice(0, 3000);
                resolve(text);
                return;
            }

            if (item.text) {
                textItems.push(item.text);
            }
        });
    });
};