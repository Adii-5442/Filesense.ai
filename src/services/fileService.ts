import { FileItem } from '../types';
import { API_ENDPOINTS } from '../constants';

/**
 * File Service - Handles file operations and backend integration
 * 
 * This service provides a clean interface for the backend team to implement:
 * - File system access and operations
 * - OCR and text extraction
 * - AI-powered filename generation
 * - File renaming and organization
 */

export interface FileServiceInterface {
  // File system operations
  pickFilesFromGallery(): Promise<FileItem[]>;
  pickFilesFromDocuments(): Promise<FileItem[]>;
  scanDocumentWithCamera(): Promise<FileItem>;
  getRecentFiles(): Promise<FileItem[]>;
  
  // Text extraction
  extractTextFromImage(file: FileItem): Promise<string>;
  extractTextFromPDF(file: FileItem): Promise<string>;
  
  // AI services
  generateFilename(extractedText: string, originalFilename: string): Promise<string>;
  
  // File operations
  renameFile(file: FileItem, newName: string): Promise<boolean>;
  batchRenameFiles(files: FileItem[]): Promise<FileItem[]>;
}

class FileService implements FileServiceInterface {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  // File System Operations
  async pickFilesFromGallery(): Promise<FileItem[]> {
    // TODO: Implement with react-native-image-picker or expo-image-picker
    throw new Error('pickFilesFromGallery not implemented - waiting for backend integration');
  }

  async pickFilesFromDocuments(): Promise<FileItem[]> {
    // TODO: Implement with react-native-document-picker
    throw new Error('pickFilesFromDocuments not implemented - waiting for backend integration');
  }

  async scanDocumentWithCamera(): Promise<FileItem> {
    // TODO: Implement with react-native-camera or expo-camera
    throw new Error('scanDocumentWithCamera not implemented - waiting for backend integration');
  }

  async getRecentFiles(): Promise<FileItem[]> {
    // TODO: Implement file system scanning
    // For now, return mock data
    return this.getMockFiles();
  }

  // Text Extraction
  async extractTextFromImage(file: FileItem): Promise<string> {
    try {
      // TODO: Implement with Google ML Kit Vision API
      // Example implementation:
      // import { vision } from '@react-native-google-ml-kit';
      // const text = await vision().textRecognizerProcessImage(file.uri);
      // return text.text;
      
      return this.getMockExtractedText(file);
    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromPDF(file: FileItem): Promise<string> {
    try {
      // TODO: Implement with react-native-pdf or similar
      // Example implementation:
      // import { readFile } from 'react-native-pdf';
      // const { text } = await readFile(file.uri);
      // return text;
      
      return this.getMockExtractedText(file);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // AI Services
  async generateFilename(extractedText: string, originalFilename: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const prompt = this.buildFilenamePrompt(extractedText, originalFilename);
      
      // TODO: Implement OpenAI API call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || 'Untitled_Document';
      
    } catch (error) {
      console.error('Error generating filename:', error);
      // Fallback to mock implementation
      return this.getMockGeneratedFilename(extractedText);
    }
  }

  // File Operations
  async renameFile(file: FileItem, newName: string): Promise<boolean> {
    try {
      // TODO: Implement with expo-file-system or react-native-fs
      // Example implementation:
      // import * as FileSystem from 'expo-file-system';
      // const dir = file.uri.substring(0, file.uri.lastIndexOf('/'));
      // const ext = file.uri.split('.').pop();
      // const newUri = `${dir}/${newName}.${ext}`;
      // await FileSystem.moveAsync({ from: file.uri, to: newUri });
      
      return true; // Mock success
    } catch (error) {
      console.error('Error renaming file:', error);
      return false;
    }
  }

  async batchRenameFiles(files: FileItem[]): Promise<FileItem[]> {
    const results: FileItem[] = [];
    
    for (const file of files) {
      try {
        if (file.suggestedName) {
          const success = await this.renameFile(file, file.suggestedName);
          results.push({
            ...file,
            name: success ? `${file.suggestedName}.${file.name.split('.').pop()}` : file.name,
            isRenamed: success,
          });
        } else {
          results.push(file);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({ ...file, isRenamed: false });
      }
    }
    
    return results;
  }

  // Helper Methods
  private buildFilenamePrompt(extractedText: string, originalFilename: string): string {
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
Document content: "${extractedText.substring(0, 2000)}"

Suggested filename:`;
  }

  private getMockFiles(): FileItem[] {
    return [
      {
        id: '1',
        name: 'IMG_20231205_142356.jpg',
        originalName: 'IMG_20231205_142356.jpg',
        uri: '/storage/emulated/0/DCIM/Camera/IMG_20231205_142356.jpg',
        type: 'image',
        size: 2457600,
        dateModified: new Date('2023-12-05'),
      },
      {
        id: '2',
        name: 'document_scan.pdf',
        originalName: 'document_scan.pdf',
        uri: '/storage/emulated/0/Download/document_scan.pdf',
        type: 'pdf',
        size: 1024000,
        dateModified: new Date('2023-12-04'),
      },
      {
        id: '3',
        name: 'receipt_001.jpg',
        originalName: 'receipt_001.jpg',
        uri: '/storage/emulated/0/Pictures/receipt_001.jpg',
        type: 'image',
        size: 1536000,
        dateModified: new Date('2023-12-03'),
      },
    ];
  }

  private getMockExtractedText(file: FileItem): string {
    if (file.name.toLowerCase().includes('invoice')) {
      return 'Invoice from ACME Corporation\nAmount: $142.50\nDue Date: August 30, 2023\nAccount Number: 12345';
    } else if (file.name.toLowerCase().includes('receipt')) {
      return 'Receipt - Best Buy Electronics\nDate: December 5, 2023\nTotal: $89.99\nCard ending in 1234';
    } else if (file.type === 'pdf') {
      return 'Monthly Report - Q3 2023\nSales Performance Summary\nTotal Revenue: $45,000\nGrowth: +15%';
    }
    return 'Document content extracted successfully\nDate: December 2023\nType: Business Document';
  }

  private getMockGeneratedFilename(extractedText: string): string {
    if (extractedText.toLowerCase().includes('invoice')) {
      return 'Invoice_ACME_Corp_Aug_2023';
    } else if (extractedText.toLowerCase().includes('receipt')) {
      return 'Receipt_Best_Buy_Dec_2023';
    } else if (extractedText.toLowerCase().includes('report')) {
      return 'Monthly_Report_Q3_2023';
    }
    return 'Document_Dec_2023';
  }
}

// Export singleton instance
export const fileService = new FileService();

// Export factory function for backend team to inject API key
export const createFileService = (apiKey?: string): FileServiceInterface => {
  return new FileService(apiKey);
};