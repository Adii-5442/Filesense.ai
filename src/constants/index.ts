export const APP_CONFIG = {
  name: 'FileSense.AI',
  version: '1.0.0',
  description: 'AI-powered file organization made simple',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  freeMonthlyLimit: 20,
};

export const API_ENDPOINTS = {
  // These will be implemented by backend team
  extractText: '/api/extract-text',
  generateFilename: '/api/generate-filename',
  processFiles: '/api/process-files',
  userSettings: '/api/user/settings',
  subscription: '/api/subscription',
};

export const PROCESSING_STAGES = {
  IDLE: 'idle',
  EXTRACTING: 'extracting',
  ANALYZING: 'analyzing',
  RENAMING: 'renaming',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

export const FILE_TYPES = {
  IMAGE: 'image',
  PDF: 'pdf',
  DOCUMENT: 'document',
} as const;

export const STORAGE_KEYS = {
  USER_SETTINGS: '@filesense_user_settings',
  PROCESSED_FILES: '@filesense_processed_files',
  API_KEY: '@filesense_api_key',
} as const;