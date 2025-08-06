import { Request, Response, NextFunction } from 'express';
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const strictLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const csp: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=security.d.ts.map