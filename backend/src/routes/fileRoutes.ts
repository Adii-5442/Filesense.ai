import express from 'express';
import {
  uploadFiles,
  processFiles,
  getProcessingStatus,
  extractText,
  generateFilename,
  getUserFiles,
  upload,
} from '../controllers/fileController';
import {
  authenticateToken,
  optionalAuth,
  checkFileProcessingLimit,
  requirePremium,
  AuthenticatedRequest
} from '../middleware/auth';
import rateLimit from 'express-rate-limit';

/**
 * File Processing Routes
 * Handles file upload, processing, and AI operations
 */

const router = express.Router();

// Rate limiting for file operations
const fileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 file uploads per 15 minutes
  message: {
    success: false,
    error: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 100 AI requests per hour
  message: {
    success: false,
    error: 'AI service rate limit exceeded, please try again later.',
    code: 'AI_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/v1/files/upload
 * @desc    Upload files for processing
 * @access  Public (with file limits for guests)
 */
router.post('/upload', 
  fileUploadLimiter,
  optionalAuth,
  checkFileProcessingLimit,
  upload.array('files', 20),
  uploadFiles
);

/**
 * @route   POST /api/v1/files/process
 * @desc    Start processing uploaded files
 * @access  Public (with file limits for guests)
 */
router.post('/process',
  optionalAuth,
  checkFileProcessingLimit,
  processFiles
);

/**
 * @route   GET /api/v1/files/processing/:sessionId
 * @desc    Get processing session status
 * @access  Public
 */
router.get('/processing/:sessionId', getProcessingStatus);

/**
 * @route   POST /api/v1/files/:fileId/extract-text
 * @desc    Extract text from a specific file
 * @access  Public (with file limits for guests)
 */
router.post('/:fileId/extract-text',
  optionalAuth,
  checkFileProcessingLimit,
  extractText
);

/**
 * @route   POST /api/v1/files/generate-filename
 * @desc    Generate filename using AI
 * @access  Public (with rate limiting)
 */
router.post('/generate-filename',
  aiLimiter,
  optionalAuth,
  generateFilename
);

/**
 * @route   GET /api/v1/files/my-files
 * @desc    Get user's processed files
 * @access  Private
 */
router.get('/my-files', authenticateToken, getUserFiles);

/**
 * @route   POST /api/v1/files/batch-process
 * @desc    Process multiple files in batch (Premium feature)
 * @access  Private (Premium only)
 */
router.post('/batch-process',
  authenticateToken,
  requirePremium,
  processFiles
);

/**
 * @route   GET /api/v1/files/usage-stats
 * @desc    Get user's usage statistics
 * @access  Private
 */
router.get('/usage-stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // This would fetch from database in real implementation
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage stats',
      code: 'STATS_FETCH_FAILED'
    });
  }
});

export default router;