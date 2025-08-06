export interface UserDocument {
    uid: string;
    phoneNumber: string;
    displayName?: string;
    email?: string;
    role: 'free' | 'premium' | 'admin';
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    lastLoginAt?: FirebaseFirestore.Timestamp;
    filesProcessedThisMonth: number;
    monthlyLimit: number;
    totalFilesProcessed: number;
    subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'trial';
    subscriptionId?: string;
    subscriptionExpiresAt?: FirebaseFirestore.Timestamp;
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
    extractedText?: string;
    suggestedName?: string;
    isProcessed: boolean;
    isRenamed: boolean;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
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
    totalFiles: number;
    processedFiles: number;
    renamedFiles: number;
    failedFiles: number;
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    completedAt?: FirebaseFirestore.Timestamp;
    errorMessage?: string;
    failedFileIds?: string[];
}
export interface UsageStatsDocument {
    userId: string;
    year: number;
    month: number;
    filesProcessed: number;
    textExtracted: number;
    filesRenamed: number;
    apiCallsMade: number;
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
export declare class DatabaseService {
    static createUser(userData: Partial<UserDocument>): Promise<void>;
    static getUser(uid: string): Promise<UserDocument | null>;
    static updateUser(uid: string, updates: Partial<UserDocument>): Promise<void>;
    static canProcessFiles(uid: string, fileCount: number): Promise<{
        canProcess: boolean;
        remainingFiles: number;
    }>;
    static incrementFileCount(uid: string, count: number): Promise<void>;
    static createFile(fileData: Partial<FileDocument>): Promise<string>;
    static updateFile(fileId: string, updates: Partial<FileDocument>): Promise<void>;
    static getUserFiles(uid: string, limit?: number): Promise<FileDocument[]>;
    static createProcessingSession(sessionData: Partial<ProcessingSessionDocument>): Promise<string>;
    static updateProcessingSession(sessionId: string, updates: Partial<ProcessingSessionDocument>): Promise<void>;
    static updateUsageStats(uid: string, stats: Partial<UsageStatsDocument>): Promise<void>;
}
export default DatabaseService;
//# sourceMappingURL=database.d.ts.map