import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { DatabaseService, UserDocument } from '../config/database';

/**
 * Authentication middleware for protecting routes
 */

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
  uid?: string;
  session?: {
    guestFileCount?: number;
  };
}

/**
 * Middleware to verify Firebase ID token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
      return;
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    req.uid = decodedToken.uid;

    // Get user data from Firestore
    const user = await DatabaseService.getUser(decodedToken.uid);
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
  } catch (error) {
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

/**
 * Middleware to check if user can process files (for guest/free tier limits)
 */
export const checkFileProcessingLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fileCount = req.body.fileCount || req.files?.length || 1;
    
    // If no user (guest), allow only 5 files total per session
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
      
      // Update guest file count in session
      if (req.session) {
        req.session.guestFileCount = guestFileCount + fileCount;
      }
      
      next();
      return;
    }

    // For authenticated users, check monthly limits
    const { canProcess, remainingFiles } = await DatabaseService.canProcessFiles(
      req.user.uid,
      fileCount
    );

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
  } catch (error) {
    console.error('File limit check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check file processing limits',
      code: 'LIMIT_CHECK_FAILED'
    });
  }
};

/**
 * Middleware to require premium subscription
 */
export const requirePremium = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
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

/**
 * Middleware to require admin access
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
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

/**
 * Optional authentication middleware (allows both authenticated and guest users)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        req.uid = decodedToken.uid;
        
        const user = await DatabaseService.getUser(decodedToken.uid);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid or expired, continue as guest
        console.log('Optional auth failed, continuing as guest:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue as guest even if there's an error
  }
};