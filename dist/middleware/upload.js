"use strict";
// middleware/uploadMiddleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage(); // Storing the file in memory; you might want to upload this to a cloud storage later
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 7 * 1024 * 1024, // limiting files size to 7 MB
    },
});
exports.default = upload;
