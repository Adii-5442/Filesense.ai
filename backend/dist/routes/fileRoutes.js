"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = require("../controllers/fileController");
const auth_1 = require("../middleware/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
const fileUploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        error: 'Too many file uploads, please try again later.',
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const aiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'AI service rate limit exceeded, please try again later.',
        code: 'AI_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/upload', fileUploadLimiter, auth_1.optionalAuth, auth_1.checkFileProcessingLimit, fileController_1.upload.array('files', 20), fileController_1.uploadFiles);
router.post('/process', auth_1.optionalAuth, auth_1.checkFileProcessingLimit, fileController_1.processFiles);
router.get('/processing/:sessionId', fileController_1.getProcessingStatus);
router.post('/:fileId/extract-text', auth_1.optionalAuth, auth_1.checkFileProcessingLimit, fileController_1.extractText);
router.post('/generate-filename', aiLimiter, auth_1.optionalAuth, fileController_1.generateFilename);
router.get('/my-files', auth_1.authenticateToken, fileController_1.getUserFiles);
router.post('/batch-process', auth_1.authenticateToken, auth_1.requirePremium, fileController_1.processFiles);
router.get('/usage-stats', auth_1.authenticateToken, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                thisMonth: {
                    filesProcessed: 15,
                    textExtracted: 15,
                    filesRenamed: 12,
                    apiCallsMade: 18,
                },
                allTime: {
                    filesProcessed: 156,
                    textExtracted: 156,
                    filesRenamed: 142,
                    apiCallsMade: 178,
                },
                limits: {
                    monthlyLimit: req.user?.monthlyLimit || 5,
                    remainingFiles: (req.user?.monthlyLimit || 5) - (req.user?.filesProcessedThisMonth || 0),
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch usage stats',
            code: 'STATS_FETCH_FAILED'
        });
    }
});
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map