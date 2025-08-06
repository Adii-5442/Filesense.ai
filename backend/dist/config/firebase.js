"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ROLES = exports.COLLECTIONS = exports.firebaseApp = exports.db = exports.auth = exports.initializeFirebase = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
let firebaseApp;
const initializeFirebase = () => {
    try {
        if (firebaseApp) {
            return firebaseApp;
        }
        const requiredEnvVars = [
            'FIREBASE_PROJECT_ID',
            'FIREBASE_PRIVATE_KEY_ID',
            'FIREBASE_PRIVATE_KEY',
            'FIREBASE_CLIENT_EMAIL',
            'FIREBASE_CLIENT_ID',
        ];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }
        const firebaseConfig = {
            type: 'service_account',
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
            token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        };
        exports.firebaseApp = firebaseApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(firebaseConfig),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('✅ Firebase Admin SDK initialized successfully');
        return firebaseApp;
    }
    catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error);
        throw error;
    }
};
exports.initializeFirebase = initializeFirebase;
(0, exports.initializeFirebase)();
exports.auth = (0, auth_1.getAuth)();
exports.db = (0, firestore_1.getFirestore)();
exports.COLLECTIONS = {
    USERS: 'users',
    FILES: 'files',
    PROCESSING_SESSIONS: 'processing_sessions',
    USAGE_STATS: 'usage_stats',
    SUBSCRIPTIONS: 'subscriptions',
};
exports.USER_ROLES = {
    FREE: 'free',
    PREMIUM: 'premium',
    ADMIN: 'admin',
};
//# sourceMappingURL=firebase.js.map