import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { APP_CONFIG } from '../constants';

/**
 * Loading Screen Component
 * Shows while app is initializing authentication
 */

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🧠</Text>
        </View>
        <Text style={styles.appName}>{APP_CONFIG.name}</Text>
        <Text style={styles.tagline}>{APP_CONFIG.description}</Text>
        
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
          style={styles.loader}
        />
        
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: Colors.primaryLight,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  loader: {
    marginBottom: Spacing.lg,
  },
  loadingText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});