import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for server-side operations
 */

let firebaseApp: admin.app.App;

export const initializeFirebase = (): admin.app.App => {
  try {
    if (firebaseApp) {
      return firebaseApp;
    }

    // Validate required environment variables
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

    // Initialize Firebase Admin SDK
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

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

// Initialize Firebase
initializeFirebase();

// Export Firebase services
export const auth = getAuth();
export const db = getFirestore();

// Export Firebase app
export { firebaseApp };

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  FILES: 'files',
  PROCESSING_SESSIONS: 'processing_sessions',
  USAGE_STATS: 'usage_stats',
  SUBSCRIPTIONS: 'subscriptions',
} as const;

// Firebase Auth Custom Claims
export const USER_ROLES = {
  FREE: 'free',
  PREMIUM: 'premium',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];