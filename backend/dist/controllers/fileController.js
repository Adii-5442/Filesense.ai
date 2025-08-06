"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFiles = exports.generateFilename = exports.extractText = exports.getProcessingStatus = exports.processFiles = exports.uploadFiles = exports.upload = void 0;
const database_1 = require("../config/database");
const openai_1 = require("openai");
const joi_1 = __importDefault(require("joi"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const processFilesSchema = joi_1.default.object({
    files: joi_1.default.array().items(joi_1.default.object({
        originalName: joi_1.default.string().required(),
        filePath: joi_1.default.string().required(),
        fileType: joi_1.default.string().valid('image', 'pdf', 'document').required(),
        fileSize: joi_1.default.number().required(),
        mimeType: joi_1.default.string().required(),
    })).min(1).max(20).required(),
});
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        try {
            await promises_1.default.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        }
        catch (error) {
            cb(error, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'),
        files: 20,
    },
});
const uploadFiles = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({
                success: false,
                error: 'No files uploaded',
                code: 'NO_FILES'
            });
            return;
        }
        const fileDocuments = [];
        for (const file of files) {
            const fileType = getFileType(file.mimetype);
            const fileData = {
                userId: req.user?.uid || 'guest',
                originalName: file.originalname,
                filePath: file.path,
                fileType,
                fileSize: file.size,
                mimeType: file.mimetype,
            };
            const fileId = await database_1.DatabaseService.createFile(fileData);
            fileDocuments.push({
                id: fileId,
                ...fileData,
            });
        }
        res.status(200).json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            data: {
                files: fileDocuments,
                totalFiles: files.length,
            }
        });
    }
    catch (error) {
        console.error('Upload files error:', error);
        if (error instanceof multer_1.default.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({
                    success: false,
                    error: 'File too large',
                    code: 'FILE_TOO_LARGE'
                });
                return;
            }
            if (error.code === 'LIMIT_FILE_COUNT') {
                res.status(400).json({
                    success: false,
                    error: 'Too many files',
                    code: 'TOO_MANY_FILES'
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            error: 'Failed to upload files',
            code: 'UPLOAD_FAILED'
        });
    }
};
exports.uploadFiles = uploadFiles;
const processFiles = async (req, res) => {
    try {
        const fileIds = req.body.fileIds;
        if (!fileIds || fileIds.length === 0) {
            res.status(400).json({
                success: false,
                error: 'No file IDs provided',
                code: 'NO_FILE_IDS'
            });
            return;
        }
        const sessionId = await database_1.DatabaseService.createProcessingSession({
            userId: req.user?.uid || 'guest',
            fileIds,
            totalFiles: fileIds.length,
        });
        processFilesAsync(fileIds, sessionId, req.user?.uid);
        res.status(200).json({
            success: true,
            message: 'File processing started',
            data: {
                sessionId,
                totalFiles: fileIds.length,
                status: 'processing'
            }
        });
    }
    catch (error) {
        console.error('Process files error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start file processing',
            code: 'PROCESSING_FAILED'
        });
    }
};
exports.processFiles = processFiles;
const getProcessingStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;
        res.status(200).json({
            success: true,
            data: {
                sessionId,
                status: 'processing',
                progress: 65,
                currentFileIndex: 2,
                totalFiles: 5,
                processedFiles: 2,
                renamedFiles: 1,
                failedFiles: 0,
            }
        });
    }
    catch (error) {
        console.error('Get processing status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get processing status',
            code: 'STATUS_FETCH_FAILED'
        });
    }
};
exports.getProcessingStatus = getProcessingStatus;
const extractText = async (req, res) => {
    try {
        const { fileId } = req.params;
        const mockText = "Sample extracted text from the document. This would contain the actual OCR results.";
        res.status(200).json({
            success: true,
            data: {
                fileId,
                extractedText: mockText,
                confidence: 0.95,
                language: 'en'
            }
        });
    }
    catch (error) {
        console.error('Extract text error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to extract text',
            code: 'TEXT_EXTRACTION_FAILED'
        });
    }
};
exports.extractText = extractText;
const generateFilename = async (req, res) => {
    try {
        const generateSchema = joi_1.default.object({
            extractedText: joi_1.default.string().required(),
            originalFilename: joi_1.default.string().required(),
            fileType: joi_1.default.string().valid('image', 'pdf', 'document').optional(),
        });
        const { error, value } = generateSchema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: error.details[0].message,
                code: 'VALIDATION_ERROR'
            });
            return;
        }
        const { extractedText, originalFilename, fileType } = value;
        if (!process.env.OPENAI_API_KEY) {
            res.status(500).json({
                success: false,
                error: 'OpenAI API key not configured',
                code: 'API_KEY_MISSING'
            });
            return;
        }
        const prompt = buildFilenamePrompt(extractedText, originalFilename, fileType);
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 50,
        });
        const suggestedName = completion.choices[0]?.message?.content?.trim() || 'Untitled_Document';
        if (req.user) {
            await database_1.DatabaseService.updateUsageStats(req.user.uid, {
                apiCallsMade: 1,
            });
        }
        res.status(200).json({
            success: true,
            data: {
                originalFilename,
                suggestedFilename: suggestedName,
                confidence: 0.9,
                extractedText: extractedText.substring(0, 200) + '...',
            }
        });
    }
    catch (error) {
        console.error('Generate filename error:', error);
        if (error instanceof Error && error.message.includes('rate limit')) {
            res.status(429).json({
                success: false,
                error: 'Rate limit exceeded for AI services',
                code: 'RATE_LIMIT_EXCEEDED'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Failed to generate filename',
            code: 'FILENAME_GENERATION_FAILED'
        });
    }
};
exports.generateFilename = generateFilename;
const getUserFiles = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
            return;
        }
        const limit = parseInt(req.query.limit) || 50;
        const files = await database_1.DatabaseService.getUserFiles(req.user.uid, limit);
        res.status(200).json({
            success: true,
            data: {
                files,
                totalCount: files.length,
            }
        });
    }
    catch (error) {
        console.error('Get user files error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user files',
            code: 'FETCH_FILES_FAILED'
        });
    }
};
exports.getUserFiles = getUserFiles;
async function processFilesAsync(fileIds, sessionId, userId) {
    try {
        await database_1.DatabaseService.updateProcessingSession(sessionId, {
            status: 'processing',
            progress: 10,
        });
        for (let i = 0; i < fileIds.length; i++) {
            const fileId = fileIds[i];
            const progress = Math.round(((i + 1) / fileIds.length) * 100);
            await database_1.DatabaseService.updateProcessingSession(sessionId, {
                currentFileIndex: i,
                progress,
            });
            await processIndividualFile(fileId);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await database_1.DatabaseService.updateProcessingSession(sessionId, {
            status: 'completed',
            progress: 100,
            completedAt: new Date(),
        });
        if (userId) {
            await database_1.DatabaseService.incrementFileCount(userId, fileIds.length);
            await database_1.DatabaseService.updateUsageStats(userId, {
                filesProcessed: fileIds.length,
                textExtracted: fileIds.length,
            });
        }
    }
    catch (error) {
        console.error('Async processing error:', error);
        await database_1.DatabaseService.updateProcessingSession(sessionId, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
async function processIndividualFile(fileId) {
    try {
        await database_1.DatabaseService.updateFile(fileId, {
            processingStatus: 'processing',
        });
        const extractedText = "Sample extracted text from document";
        const suggestedName = await generateFilenameAI(extractedText, "document.pdf");
        await database_1.DatabaseService.updateFile(fileId, {
            extractedText,
            suggestedName,
            processingStatus: 'completed',
            isProcessed: true,
            processedAt: new Date(),
        });
    }
    catch (error) {
        console.error(`Error processing file ${fileId}:`, error);
        await database_1.DatabaseService.updateFile(fileId, {
            processingStatus: 'failed',
        });
        throw error;
    }
}
async function generateFilenameAI(extractedText, originalFilename) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return generateFallbackFilename(extractedText);
        }
        const prompt = buildFilenamePrompt(extractedText, originalFilename);
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 50,
        });
        return completion.choices[0]?.message?.content?.trim() || generateFallbackFilename(extractedText);
    }
    catch (error) {
        console.error('AI filename generation error:', error);
        return generateFallbackFilename(extractedText);
    }
}
function buildFilenamePrompt(extractedText, originalFilename, fileType) {
    return `
Generate a concise, descriptive filename (3-5 words) based on this document content.

Rules:
- Use title case with underscores (e.g., "Invoice_ACME_Corp_Aug_2023")
- Include key entities like company names, dates, document types
- No special characters except underscores
- Maximum 50 characters
- Be specific and descriptive
- Don't include file extension

Original filename: ${originalFilename}
File type: ${fileType || 'unknown'}
Document content: "${extractedText.substring(0, 2000)}"

Suggested filename:`;
}
function generateFallbackFilename(extractedText) {
    const words = extractedText.toLowerCase().split(/\s+/);
    const keywords = ['invoice', 'receipt', 'contract', 'report', 'document', 'letter'];
    for (const keyword of keywords) {
        if (words.includes(keyword)) {
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}_${date}`;
        }
    }
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `Document_${date}`;
}
function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) {
        return 'image';
    }
    else if (mimeType === 'application/pdf') {
        return 'pdf';
    }
    else {
        return 'document';
    }
}
//# sourceMappingURL=fileController.js.map