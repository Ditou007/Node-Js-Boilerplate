"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD,
    },
});
const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: process.env.GMAIL,
        to,
        subject,
        html,
    };
    return transporter.sendMail(mailOptions);
};
exports.sendEmail = sendEmail;
