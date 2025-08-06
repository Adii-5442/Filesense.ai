import { Request, Response, NextFunction } from 'express';
export interface APIError extends Error {
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
}
export declare const errorHandler: (error: APIError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map