import { Request, Response } from 'express';
export declare const sendOtp: (req: Request, res: Response) => Promise<void>;
export declare const verifyOtp: (req: Request, res: Response) => Promise<void>;
export declare const registerUser: (req: Request, res: Response) => Promise<void>;
export declare const getCurrentUser: (req: Request, res: Response) => Promise<void>;
export declare const updateUserProfile: (req: Request, res: Response) => Promise<void>;
export declare const logoutUser: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map