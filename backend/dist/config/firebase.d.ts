import admin from 'firebase-admin';
declare let firebaseApp: admin.app.App;
export declare const initializeFirebase: () => admin.app.App;
export declare const auth: import("firebase-admin/auth").Auth;
export declare const db: admin.firestore.Firestore;
export { firebaseApp };
export declare const COLLECTIONS: {
    readonly USERS: "users";
    readonly FILES: "files";
    readonly PROCESSING_SESSIONS: "processing_sessions";
    readonly USAGE_STATS: "usage_stats";
    readonly SUBSCRIPTIONS: "subscriptions";
};
export declare const USER_ROLES: {
    readonly FREE: "free";
    readonly PREMIUM: "premium";
    readonly ADMIN: "admin";
};
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
//# sourceMappingURL=firebase.d.ts.map