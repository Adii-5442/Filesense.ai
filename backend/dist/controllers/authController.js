"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.updateUserProfile = exports.getCurrentUser = exports.registerUser = exports.verifyOtp = exports.sendOtp = void 0;
const firebase_1 = require("../config/firebase");
const database_1 = require("../config/database");
const joi_1 = __importDefault(require("joi"));
const phoneVerificationSchema = joi_1.default.object({
    phoneNumber: joi_1.default.string()
        .pattern(/^\+[1-9]\d{1,14}$/)
        .required()
        .messages({
        'string.pattern.base': 'Phone number must be in international format (e.g., +1234567890)',
    }),
    recaptchaToken: joi_1.default.string().optional(),
});
const verifyOtpSchema = joi_1.default.object({
    phoneNumber: joi_1.default.string()
        .pattern(/^\+[1-9]\d{1,14}$/)
        .required(),
    sessionInfo: joi_1.default.string().required(),
    otpCode: joi_1.default.string().length(6).required(),
});
const registerUserSchema = joi_1.default.object({
    idToken: joi_1.default.string().required(),
    displayName: joi_1.default.string().min(2).max(50).optional(),
    email: joi_1.default.string().email().optional(),
});
const sendOtp = async (req, res) => {
    try {
        const { error, value } = phoneVerificationSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: error.details[0].message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }
        const { phoneNumber } = value;
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                phoneNumber,
                sessionInfo: `mock_session_${Date.now()}`,
                expiresIn: 300
            }
        });
    }
    catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send OTP',
            code: 'OTP_SEND_FAILED'
        });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    try {
        const { error, value } = verifyOtpSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: error.details[0].message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }
        const { phoneNumber, sessionInfo, otpCode } = value;
        if (otpCode === '000000') {
            res.status(400).json({
                success: false,
                error: 'Invalid OTP code',
                code: 'INVALID_OTP'
            });
            return;
        }
        let userRecord;
        try {
            userRecord = await firebase_1.auth.getUserByPhoneNumber(phoneNumber);
        }
        catch (error) {
            userRecord = await firebase_1.auth.createUser({
                phoneNumber,
            });
        }
        const customToken = await firebase_1.auth.createCustomToken(userRecord.uid);
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                customToken,
                uid: userRecord.uid,
                phoneNumber: userRecord.phoneNumber,
                isNewUser: !userRecord.customClaims
            }
        });
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify OTP',
            code: 'OTP_VERIFICATION_FAILED'
        });
    }
};
exports.verifyOtp = verifyOtp;
const registerUser = async (req, res) => {
    try {
        const { error, value } = registerUserSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: error.details[0].message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }
        const { idToken, displayName, email } = value;
        const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const userRecord = await firebase_1.auth.getUser(uid);
        const existingUser = await database_1.DatabaseService.getUser(uid);
        if (!existingUser) {
            await database_1.DatabaseService.createUser({
                uid,
                phoneNumber: userRecord.phoneNumber,
                displayName: displayName || undefined,
                email: email || userRecord.email || undefined,
                role: 'free',
            });
            await firebase_1.auth.setCustomUserClaims(uid, { role: 'free' });
        }
        else {
            const updates = {};
            if (displayName)
                updates.displayName = displayName;
            if (email)
                updates.email = email;
            if (Object.keys(updates).length > 0) {
                await database_1.DatabaseService.updateUser(uid, updates);
            }
        }
        const userData = await database_1.DatabaseService.getUser(uid);
        res.status(200).json({
            success: true,
            message: existingUser ? 'User profile updated' : 'User registered successfully',
            data: {
                user: {
                    uid: userData.uid,
                    phoneNumber: userData.phoneNumber,
                    displayName: userData.displayName,
                    email: userData.email,
                    role: userData.role,
                    subscriptionStatus: userData.subscriptionStatus,
                    filesProcessedThisMonth: userData.filesProcessedThisMonth,
                    monthlyLimit: userData.monthlyLimit,
                }
            }
        });
    }
    catch (error) {
        console.error('Register user error:', error);
        if (error instanceof Error && error.message.includes('Token expired')) {
            res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to register user',
            code: 'REGISTRATION_FAILED'
        });
    }
};
exports.registerUser = registerUser;
const getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required',
                code: 'TOKEN_MISSING'
            });
            return;
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        const userData = await database_1.DatabaseService.getUser(decodedToken.uid);
        if (!userData) {
            res.status(404).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                user: {
                    uid: userData.uid,
                    phoneNumber: userData.phoneNumber,
                    displayName: userData.displayName,
                    email: userData.email,
                    role: userData.role,
                    subscriptionStatus: userData.subscriptionStatus,
                    filesProcessedThisMonth: userData.filesProcessedThisMonth,
                    monthlyLimit: userData.monthlyLimit,
                    totalFilesProcessed: userData.totalFilesProcessed,
                    settings: userData.settings,
                    createdAt: userData.createdAt,
                    lastLoginAt: userData.lastLoginAt,
                }
            }
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile',
            code: 'GET_USER_FAILED'
        });
    }
};
exports.getCurrentUser = getCurrentUser;
const updateUserProfile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required',
                code: 'TOKEN_MISSING'
            });
            return;
        }
        const updateSchema = joi_1.default.object({
            displayName: joi_1.default.string().min(2).max(50).optional(),
            email: joi_1.default.string().email().optional(),
            settings: joi_1.default.object({
                autoRename: joi_1.default.boolean().optional(),
                preserveOriginalNames: joi_1.default.boolean().optional(),
                useAIForAllFiles: joi_1.default.boolean().optional(),
                maxFileSize: joi_1.default.number().min(1024).max(100 * 1024 * 1024).optional(),
            }).optional(),
        });
        const { error, value } = updateSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: error.details[0].message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        const uid = decodedToken.uid;
        await database_1.DatabaseService.updateUser(uid, value);
        const userData = await database_1.DatabaseService.getUser(uid);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    uid: userData.uid,
                    phoneNumber: userData.phoneNumber,
                    displayName: userData.displayName,
                    email: userData.email,
                    role: userData.role,
                    subscriptionStatus: userData.subscriptionStatus,
                    settings: userData.settings,
                }
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            code: 'UPDATE_PROFILE_FAILED'
        });
    }
};
exports.updateUserProfile = updateUserProfile;
const logoutUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required',
                code: 'TOKEN_MISSING'
            });
            return;
        }
        const decodedToken = await firebase_1.auth.verifyIdToken(token);
        await firebase_1.auth.revokeRefreshTokens(decodedToken.uid);
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout',
            code: 'LOGOUT_FAILED'
        });
    }
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=authController.js.map