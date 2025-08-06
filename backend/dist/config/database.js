"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const firebase_1 = require("./firebase");
const firestore_1 = require("firebase-admin/firestore");
class DatabaseService {
    static async createUser(userData) {
        const now = firestore_1.FieldValue.serverTimestamp();
        const userDoc = {
            role: 'free',
            filesProcessedThisMonth: 0,
            monthlyLimit: 5,
            totalFilesProcessed: 0,
            subscriptionStatus: 'inactive',
            settings: {
                autoRename: true,
                preserveOriginalNames: false,
                useAIForAllFiles: true,
                maxFileSize: 50 * 1024 * 1024,
            },
            createdAt: now,
            updatedAt: now,
            ...userData,
        };
        await firebase_1.db.collection(firebase_1.COLLECTIONS.USERS).doc(userData.uid).set(userDoc);
    }
    static async getUser(uid) {
        const doc = await firebase_1.db.collection(firebase_1.COLLECTIONS.USERS).doc(uid).get();
        return doc.exists ? doc.data() : null;
    }
    static async updateUser(uid, updates) {
        await firebase_1.db.collection(firebase_1.COLLECTIONS.USERS).doc(uid).update({
            ...updates,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    static async canProcessFiles(uid, fileCount) {
        const user = await this.getUser(uid);
        if (!user) {
            throw new Error('User not found');
        }
        const remainingFiles = user.monthlyLimit - user.filesProcessedThisMonth;
        const canProcess = remainingFiles >= fileCount || user.role === 'premium';
        return { canProcess, remainingFiles };
    }
    static async incrementFileCount(uid, count) {
        await firebase_1.db.collection(firebase_1.COLLECTIONS.USERS).doc(uid).update({
            filesProcessedThisMonth: firestore_1.FieldValue.increment(count),
            totalFilesProcessed: firestore_1.FieldValue.increment(count),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    static async createFile(fileData) {
        const now = firestore_1.FieldValue.serverTimestamp();
        const fileDoc = {
            isProcessed: false,
            isRenamed: false,
            processingStatus: 'pending',
            createdAt: now,
            updatedAt: now,
            ...fileData,
        };
        const docRef = await firebase_1.db.collection(firebase_1.COLLECTIONS.FILES).add(fileDoc);
        return docRef.id;
    }
    static async updateFile(fileId, updates) {
        await firebase_1.db.collection(firebase_1.COLLECTIONS.FILES).doc(fileId).update({
            ...updates,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    static async getUserFiles(uid, limit = 50) {
        const snapshot = await firebase_1.db
            .collection(firebase_1.COLLECTIONS.FILES)
            .where('userId', '==', uid)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    static async createProcessingSession(sessionData) {
        const now = firestore_1.FieldValue.serverTimestamp();
        const sessionDoc = {
            status: 'pending',
            progress: 0,
            currentFileIndex: 0,
            processedFiles: 0,
            renamedFiles: 0,
            failedFiles: 0,
            createdAt: now,
            updatedAt: now,
            ...sessionData,
        };
        const docRef = await firebase_1.db.collection(firebase_1.COLLECTIONS.PROCESSING_SESSIONS).add(sessionDoc);
        return docRef.id;
    }
    static async updateProcessingSession(sessionId, updates) {
        await firebase_1.db.collection(firebase_1.COLLECTIONS.PROCESSING_SESSIONS).doc(sessionId).update({
            ...updates,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    static async updateUsageStats(uid, stats) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate().toString().padStart(2, '0');
        const statsId = `${uid}_${year}_${month}`;
        const statsRef = firebase_1.db.collection(firebase_1.COLLECTIONS.USAGE_STATS).doc(statsId);
        const currentStats = await statsRef.get();
        if (currentStats.exists) {
            const data = currentStats.data();
            await statsRef.update({
                filesProcessed: firestore_1.FieldValue.increment(stats.filesProcessed || 0),
                textExtracted: firestore_1.FieldValue.increment(stats.textExtracted || 0),
                filesRenamed: firestore_1.FieldValue.increment(stats.filesRenamed || 0),
                apiCallsMade: firestore_1.FieldValue.increment(stats.apiCallsMade || 0),
                [`dailyStats.${day}.filesProcessed`]: firestore_1.FieldValue.increment(stats.filesProcessed || 0),
                [`dailyStats.${day}.textExtracted`]: firestore_1.FieldValue.increment(stats.textExtracted || 0),
                [`dailyStats.${day}.filesRenamed`]: firestore_1.FieldValue.increment(stats.filesRenamed || 0),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        else {
            const newStats = {
                userId: uid,
                year,
                month,
                filesProcessed: stats.filesProcessed || 0,
                textExtracted: stats.textExtracted || 0,
                filesRenamed: stats.filesRenamed || 0,
                apiCallsMade: stats.apiCallsMade || 0,
                dailyStats: {
                    [day]: {
                        filesProcessed: stats.filesProcessed || 0,
                        textExtracted: stats.textExtracted || 0,
                        filesRenamed: stats.filesRenamed || 0,
                    },
                },
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            };
            await statsRef.set(newStats);
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.default = DatabaseService;
//# sourceMappingURL=database.js.map