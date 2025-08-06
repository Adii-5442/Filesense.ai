import express from 'express';
import {
  sendOtp,
  verifyOtp,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  logoutUser,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

/**
 * Authentication Routes
 * Handles phone auth, registration, and user management
 */

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 OTP requests per 5 minutes
  message: {
    success: false,
    error: 'Too many OTP requests, please try again later.',
    code: 'OTP_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
router.post('/send-otp', otpLimiter, sendOtp);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and get custom token
 * @access  Public
 */
router.post('/verify-otp', authLimiter, verifyOtp);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register/update user profile after phone verification
 * @access  Public
 */
router.post('/register', authLimiter, registerUser);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, getCurrentUser);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, updateUserProfile);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (revoke refresh tokens)
 * @access  Private
 */
router.post('/logout', authenticateToken, logoutUser);

export default router;