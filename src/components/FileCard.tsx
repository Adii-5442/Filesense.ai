import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors, Typography, BorderRadius, Shadows, Spacing } from '../constants/theme';
import { FileItem } from '../types';

interface FileCardProps {
  file: FileItem;
  onPress?: () => void;
  showProgress?: boolean;
  showSuggestion?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onPress,
  showProgress = false,
  showSuggestion = false,
}) => {
  const getFileIcon = () => {
    switch (file.type) {
      case 'image':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'document':
        return '📝';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    if (file.isRenamed) return Colors.success;
    if (file.isProcessing) return Colors.info;
    return Colors.textSecondary;
  };

  const getStatusText = () => {
    if (file.isRenamed) return 'Renamed';
    if (file.isProcessing) return 'Processing...';
    return 'Ready';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{getFileIcon()}</Text>
        </View>
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={styles.fileDetails}>
            {formatFileSize(file.size)} • {file.type.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {showProgress && file.isProcessing && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${file.processingProgress || 0}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(file.processingProgress || 0)}%
          </Text>
        </View>
      )}

      {showSuggestion && file.suggestedName && (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionLabel}>Suggested name:</Text>
          <Text style={styles.suggestionText} numberOfLines={2}>
            {file.suggestedName}
          </Text>
        </View>
      )}

      {file.extractedText && (
        <View style={styles.extractedTextContainer}>
          <Text style={styles.extractedTextLabel}>Extracted text:</Text>
          <Text style={styles.extractedText} numberOfLines={3}>
            {file.extractedText}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    ...Shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  fileDetails: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    minWidth: 35,
    textAlign: 'right',
  },
  suggestionContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  suggestionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  suggestionText: {
    ...Typography.body2,
    color: Colors.text,
    fontWeight: '500',
  },
  extractedTextContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
  },
  extractedTextLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  extractedText: {
    ...Typography.body2,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});