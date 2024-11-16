"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/register', userController_1.registerUser);
router.post('/login', userController_1.loginUser);
router.get('/protected', auth_1.default, (req, res) => {
    res.send("This is a protected route. You're authenticated!");
});
router.get('/admin', auth_1.default, (0, userController_1.requireRole)('admin'), (req, res) => {
    // This route can only be accessed by authenticated users with the 'admin' role
    res.send('Welcome, admin!');
});
router.get('/verify-email', userController_1.verifyEmail);
router.post('/upload-image', auth_1.default, userController_1.uploadImage);
exports.default = router;
