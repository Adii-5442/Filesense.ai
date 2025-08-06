"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const security_1 = require("./middleware/security");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
require("./config/firebase");
dotenv_1.default.config();
const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use(security_1.securityHeaders);
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com', 'https://app.yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:19006'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(security_1.requestLogger);
app.use(security_1.generalLimiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FileSense.AI Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
    });
});
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'FileSense.AI API v1',
        documentation: 'https://docs.filesense.ai',
        endpoints: {
            auth: '/api/v1/auth',
            files: '/api/v1/files',
            health: '/health',
        },
        features: [
            'Phone number authentication',
            'File upload and processing',
            'AI-powered filename generation',
            'Text extraction from images and PDFs',
            'Usage tracking and limits',
        ],
    });
});
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes_1.default);
app.use(`/api/${API_VERSION}/files`, fileRoutes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
    console.log(`
🚀 FileSense.AI Backend Server Started
📡 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server: http://${HOST}:${PORT}
🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}
📚 API Documentation: http://${HOST}:${PORT}/api
❤️  Health Check: http://${HOST}:${PORT}/health

🎯 Ready to process files with AI!
  `);
});
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Process terminated');
        process.exit(0);
    });
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        process.exit(1);
    });
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    server.close(() => {
        process.exit(1);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map