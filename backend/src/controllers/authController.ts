import { Request, Response } from 'express';
import { auth } from '../config/firebase';
import { DatabaseService } from '../config/database';
import Joi from 'joi';

/**
 * Authentication Controller
 * Handles user registration, login, and phone verification
 */

// Validation schemas
const phoneVerificationSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be in international format (e.g., +1234567890)',
    }),
  recaptchaToken: Joi.string().optional(),
});

const verifyOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required(),
  sessionInfo: Joi.string().required(),
  otpCode: Joi.string().length(6).required(),
});

const registerUserSchema = Joi.object({
  idToken: Joi.string().required(),
  displayName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
});

/**
 * Send OTP to phone number for verification
 */
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
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

    // Note: Firebase Admin SDK doesn't support sending SMS directly
    // This would typically be handled by the client-side Firebase Auth SDK
    // For demonstration, we'll return a mock session info
    
    // In a real implementation, you might:
    // 1. Use Firebase Auth REST API to send SMS
    // 2. Use a third-party SMS service like Twilio
    // 3. Let the client handle SMS sending and just verify the result here

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber,
        sessionInfo: `mock_session_${Date.now()}`, // This would be real session info from Firebase
        expiresIn: 300 // 5 minutes
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
      code: 'OTP_SEND_FAILED'
    });
  }
};

/**
 * Verify OTP and get Firebase custom token
 */
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
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

    // Note: In a real implementation, you would verify the OTP here
    // For demo purposes, we'll accept any 6-digit code that isn't "000000"
    if (otpCode === '000000') {
      res.status(400).json({
        success: false,
        error: 'Invalid OTP code',
        code: 'INVALID_OTP'
      });
      return;
    }

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByPhoneNumber(phoneNumber);
    } catch (error) {
      // User doesn't exist, create new user
      userRecord = await auth.createUser({
        phoneNumber,
      });
    }

    // Create custom token for the user
    const customToken = await auth.createCustomToken(userRecord.uid);

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

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
      code: 'OTP_VERIFICATION_FAILED'
    });
  }
};

/**
 * Register/Update user profile after phone verification
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
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

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user record from Firebase Auth
    const userRecord = await auth.getUser(uid);

    // Check if user already exists in Firestore
    const existingUser = await DatabaseService.getUser(uid);

    if (!existingUser) {
      // Create new user in Firestore
      await DatabaseService.createUser({
        uid,
        phoneNumber: userRecord.phoneNumber!,
        displayName: displayName || undefined,
        email: email || userRecord.email || undefined,
        role: 'free',
      });

      // Set custom claims for role-based access
      await auth.setCustomUserClaims(uid, { role: 'free' });
    } else {
      // Update existing user
      const updates: any = {};
      if (displayName) updates.displayName = displayName;
      if (email) updates.email = email;
      
      if (Object.keys(updates).length > 0) {
        await DatabaseService.updateUser(uid, updates);
      }
    }

    // Get updated user data
    const userData = await DatabaseService.getUser(uid);

    res.status(200).json({
      success: true,
      message: existingUser ? 'User profile updated' : 'User registered successfully',
      data: {
        user: {
          uid: userData!.uid,
          phoneNumber: userData!.phoneNumber,
          displayName: userData!.displayName,
          email: userData!.email,
          role: userData!.role,
          subscriptionStatus: userData!.subscriptionStatus,
          filesProcessedThisMonth: userData!.filesProcessedThisMonth,
          monthlyLimit: userData!.monthlyLimit,
        }
      }
    });

  } catch (error) {
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

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
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

    const decodedToken = await auth.verifyIdToken(token);
    const userData = await DatabaseService.getUser(decodedToken.uid);

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

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
      code: 'GET_USER_FAILED'
    });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
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

    const updateSchema = Joi.object({
      displayName: Joi.string().min(2).max(50).optional(),
      email: Joi.string().email().optional(),
      settings: Joi.object({
        autoRename: Joi.boolean().optional(),
        preserveOriginalNames: Joi.boolean().optional(),
        useAIForAllFiles: Joi.boolean().optional(),
        maxFileSize: Joi.number().min(1024).max(100 * 1024 * 1024).optional(),
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

    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Update user in Firestore
    await DatabaseService.updateUser(uid, value);

    // Get updated user data
    const userData = await DatabaseService.getUser(uid);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          uid: userData!.uid,
          phoneNumber: userData!.phoneNumber,
          displayName: userData!.displayName,
          email: userData!.email,
          role: userData!.role,
          subscriptionStatus: userData!.subscriptionStatus,
          settings: userData!.settings,
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      code: 'UPDATE_PROFILE_FAILED'
    });
  }
};

/**
 * Logout user (revoke refresh tokens)
 */
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
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

    const decodedToken = await auth.verifyIdToken(token);
    
    // Revoke refresh tokens to force re-authentication
    await auth.revokeRefreshTokens(decodedToken.uid);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
      code: 'LOGOUT_FAILED'
    });
  }
};