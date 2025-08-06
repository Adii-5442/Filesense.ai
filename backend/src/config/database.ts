import { db, COLLECTIONS } from './firebase';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Database configuration and helper functions
 * Provides standardized Firestore operations
 */

export interface UserDocument {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  email?: string;
  role: 'free' | 'premium' | 'admin';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  lastLoginAt?: FirebaseFirestore.Timestamp;
  
  // Usage tracking
  filesProcessedThisMonth: number;
  monthlyLimit: number;
  totalFilesProcessed: number;
  
  // Subscription info
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'trial';
  subscriptionId?: string;
  subscriptionExpiresAt?: FirebaseFirestore.Timestamp;
  
  // Settings
  settings: {
    autoRename: boolean;
    preserveOriginalNames: boolean;
    useAIForAllFiles: boolean;
    maxFileSize: number;
  };
}

export interface FileDocument {
  id: string;
  userId: string;
  originalName: string;
  newName?: string;
  filePath: string;
  fileType: 'image' | 'pdf' | 'document';
  fileSize: number;
  mimeType: string;
  
  // Processing info
  extractedText?: string;
  suggestedName?: string;
  isProcessed: boolean;
  isRenamed: boolean;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Metadata
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  processedAt?: FirebaseFirestore.Timestamp;
}

export interface ProcessingSessionDocument {
  id: string;
  userId: string;
  fileIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentFileIndex: number;
  
  // Results
  totalFiles: number;
  processedFiles: number;
  renamedFiles: number;
  failedFiles: number;
  
  // Timestamps
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  
  // Error info
  errorMessage?: string;
  failedFileIds?: string[];
}

export interface UsageStatsDocument {
  userId: string;
  year: number;
  month: number;
  
  // Stats
  filesProcessed: number;
  textExtracted: number;
  filesRenamed: number;
  apiCallsMade: number;
  
  // Daily breakdown
  dailyStats: {
    [day: string]: {
      filesProcessed: number;
      textExtracted: number;
      filesRenamed: number;
    };
  };
  
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

/**
 * Database helper functions
 */
export class DatabaseService {
  /**
   * Create a new user document
   */
  static async createUser(userData: Partial<UserDocument>): Promise<void> {
    const now = FieldValue.serverTimestamp() as any;
    const userDoc: any = {
      role: 'free',
      filesProcessedThisMonth: 0,
      monthlyLimit: 5, // Free tier limit
      totalFilesProcessed: 0,
      subscriptionStatus: 'inactive',
      settings: {
        autoRename: true,
        preserveOriginalNames: false,
        useAIForAllFiles: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
      },
      createdAt: now,
      updatedAt: now,
      ...userData,
    };

    await db.collection(COLLECTIONS.USERS).doc(userData.uid!).set(userDoc);
  }

  /**
   * Get user by UID
   */
  static async getUser(uid: string): Promise<UserDocument | null> {
    const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    return doc.exists ? (doc.data() as UserDocument) : null;
  }

  /**
   * Update user document
   */
  static async updateUser(uid: string, updates: Partial<UserDocument>): Promise<void> {
    await db.collection(COLLECTIONS.USERS).doc(uid).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Check if user can process more files this month
   */
  static async canProcessFiles(uid: string, fileCount: number): Promise<{ canProcess: boolean; remainingFiles: number }> {
    const user = await this.getUser(uid);
    if (!user) {
      throw new Error('User not found');
    }

    const remainingFiles = user.monthlyLimit - user.filesProcessedThisMonth;
    const canProcess = remainingFiles >= fileCount || user.role === 'premium';

    return { canProcess, remainingFiles };
  }

  /**
   * Increment user's monthly file count
   */
  static async incrementFileCount(uid: string, count: number): Promise<void> {
    await db.collection(COLLECTIONS.USERS).doc(uid).update({
      filesProcessedThisMonth: FieldValue.increment(count),
      totalFilesProcessed: FieldValue.increment(count),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Create a new file document
   */
  static async createFile(fileData: Partial<FileDocument>): Promise<string> {
    const now = FieldValue.serverTimestamp() as any;
    const fileDoc: any = {
      isProcessed: false,
      isRenamed: false,
      processingStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      ...fileData,
    };

    const docRef = await db.collection(COLLECTIONS.FILES).add(fileDoc);
    return docRef.id;
  }

  /**
   * Update file document
   */
  static async updateFile(fileId: string, updates: Partial<FileDocument>): Promise<void> {
    await db.collection(COLLECTIONS.FILES).doc(fileId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Get user's files
   */
  static async getUserFiles(uid: string, limit: number = 50): Promise<FileDocument[]> {
    const snapshot = await db
      .collection(COLLECTIONS.FILES)
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FileDocument));
  }

  /**
   * Create processing session
   */
  static async createProcessingSession(sessionData: Partial<ProcessingSessionDocument>): Promise<string> {
    const now = FieldValue.serverTimestamp() as any;
    const sessionDoc: any = {
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

    const docRef = await db.collection(COLLECTIONS.PROCESSING_SESSIONS).add(sessionDoc);
    return docRef.id;
  }

  /**
   * Update processing session
   */
  static async updateProcessingSession(sessionId: string, updates: Partial<ProcessingSessionDocument>): Promise<void> {
    await db.collection(COLLECTIONS.PROCESSING_SESSIONS).doc(sessionId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Update or create usage stats for current month
   */
  static async updateUsageStats(uid: string, stats: Partial<UsageStatsDocument>): Promise<void> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate().toString().padStart(2, '0');

    const statsId = `${uid}_${year}_${month}`;
    const statsRef = db.collection(COLLECTIONS.USAGE_STATS).doc(statsId);

    const currentStats = await statsRef.get();
    
    if (currentStats.exists) {
      const data = currentStats.data() as UsageStatsDocument;
      await statsRef.update({
        filesProcessed: FieldValue.increment(stats.filesProcessed || 0),
        textExtracted: FieldValue.increment(stats.textExtracted || 0),
        filesRenamed: FieldValue.increment(stats.filesRenamed || 0),
        apiCallsMade: FieldValue.increment(stats.apiCallsMade || 0),
        [`dailyStats.${day}.filesProcessed`]: FieldValue.increment(stats.filesProcessed || 0),
        [`dailyStats.${day}.textExtracted`]: FieldValue.increment(stats.textExtracted || 0),
        [`dailyStats.${day}.filesRenamed`]: FieldValue.increment(stats.filesRenamed || 0),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      const newStats: any = {
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
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await statsRef.set(newStats);
    }
  }
}

export default DatabaseService;