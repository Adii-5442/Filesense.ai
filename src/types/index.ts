export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  uri: string;
  type: 'image' | 'pdf' | 'document';
  size: number;
  dateModified: Date;
  extractedText?: string;
  suggestedName?: string;
  isProcessing?: boolean;
  isRenamed?: boolean;
  processingProgress?: number;
}

export interface ProcessingStatus {
  stage: 'idle' | 'extracting' | 'analyzing' | 'renaming' | 'complete' | 'error';
  message: string;
  progress: number;
  currentFile?: string;
}

export interface AppSettings {
  autoRename: boolean;
  preserveOriginalNames: boolean;
  useAIForAllFiles: boolean;
  maxFileSize: number;
  apiKey?: string;
}

export interface NavigationParams {
  Home: undefined;
  FileSelector: undefined;
  Processing: { files: FileItem[] };
  Results: { files: FileItem[] };
  Settings: undefined;
}

export type FileProcessingCallback = (files: FileItem[]) => Promise<void>;
export type SettingsUpdateCallback = (settings: Partial<AppSettings>) => void;