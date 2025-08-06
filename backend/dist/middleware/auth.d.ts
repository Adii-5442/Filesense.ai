import { Request, Response, NextFunction } from 'express';
import { UserDocument } from '../config/database';
export interface AuthenticatedRequest extends Request {
    user?: UserDocument;
    uid?: string;
    session?: {
        guestFileCount?: number;
    };
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const checkFileProcessingLimit: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePremium: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map