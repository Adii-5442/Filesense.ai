import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare const uploadFiles: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const processFiles: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getProcessingStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const extractText: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const generateFilename: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getUserFiles: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=fileController.d.ts.map