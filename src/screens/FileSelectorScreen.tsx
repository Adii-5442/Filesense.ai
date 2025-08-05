import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Header, ActionButton, FileCard } from '../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { FileItem } from '../types';
import { APP_CONFIG } from '../constants';

interface FileSelectorScreenProps {
  navigation: any;
}

export const FileSelectorScreen: React.FC<FileSelectorScreenProps> = ({ navigation }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [availableFiles, setAvailableFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - this will be replaced with actual file system access
  useEffect(() => {
    loadAvailableFiles();
  }, []);

  const loadAvailableFiles = async () => {
    setIsLoading(true);
    // Mock loading files - replace with actual file system implementation
    const mockFiles: FileItem[] = [
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
      {
        id: '4',
        name: 'Screenshot_20231202_095432.png',
        originalName: 'Screenshot_20231202_095432.png',
        uri: '/storage/emulated/0/Pictures/Screenshots/Screenshot_20231202_095432.png',
        type: 'image',
        size: 892000,
        dateModified: new Date('2023-12-02'),
      },
    ];
    
    setAvailableFiles(mockFiles);
    setIsLoading(false);
  };

  const handleFileSelection = (file: FileItem) => {
    const isSelected = selectedFiles.some(f => f.id === file.id);
    
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === availableFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...availableFiles]);
    }
  };

  const handleProcessFiles = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please select at least one file to process.');
      return;
    }

    // Navigate to processing screen with selected files
    navigation.navigate('Processing', { files: selectedFiles });
  };

  const handlePickFromGallery = () => {
    // TODO: Implement gallery picker
    Alert.alert('Coming Soon', 'Gallery picker will be implemented here.');
  };

  const handlePickFromDocuments = () => {
    // TODO: Implement document picker
    Alert.alert('Coming Soon', 'Document picker will be implemented here.');
  };

  const handleScanDocument = () => {
    // TODO: Implement camera scanner
    Alert.alert('Coming Soon', 'Camera scanner will be implemented here.');
  };

  const renderFileItem = ({ item }: { item: FileItem }) => {
    const isSelected = selectedFiles.some(f => f.id === item.id);
    
    return (
      <TouchableOpacity
        onPress={() => handleFileSelection(item)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.fileItemContainer,
          isSelected && styles.selectedFileItem
        ]}>
          <FileCard file={item} />
          {isSelected && (
            <View style={styles.selectionIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getSelectionSummary = () => {
    const total = selectedFiles.length;
    const images = selectedFiles.filter(f => f.type === 'image').length;
    const pdfs = selectedFiles.filter(f => f.type === 'pdf').length;
    const docs = selectedFiles.filter(f => f.type === 'document').length;

    let summary = `${total} file${total !== 1 ? 's' : ''} selected`;
    if (images > 0) summary += ` • ${images} image${images !== 1 ? 's' : ''}`;
    if (pdfs > 0) summary += ` • ${pdfs} PDF${pdfs !== 1 ? 's' : ''}`;
    if (docs > 0) summary += ` • ${docs} document${docs !== 1 ? 's' : ''}`;

    return summary;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Select Files"
        subtitle="Choose files to organize with AI"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickAction} onPress={handlePickFromGallery}>
          <Text style={styles.quickActionIcon}>🖼️</Text>
          <Text style={styles.quickActionText}>Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction} onPress={handlePickFromDocuments}>
          <Text style={styles.quickActionIcon}>📁</Text>
          <Text style={styles.quickActionText}>Documents</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction} onPress={handleScanDocument}>
          <Text style={styles.quickActionIcon}>📷</Text>
          <Text style={styles.quickActionText}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* File List */}
      <View style={styles.fileListContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent Files</Text>
          <TouchableOpacity onPress={handleSelectAll}>
            <Text style={styles.selectAllText}>
              {selectedFiles.length === availableFiles.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={availableFiles}
          renderItem={renderFileItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.fileList}
          refreshing={isLoading}
          onRefresh={loadAvailableFiles}
        />
      </View>

      {/* Bottom Action Bar */}
      {selectedFiles.length > 0 && (
        <View style={styles.bottomActionBar}>
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionText}>{getSelectionSummary()}</Text>
          </View>
          <ActionButton
            title="Process Files"
            onPress={handleProcessFiles}
            style={styles.processButton}
            icon={<Text style={styles.processIcon}>🚀</Text>}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    minWidth: 80,
    ...Shadows.small,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // File List
  fileListContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  listTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  selectAllText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  fileList: {
    paddingBottom: Spacing.xl,
  },
  fileItemContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  selectedFileItem: {
    transform: [{ scale: 0.98 }],
  },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  checkmark: {
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Bottom Action Bar
  bottomActionBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.large,
  },
  selectionSummary: {
    marginBottom: Spacing.md,
  },
  selectionText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  processButton: {
    marginHorizontal: 0,
  },
  processIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
});