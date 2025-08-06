"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAdmin = exports.requirePremium = exports.checkFileProcessingLimit = exports.authenticateToken = void 0;
const firebase_1 = require("../config/firebase");
const database_1 = require("../config/database");
const authenticateToken = async (req, res, next) => {
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
        req.uid = decodedToken.uid;
        const user = await database_1.DatabaseService.getUser(decodedToken.uid);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        if (error instanceof Error) {
            if (error.message.includes('Token expired')) {
                res.status(401).json({
                    success: false,
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED'
                });
                return;
            }
            if (error.message.includes('Invalid token')) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid token',
                    code: 'TOKEN_INVALID'
                });
                return;
            }
        }
        res.status(401).json({
            success: false,
            error: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};
exports.authenticateToken = authenticateToken;
const checkFileProcessingLimit = async (req, res, next) => {
    try {
        const fileCount = req.body.fileCount || req.files?.length || 1;
        if (!req.user) {
            const guestFileCount = req.session?.guestFileCount || 0;
            if (guestFileCount + fileCount > 5) {
                res.status(403).json({
                    success: false,
                    error: 'Guest users can only process 5 files. Please sign up for more.',
                    code: 'GUEST_LIMIT_EXCEEDED',
                    data: {
                        guestLimit: 5,
                        currentCount: guestFileCount,
                        requestedCount: fileCount
                    }
                });
                return;
            }
            if (req.session) {
                req.session.guestFileCount = guestFileCount + fileCount;
            }
            next();
            return;
        }
        const { canProcess, remainingFiles } = await database_1.DatabaseService.canProcessFiles(req.user.uid, fileCount);
        if (!canProcess) {
            res.status(403).json({
                success: false,
                error: 'Monthly file processing limit exceeded. Upgrade to premium for unlimited processing.',
                code: 'MONTHLY_LIMIT_EXCEEDED',
                data: {
                    monthlyLimit: req.user.monthlyLimit,
                    filesProcessedThisMonth: req.user.filesProcessedThisMonth,
                    remainingFiles,
                    requestedCount: fileCount
                }
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('File limit check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check file processing limits',
            code: 'LIMIT_CHECK_FAILED'
        });
    }
};
exports.checkFileProcessingLimit = checkFileProcessingLimit;
const requirePremium = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
        return;
    }
    if (req.user.role !== 'premium' && req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Premium subscription required for this feature',
            code: 'PREMIUM_REQUIRED',
            data: {
                currentPlan: req.user.role,
                subscriptionStatus: req.user.subscriptionStatus
            }
        });
        return;
    }
    next();
};
exports.requirePremium = requirePremium;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
        });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Admin access required',
            code: 'ADMIN_REQUIRED'
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            try {
                const decodedToken = await firebase_1.auth.verifyIdToken(token);
                req.uid = decodedToken.uid;
                const user = await database_1.DatabaseService.getUser(decodedToken.uid);
                if (user) {
                    req.user = user;
                }
            }
            catch (error) {
                console.log('Optional auth failed, continuing as guest:', error);
            }
        }
        next();
    }
    catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map