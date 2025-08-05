import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Header, ActionButton, FileCard, ProcessingIndicator } from '../components';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { FileItem, ProcessingStatus } from '../types';
import { PROCESSING_STAGES } from '../constants';

interface ProcessingScreenProps {
  navigation: any;
  route: {
    params: {
      files: FileItem[];
    };
  };
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ navigation, route }) => {
  const { files: initialFiles } = route.params;
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    message: 'Ready to start processing',
    progress: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  useEffect(() => {
    // Auto-start processing when screen loads
    startProcessing();
  }, []);

  const startProcessing = async () => {
    setIsProcessing(true);
    
    try {
      // Stage 1: Text Extraction
      await extractTextFromFiles();
      
      // Stage 2: AI Analysis
      await analyzeFilesWithAI();
      
      // Stage 3: File Renaming
      await applyNewFilenames();
      
      // Complete
      setProcessingStatus({
        stage: 'complete',
        message: 'All files processed successfully!',
        progress: 100,
      });
      
      // Navigate to results after a short delay
      setTimeout(() => {
        navigation.replace('Results', { files });
      }, 2000);
      
    } catch (error) {
      setProcessingStatus({
        stage: 'error',
        message: 'Something went wrong during processing',
        progress: 0,
      });
      Alert.alert(
        'Processing Error',
        'An error occurred while processing your files. Please try again.',
        [
          { text: 'Retry', onPress: startProcessing },
          { text: 'Cancel', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  const extractTextFromFiles = async () => {
    setProcessingStatus({
      stage: 'extracting',
      message: 'Extracting text from files...',
      progress: 0,
    });

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      setCurrentFileIndex(i);
      
      // Update current file being processed
      setProcessingStatus({
        stage: 'extracting',
        message: `Extracting text from ${file.name}...`,
        progress: (i / updatedFiles.length) * 33,
        currentFile: file.name,
      });

      // Mark file as processing
      updatedFiles[i] = {
        ...file,
        isProcessing: true,
        processingProgress: 0,
      };
      setFiles([...updatedFiles]);

      // Simulate text extraction (replace with actual OCR/PDF processing)
      await simulateAsyncProcess(2000);
      
      // Mock extracted text based on file type
      const extractedText = getMockExtractedText(file);
      
      updatedFiles[i] = {
        ...file,
        extractedText,
        isProcessing: false,
        processingProgress: 100,
      };
      setFiles([...updatedFiles]);
    }
  };

  const analyzeFilesWithAI = async () => {
    setProcessingStatus({
      stage: 'analyzing',
      message: 'AI is analyzing content...',
      progress: 33,
    });

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      
      setProcessingStatus({
        stage: 'analyzing',
        message: `Analyzing ${file.name}...`,
        progress: 33 + (i / updatedFiles.length) * 33,
        currentFile: file.name,
      });

      // Mark file as processing
      updatedFiles[i] = {
        ...file,
        isProcessing: true,
        processingProgress: 0,
      };
      setFiles([...updatedFiles]);

      // Simulate AI analysis (replace with actual OpenAI API call)
      await simulateAsyncProcess(3000);
      
      // Generate mock suggested filename
      const suggestedName = generateMockFilename(file);
      
      updatedFiles[i] = {
        ...file,
        suggestedName,
        isProcessing: false,
        processingProgress: 100,
      };
      setFiles([...updatedFiles]);
    }
  };

  const applyNewFilenames = async () => {
    setProcessingStatus({
      stage: 'renaming',
      message: 'Applying new filenames...',
      progress: 66,
    });

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];
      
      setProcessingStatus({
        stage: 'renaming',
        message: `Renaming ${file.name}...`,
        progress: 66 + (i / updatedFiles.length) * 34,
        currentFile: file.name,
      });

      // Mark file as processing
      updatedFiles[i] = {
        ...file,
        isProcessing: true,
        processingProgress: 0,
      };
      setFiles([...updatedFiles]);

      // Simulate file renaming (replace with actual file system operations)
      await simulateAsyncProcess(1000);
      
      // Apply the suggested name
      const newName = file.suggestedName || file.name;
      const fileExtension = file.name.split('.').pop();
      const finalName = `${newName}.${fileExtension}`;
      
      updatedFiles[i] = {
        ...file,
        name: finalName,
        isProcessing: false,
        isRenamed: true,
        processingProgress: 100,
      };
      setFiles([...updatedFiles]);
    }
  };

  const simulateAsyncProcess = (duration: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, duration));
  };

  const getMockExtractedText = (file: FileItem): string => {
    // Mock extracted text based on file type
    switch (file.type) {
      case 'image':
        return 'Invoice from ACME Corporation\nAmount: $142.50\nDue Date: August 30, 2023\nAccount Number: 12345';
      case 'pdf':
        return 'Monthly Report - Q3 2023\nSales Performance Summary\nTotal Revenue: $45,000\nGrowth: +15%';
      default:
        return 'Document content extracted successfully\nDate: December 2023\nType: Business Document';
    }
  };

  const generateMockFilename = (file: FileItem): string => {
    // Mock AI-generated filename based on extracted text
    if (file.extractedText?.includes('Invoice')) {
      return 'Invoice_ACME_Corp_Aug_2023';
    } else if (file.extractedText?.includes('Report')) {
      return 'Monthly_Report_Q3_2023';
    } else if (file.extractedText?.includes('Receipt')) {
      return 'Receipt_Store_Dec_2023';
    } else {
      return 'Document_Dec_2023';
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Processing',
      'Are you sure you want to cancel? Any progress will be lost.',
      [
        { text: 'Continue Processing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const renderFileItem = ({ item }: { item: FileItem }) => (
    <FileCard
      file={item}
      showProgress={item.isProcessing}
      showSuggestion={!!item.suggestedName}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Processing Files"
        subtitle={`${files.length} files selected`}
        showBackButton={!isProcessing}
        onBackPress={handleCancel}
      />

      <View style={styles.content}>
        {/* Processing Status */}
        <ProcessingIndicator status={processingStatus} />

        {/* File List */}
        <View style={styles.fileListContainer}>
          <Text style={styles.fileListTitle}>Files</Text>
          <FlatList
            data={files}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fileList}
          />
        </View>

        {/* Action Buttons */}
        {processingStatus.stage === 'error' && (
          <View style={styles.actionContainer}>
            <ActionButton
              title="Retry Processing"
              onPress={startProcessing}
              style={styles.retryButton}
              icon={<Text style={styles.actionIcon}>🔄</Text>}
            />
            <ActionButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        )}

        {processingStatus.stage === 'complete' && (
          <View style={styles.actionContainer}>
            <ActionButton
              title="View Results"
              onPress={() => navigation.replace('Results', { files })}
              style={styles.viewResultsButton}
              icon={<Text style={styles.actionIcon}>📋</Text>}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  fileListContainer: {
    flex: 1,
    marginTop: Spacing.md,
  },
  fileListTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  fileList: {
    paddingBottom: Spacing.xl,
  },
  actionContainer: {
    paddingVertical: Spacing.md,
  },
  retryButton: {
    marginBottom: Spacing.md,
  },
  cancelButton: {
    marginBottom: Spacing.md,
  },
  viewResultsButton: {
    marginBottom: Spacing.md,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
});