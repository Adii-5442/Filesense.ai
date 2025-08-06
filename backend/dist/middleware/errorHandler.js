"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error caught by global handler:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';
    let code = error.code || 'INTERNAL_ERROR';
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
    }
    if (error.name === 'MongoError' && error.message.includes('duplicate key')) {
        statusCode = 409;
        message = 'Resource already exists';
        code = 'DUPLICATE_RESOURCE';
    }
    if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        code = 'INVALID_ID';
    }
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        code = 'TOKEN_EXPIRED';
    }
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Something went wrong';
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        code,
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
        }),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
        code: 'ROUTE_NOT_FOUND',
    });
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map