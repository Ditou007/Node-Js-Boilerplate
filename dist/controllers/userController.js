"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.verifyEmail = exports.requireRole = exports.loginUser = exports.registerUser = void 0;
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const mailer_1 = require("../config/mailer");
const upload_1 = __importDefault(require("../middleware/upload"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
//!AWS CONFIG
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'your-region',
});
function generateVerificationToken() {
    return crypto_1.default.randomBytes(20).toString('hex');
}
const registerUser = async (req, res) => {
    try {
        const existingUser = await user_1.default.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already registered.' });
        }
        const user = new user_1.default(req.body);
        // Generate email verification token
        const token = generateVerificationToken();
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now in milliseconds
        user.emailVerificationToken = token;
        user.emailVerificationTokenExpires = oneHourFromNow;
        await user.save();
        //! Change this to the link where you handle email verification on your frontend
        const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
        await (0, mailer_1.sendEmail)(user.email, 'Email Verification', `Please verify your email by clicking on the following link: ${verificationLink}`);
        const jwtToken = jsonwebtoken_1.default.sign({ userId: user._id, roles: user.roles }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(201).send({ user, token: jwtToken });
    }
    catch (error) {
        res.status(400).send(error);
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const user = await user_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).send({ error: 'Invalid login credentials.' });
        }
        const isMatch = await bcryptjs_1.default.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid login credentials.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, roles: user.roles }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.send({ user, token });
    }
    catch (error) {
        res.status(400).send(error);
    }
};
exports.loginUser = loginUser;
const requireRole = (role) => {
    return (req, res, next) => {
        console.log('req.user', req.user);
        console.log('role', role);
        if (req.user && req.user.roles && req.user.roles.includes(role)) {
            next();
        }
        else {
            res.status(403).send('Access denied.');
        }
    };
};
exports.requireRole = requireRole;
const verifyEmail = async (req, res) => {
    const token = req.query.token;
    // Find the user with the matching verification token
    const user = await user_1.default.findOne({
        emailVerificationToken: token,
        emailVerificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res.status(400).send({ message: 'Invalid or expired token.' });
    }
    // Set user's email as verified and clear the verification token and expiration
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save();
    res.send({ message: 'Email verified successfully.' });
};
exports.verifyEmail = verifyEmail;
const s3 = new aws_sdk_1.default.S3();
async function uploadToS3(key, buffer, mimeType) {
    const params = {
        Bucket: 'projectadsbucket',
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
    };
    await s3.upload(params).promise();
    return `https://projectadsbucket.s3.amazonaws.com/${key}`;
}
async function uploadImageToStorage(imageBuffer, mimeType) {
    const key = `uploads/${Date.now()}.jpg`; // Generate a unique key, adjust as needed
    return uploadToS3(key, imageBuffer, mimeType);
}
exports.uploadImage = [
    upload_1.default.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send('No file uploaded.');
            }
            // Add a check for req.user and req.user.userId since TypeScript might not be aware that they are defined.
            if (!req.user || !req.user.userId) {
                return res.status(401).send('Unauthorized.');
            }
            const userId = req.user.userId;
            const imageUrl = await uploadImageToStorage(req.file.buffer, req.file.mimetype);
            const description = req.body.description;
            await user_1.default.findByIdAndUpdate(userId, { $push: { images: { url: imageUrl, description } } }, { new: true });
            res.status(200).send({ message: 'Image uploaded successfully!' });
        }
        catch (error) {
            res.status(500).send(error);
        }
    },
];
