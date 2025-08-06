import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DatabaseService } from '../config/database';
import { OpenAI } from 'openai';
import Joi from 'joi';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

/**
 * File Processing Controller
 * Handles file upload, text extraction, and AI-powered renaming
 */

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schemas
const processFilesSchema = Joi.object({
  files: Joi.array().items(
    Joi.object({
      originalName: Joi.string().required(),
      filePath: Joi.string().required(),
      fileType: Joi.string().valid('image', 'pdf', 'document').required(),
      fileSize: Joi.number().required(),
      mimeType: Joi.string().required(),
    })
  ).min(1).max(20).required(),
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
    files: 20, // Max 20 files per request
  },
});

/**
 * Upload files for processing
 */
export const uploadFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
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

      const fileId = await DatabaseService.createFile(fileData);
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

  } catch (error) {
    console.error('Upload files error:', error);
    
    if (error instanceof multer.MulterError) {
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

/**
 * Process files (extract text and generate names)
 */
export const processFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const fileIds = req.body.fileIds as string[];
    
    if (!fileIds || fileIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No file IDs provided',
        code: 'NO_FILE_IDS'
      });
      return;
    }

    // Create processing session
    const sessionId = await DatabaseService.createProcessingSession({
      userId: req.user?.uid || 'guest',
      fileIds,
      totalFiles: fileIds.length,
    });

    // Start processing files asynchronously
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

  } catch (error) {
    console.error('Process files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start file processing',
      code: 'PROCESSING_FAILED'
    });
  }
};

/**
 * Get processing session status
 */
export const getProcessingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    
    // This would fetch from database in real implementation
    // For now, return mock status
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

  } catch (error) {
    console.error('Get processing status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get processing status',
      code: 'STATUS_FETCH_FAILED'
    });
  }
};

/**
 * Extract text from a single file
 */
export const extractText = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    
    // Get file from database
    // For now, return mock extracted text
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

  } catch (error) {
    console.error('Extract text error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract text',
      code: 'TEXT_EXTRACTION_FAILED'
    });
  }
};

/**
 * Generate filename using AI
 */
export const generateFilename = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const generateSchema = Joi.object({
      extractedText: Joi.string().required(),
      originalFilename: Joi.string().required(),
      fileType: Joi.string().valid('image', 'pdf', 'document').optional(),
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

    // Update usage stats if user is authenticated
    if (req.user) {
      await DatabaseService.updateUsageStats(req.user.uid, {
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

  } catch (error) {
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

/**
 * Get user's files
 */
export const getUserFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const files = await DatabaseService.getUserFiles(req.user.uid, limit);

    res.status(200).json({
      success: true,
      data: {
        files,
        totalCount: files.length,
      }
    });

  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user files',
      code: 'FETCH_FILES_FAILED'
    });
  }
};

// Helper functions

async function processFilesAsync(fileIds: string[], sessionId: string, userId?: string): Promise<void> {
  try {
    await DatabaseService.updateProcessingSession(sessionId, {
      status: 'processing',
      progress: 10,
    });

    for (let i = 0; i < fileIds.length; i++) {
      const fileId = fileIds[i];
      const progress = Math.round(((i + 1) / fileIds.length) * 100);

      // Update session progress
      await DatabaseService.updateProcessingSession(sessionId, {
        currentFileIndex: i,
        progress,
      });

      // Process individual file
      await processIndividualFile(fileId);

      // Small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mark session as completed
    await DatabaseService.updateProcessingSession(sessionId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date() as any,
    });

    // Update user's file count if authenticated
    if (userId) {
      await DatabaseService.incrementFileCount(userId, fileIds.length);
      await DatabaseService.updateUsageStats(userId, {
        filesProcessed: fileIds.length,
        textExtracted: fileIds.length,
      });
    }

  } catch (error) {
    console.error('Async processing error:', error);
    await DatabaseService.updateProcessingSession(sessionId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function processIndividualFile(fileId: string): Promise<void> {
  try {
    // Mark file as processing
    await DatabaseService.updateFile(fileId, {
      processingStatus: 'processing',
    });

    // Simulate text extraction (replace with actual OCR)
    const extractedText = "Sample extracted text from document";
    
    // Generate filename using AI
    const suggestedName = await generateFilenameAI(extractedText, "document.pdf");

    // Update file with results
    await DatabaseService.updateFile(fileId, {
      extractedText,
      suggestedName,
      processingStatus: 'completed',
      isProcessed: true,
      processedAt: new Date() as any,
    });

  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error);
    await DatabaseService.updateFile(fileId, {
      processingStatus: 'failed',
    });
    throw error;
  }
}

async function generateFilenameAI(extractedText: string, originalFilename: string): Promise<string> {
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
  } catch (error) {
    console.error('AI filename generation error:', error);
    return generateFallbackFilename(extractedText);
  }
}

function buildFilenamePrompt(extractedText: string, originalFilename: string, fileType?: string): string {
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

function generateFallbackFilename(extractedText: string): string {
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

function getFileType(mimeType: string): 'image' | 'pdf' | 'document' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else {
    return 'document';
  }
}