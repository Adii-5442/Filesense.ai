import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';
import { ProcessingStatus } from '../types';

interface ProcessingIndicatorProps {
  status: ProcessingStatus;
  showDetails?: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  status,
  showDetails = true,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status.stage === 'idle' || status.stage === 'complete') {
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true
      }).stop();
      return;
    }

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();

    return () => rotate.stop();
  }, [status.stage, rotateAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: status.progress / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [status.progress, progressAnim]);

  const getStatusColor = () => {
    switch (status.stage) {
      case 'extracting':
        return Colors.info;
      case 'analyzing':
        return Colors.accent;
      case 'renaming':
        return Colors.secondary;
      case 'complete':
        return Colors.success;
      case 'error':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (status.stage) {
      case 'extracting':
        return '🔍';
      case 'analyzing':
        return '🧠';
      case 'renaming':
        return '✏️';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStageText = () => {
    switch (status.stage) {
      case 'extracting':
        return 'Extracting text from files...';
      case 'analyzing':
        return 'AI is analyzing content...';
      case 'renaming':
        return 'Applying new filenames...';
      case 'complete':
        return 'All files processed successfully!';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Ready to process files';
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (status.stage === 'idle') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getStatusColor() }]}>
          {status.stage === 'extracting' || status.stage === 'analyzing' || status.stage === 'renaming' ? (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Text style={styles.iconText}>🔄</Text>
            </Animated.View>
          ) : (
            <Text style={styles.iconText}>{getStatusIcon()}</Text>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.stageText}>{getStageText()}</Text>
          {showDetails && status.message && (
            <Text style={styles.messageText}>{status.message}</Text>
          )}
        </View>
      </View>

      {status.progress > 0 && status.stage !== 'complete' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: getStatusColor(),
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(status.progress)}%</Text>
        </View>
      )}

      {status.currentFile && (
        <View style={styles.currentFileContainer}>
          <Text style={styles.currentFileLabel}>Processing:</Text>
          <Text style={styles.currentFileText} numberOfLines={1}>
            {status.currentFile}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  stageText: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  messageText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  progressContainer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  currentFileContainer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentFileLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    fontWeight: '500',
  },
  currentFileText: {
    ...Typography.caption,
    color: Colors.text,
    flex: 1,
    fontWeight: '500',
  },
});