import { useState, useCallback } from 'react';
import { FileItem, ProcessingStatus } from '../types';
import { fileService } from '../services/fileService';
import { PROCESSING_STAGES } from '../constants';

/**
 * Custom hook for file processing operations
 * 
 * This hook provides a clean interface for screens to interact with file processing
 * without directly dealing with the service layer complexity.
 */

export interface UseFileProcessingReturn {
  // State
  files: FileItem[];
  processingStatus: ProcessingStatus;
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  processFiles: (files: FileItem[]) => Promise<void>;
  cancelProcessing: () => void;
  resetProcessing: () => void;
  setFiles: (files: FileItem[]) => void;
}

export const useFileProcessing = (): UseFileProcessingReturn => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    message: 'Ready to process files',
    progress: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldCancel, setShouldCancel] = useState(false);

  const updateStatus = useCallback((status: Partial<ProcessingStatus>) => {
    setProcessingStatus(prev => ({ ...prev, ...status }));
  }, []);

  const updateFileProgress = useCallback((fileId: string, progress: Partial<FileItem>) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId ? { ...file, ...progress } : file
      )
    );
  }, []);

  const processFiles = useCallback(async (filesToProcess: FileItem[]) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);
      setShouldCancel(false);
      setFiles(filesToProcess);

      // Stage 1: Text Extraction
      updateStatus({
        stage: 'extracting',
        message: 'Extracting text from files...',
        progress: 0,
      });

      for (let i = 0; i < filesToProcess.length; i++) {
        if (shouldCancel) break;

        const file = filesToProcess[i];
        updateStatus({
          stage: 'extracting',
          message: `Extracting text from ${file.name}...`,
          progress: (i / filesToProcess.length) * 33,
          currentFile: file.name,
        });

        updateFileProgress(file.id, { isProcessing: true, processingProgress: 0 });

        try {
          let extractedText = '';
          
          if (file.type === 'image') {
            extractedText = await fileService.extractTextFromImage(file);
          } else if (file.type === 'pdf') {
            extractedText = await fileService.extractTextFromPDF(file);
          }

          updateFileProgress(file.id, {
            extractedText,
            isProcessing: false,
            processingProgress: 100,
          });

        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          updateFileProgress(file.id, {
            isProcessing: false,
            processingProgress: 0,
          });
        }
      }

      if (shouldCancel) {
        resetProcessing();
        return;
      }

      // Stage 2: AI Analysis
      updateStatus({
        stage: 'analyzing',
        message: 'AI is analyzing content...',
        progress: 33,
      });

      for (let i = 0; i < filesToProcess.length; i++) {
        if (shouldCancel) break;

        const file = filesToProcess[i];
        const currentFile = files.find(f => f.id === file.id);
        
        if (!currentFile?.extractedText) continue;

        updateStatus({
          stage: 'analyzing',
          message: `Analyzing ${file.name}...`,
          progress: 33 + (i / filesToProcess.length) * 33,
          currentFile: file.name,
        });

        updateFileProgress(file.id, { isProcessing: true, processingProgress: 0 });

        try {
          const suggestedName = await fileService.generateFilename(
            currentFile.extractedText,
            file.originalName
          );

          updateFileProgress(file.id, {
            suggestedName,
            isProcessing: false,
            processingProgress: 100,
          });

        } catch (fileError) {
          console.error(`Error generating filename for ${file.name}:`, fileError);
          updateFileProgress(file.id, {
            isProcessing: false,
            processingProgress: 0,
          });
        }
      }

      if (shouldCancel) {
        resetProcessing();
        return;
      }

      // Stage 3: File Renaming
      updateStatus({
        stage: 'renaming',
        message: 'Applying new filenames...',
        progress: 66,
      });

      const renamedFiles = await fileService.batchRenameFiles(files);
      setFiles(renamedFiles);

      // Complete
      updateStatus({
        stage: 'complete',
        message: 'All files processed successfully!',
        progress: 100,
      });

    } catch (processingError) {
      console.error('Processing error:', processingError);
      setError(processingError instanceof Error ? processingError.message : 'Unknown error occurred');
      updateStatus({
        stage: 'error',
        message: 'Something went wrong during processing',
        progress: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, shouldCancel, files, updateStatus, updateFileProgress]);

  const cancelProcessing = useCallback(() => {
    setShouldCancel(true);
    setIsProcessing(false);
    updateStatus({
      stage: 'idle',
      message: 'Processing cancelled',
      progress: 0,
    });
  }, [updateStatus]);

  const resetProcessing = useCallback(() => {
    setFiles([]);
    setIsProcessing(false);
    setError(null);
    setShouldCancel(false);
    updateStatus({
      stage: 'idle',
      message: 'Ready to process files',
      progress: 0,
    });
  }, [updateStatus]);

  return {
    files,
    processingStatus,
    isProcessing,
    error,
    processFiles,
    cancelProcessing,
    resetProcessing,
    setFiles,
  };
};