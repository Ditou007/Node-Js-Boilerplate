"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        default: ['user'],
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
    images: [
        {
            url: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                default: '',
            },
        },
    ],
});
userSchema.pre('save', async function (next) {
    // 'this' refers to the user document about to be saved
    const user = this;
    // Ensure password is modified before hashing
    if (user.isModified('password')) {
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(user.password, salt);
    }
    next();
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
