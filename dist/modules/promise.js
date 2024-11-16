"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const readFilePromise = (filePath) => {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};
readFilePromise('sample.txt')
    .then((data) => {
    console.log('File content:', data);
})
    .catch((err) => {
    console.error('Error reading the file:', err);
});
const readFileSync = async (filePath) => {
    try {
        const data = await readFilePromise(filePath);
        console.log('File content with async/await:', data);
    }
    catch (err) {
        console.error('Error reading the file with async/await:', err);
    }
};
// Usage
readFileSync('sample.txt');
