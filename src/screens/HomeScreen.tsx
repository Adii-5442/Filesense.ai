import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Header, ActionButton } from '../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { APP_CONFIG } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface HomeScreenProps {
  navigation: any; // TODO: Type this properly with navigation types
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated, isGuest, signOut } = useAuth();

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Renaming',
      description: 'Smart filename suggestions based on content analysis',
    },
    {
      icon: '📱',
      title: 'On-Device OCR',
      description: 'Extract text from images without cloud dependency',
    },
    {
      icon: '📄',
      title: 'PDF Support',
      description: 'Process and organize PDF documents intelligently',
    },
    {
      icon: '⚡',
      title: 'Batch Processing',
      description: 'Organize multiple files simultaneously',
    },
  ];
      description: 'Smart filename suggestions based on content analysis',
    },
    {
      icon: '📱',
      title: 'On-Device OCR',
      description: 'Extract text from images without cloud dependency',
    },
    {
      icon: '📄',
      title: 'PDF Support',
      description: 'Process and organize PDF documents intelligently',
    },
    {
      icon: '⚡',
      title: 'Batch Processing',
      description: 'Organize multiple files simultaneously',
    },
  ];

  const handleStartProcessing = () => {
    if (isGuest) {
      Alert.alert(
        'Limited Access',
        'As a guest, you can process up to 5 files. Sign up for unlimited processing.',
        [
          { text: 'Continue as Guest', onPress: () => navigation.navigate('FileSelector') },
          { text: 'Sign Up', onPress: () => navigation.navigate('Auth') },
        ]
      );
    } else {
      navigation.navigate('FileSelector');
    }
  };

  const handleViewResults = () => {
    navigation.navigate('Results', { files: [] });
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleSignIn = () => {
    navigation.navigate('Auth');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  const getRemainingFiles = () => {
    if (isGuest) return '5';
    if (!user) return '0';
    return user.role === 'premium' ? '∞' : (user.monthlyLimit - user.filesProcessedThisMonth).toString();
  };

  const getUsagePercentage = () => {
    if (isGuest) return 0;
    if (!user || user.role === 'premium') return 0;
    return (user.filesProcessedThisMonth / user.monthlyLimit) * 100;
  };

  const getAccountType = () => {
    if (isGuest) return 'Guest';
    if (!user) return 'Unknown';
    return user.role === 'premium' ? 'Premium' : 'Free';
  };

  const getFilesProcessed = () => {
    if (isGuest) return 0;
    return user?.filesProcessedThisMonth || 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={APP_CONFIG.name}
        subtitle={APP_CONFIG.description}
        rightComponent={
          <TouchableOpacity onPress={isAuthenticated ? handleSettings : handleSignIn}>
            <Text style={styles.settingsIcon}>{isAuthenticated ? '⚙️' : '👤'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🧠</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome to FileSense.AI</Text>
          <Text style={styles.welcomeDescription}>
            Transform your file organization with the power of AI. 
            Extract text, analyze content, and get intelligent filename suggestions.
          </Text>
        </View>

        {/* Usage Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>
              {getAccountType()} {isGuest ? 'User' : 'Plan'}
            </Text>
            <Text style={styles.statsSubtitle}>
              Files processed this month: {getFilesProcessed()}
            </Text>
          </View>
          
          {!isAuthenticated && (
            <View style={styles.guestNotice}>
              <Text style={styles.guestNoticeText}>
                🎯 Sign up for unlimited processing and cloud storage!
              </Text>
              <TouchableOpacity style={styles.signUpButton} onPress={handleSignIn}>
                <Text style={styles.signUpText}>Sign Up Now</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {(isGuest || (user && user.role !== 'premium')) && (
            <>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getUsagePercentage()}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{getRemainingFiles()} left</Text>
              </View>
              
              {user && user.filesProcessedThisMonth >= user.monthlyLimit * 0.8 && (
                <TouchableOpacity style={styles.upgradeButton}>
                  <Text style={styles.upgradeText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {isAuthenticated && (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <ActionButton
            title="Start Processing Files"
            onPress={handleStartProcessing}
            style={styles.primaryAction}
            icon={<Text style={styles.actionIcon}>🚀</Text>}
          />
          
          <ActionButton
            title="View Recent Results"
            onPress={handleViewResults}
            variant="outline"
            style={styles.secondaryAction}
            icon={<Text style={styles.actionIcon}>📋</Text>}
          />
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>{feature.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Pro Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipText}>
                For best results, ensure your images have clear, readable text and good lighting.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  settingsIcon: {
    fontSize: 24,
  },
  
  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  logoIcon: {
    fontSize: 40,
  },
  welcomeTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  welcomeDescription: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Stats Card
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  statsHeader: {
    marginBottom: Spacing.md,
  },
  statsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  statsSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  upgradeText: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '600',
  },
  guestNotice: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  guestNoticeText: {
    ...Typography.body2,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
  },
  signUpText: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
  },
  signOutText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
  },

  // Actions Section
  actionsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  primaryAction: {
    marginBottom: Spacing.md,
  },
  secondaryAction: {
    marginBottom: Spacing.md,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },

  // Features Section
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  featureIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Tips Section
  tipsSection: {
    marginBottom: Spacing.xl,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.accent + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipText: {
    ...Typography.body2,
    color: Colors.text,
    lineHeight: 20,
  },
});
});