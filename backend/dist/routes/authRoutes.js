"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        error: 'Too many OTP requests, please try again later.',
        code: 'OTP_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/send-otp', otpLimiter, authController_1.sendOtp);
router.post('/verify-otp', authLimiter, authController_1.verifyOtp);
router.post('/register', authLimiter, authController_1.registerUser);
router.get('/me', auth_1.authenticateToken, authController_1.getCurrentUser);
router.put('/profile', auth_1.authenticateToken, authController_1.updateUserProfile);
router.post('/logout', auth_1.authenticateToken, authController_1.logoutUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map