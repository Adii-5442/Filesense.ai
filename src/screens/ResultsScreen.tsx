import React, { useState } from 'react';
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

interface ResultsScreenProps {
  navigation: any;
  route: {
    params: {
      files: FileItem[];
    };
  };
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { files: processedFiles } = route.params;
  const [files, setFiles] = useState<FileItem[]>(processedFiles);
  const [selectedViewMode, setSelectedViewMode] = useState<'all' | 'renamed' | 'unchanged'>('all');

  const getFilteredFiles = () => {
    switch (selectedViewMode) {
      case 'renamed':
        return files.filter(file => file.isRenamed);
      case 'unchanged':
        return files.filter(file => !file.isRenamed);
      default:
        return files;
    }
  };

  const getStats = () => {
    const total = files.length;
    const renamed = files.filter(f => f.isRenamed).length;
    const unchanged = total - renamed;
    
    return { total, renamed, unchanged };
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    Alert.alert('Share Results', 'Sharing functionality will be implemented here.');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    Alert.alert('Export Results', 'Export functionality will be implemented here.');
  };

  const handleProcessMore = () => {
    navigation.navigate('FileSelector');
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleUndo = (fileId: string) => {
    Alert.alert(
      'Undo Rename',
      'Do you want to revert this file to its original name?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: () => {
            const updatedFiles = files.map(file => {
              if (file.id === fileId) {
                return {
                  ...file,
                  name: file.originalName,
                  isRenamed: false,
                };
              }
              return file;
            });
            setFiles(updatedFiles);
          },
        },
      ]
    );
  };

  const renderFileItem = ({ item }: { item: FileItem }) => (
    <View style={styles.fileItemContainer}>
      <FileCard file={item} />
      {item.isRenamed && (
        <TouchableOpacity
          style={styles.undoButton}
          onPress={() => handleUndo(item.id)}
        >
          <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderViewModeButton = (mode: 'all' | 'renamed' | 'unchanged', label: string, count: number) => (
    <TouchableOpacity
      style={[
        styles.viewModeButton,
        selectedViewMode === mode && styles.activeViewModeButton,
      ]}
      onPress={() => setSelectedViewMode(mode)}
    >
      <Text
        style={[
          styles.viewModeText,
          selectedViewMode === mode && styles.activeViewModeText,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.viewModeCount,
          selectedViewMode === mode && styles.activeViewModeCount,
        ]}
      >
        {count}
      </Text>
    </TouchableOpacity>
  );

  const stats = getStats();
  const filteredFiles = getFilteredFiles();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Processing Complete"
        subtitle={`${stats.renamed} of ${stats.total} files renamed`}
        showBackButton
        onBackPress={() => navigation.navigate('Home')}
        rightComponent={
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Results Summary</Text>
            <Text style={styles.summaryIcon}>✨</Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Files</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>{stats.renamed}</Text>
              <Text style={styles.statLabel}>Renamed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.textSecondary }]}>{stats.unchanged}</Text>
              <Text style={styles.statLabel}>Unchanged</Text>
            </View>
          </View>
        </View>

        {/* View Mode Filter */}
        <View style={styles.viewModeContainer}>
          {renderViewModeButton('all', 'All Files', stats.total)}
          {renderViewModeButton('renamed', 'Renamed', stats.renamed)}
          {renderViewModeButton('unchanged', 'Unchanged', stats.unchanged)}
        </View>

        {/* File List */}
        <View style={styles.fileListContainer}>
          <FlatList
            data={filteredFiles}
            renderItem={renderFileItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fileList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📁</Text>
                <Text style={styles.emptyText}>No files in this category</Text>
              </View>
            }
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <ActionButton
            title="Process More Files"
            onPress={handleProcessMore}
            variant="outline"
            style={styles.secondaryAction}
            icon={<Text style={styles.actionIcon}>📁</Text>}
          />
          
          <ActionButton
            title="Done"
            onPress={handleGoHome}
            style={styles.primaryAction}
            icon={<Text style={styles.actionIcon}>✅</Text>}
          />
        </View>
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
  shareIcon: {
    fontSize: 24,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  summaryIcon: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // View Mode Filter
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  activeViewModeButton: {
    backgroundColor: Colors.primary,
  },
  viewModeText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  activeViewModeText: {
    color: Colors.textDark,
  },
  viewModeCount: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '600',
  },
  activeViewModeCount: {
    color: Colors.textDark,
  },

  // File List
  fileListContainer: {
    flex: 1,
  },
  fileList: {
    paddingBottom: Spacing.xl,
  },
  fileItemContainer: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  undoButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  undoText: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Actions
  actionContainer: {
    paddingVertical: Spacing.md,
  },
  primaryAction: {
    marginBottom: Spacing.sm,
  },
  secondaryAction: {
    marginBottom: Spacing.md,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
});