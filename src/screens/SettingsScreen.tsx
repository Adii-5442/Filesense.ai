import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { Header, ActionButton } from '../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { AppSettings } from '../types';
import { APP_CONFIG } from '../constants';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<AppSettings>({
    autoRename: true,
    preserveOriginalNames: false,
    useAIForAllFiles: true,
    maxFileSize: APP_CONFIG.maxFileSize,
    apiKey: undefined,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Save settings to storage and backend
    Alert.alert('Settings Saved', 'Your preferences have been updated successfully.');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              autoRename: true,
              preserveOriginalNames: false,
              useAIForAllFiles: true,
              maxFileSize: APP_CONFIG.maxFileSize,
              apiKey: undefined,
            });
            setTempApiKey('');
          },
        },
      ]
    );
  };

  const handleUpgradeToPremium = () => {
    Alert.alert('Upgrade to Premium', 'Premium features will be available soon!');
  };

  const handleAbout = () => {
    Alert.alert(
      'About FileSense.AI',
      `Version: ${APP_CONFIG.version}\n\nFileSense.AI uses advanced AI to organize your files intelligently. Extract text from images and documents, then let AI suggest better filenames automatically.`
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Privacy policy will be displayed here.');
  };

  const handleTermsOfService = () => {
    Alert.alert('Terms of Service', 'Terms of service will be displayed here.');
  };

  const formatFileSize = (bytes: number): string => {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  const renderSettingRow = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingContent}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.textLight}
      />
    </View>
  );

  const renderInfoRow = (title: string, subtitle: string, onPress?: () => void, icon?: string) => (
    <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingContent}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {onPress && <Text style={styles.chevron}>→</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Settings"
        subtitle="Customize your experience"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Processing Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing Settings</Text>
          
          {renderSettingRow(
            'Auto Rename Files',
            'Automatically apply AI-suggested filenames',
            settings.autoRename,
            (value) => handleSettingChange('autoRename', value),
            '🤖'
          )}
          
          {renderSettingRow(
            'Preserve Original Names',
            'Keep original filenames as backup',
            settings.preserveOriginalNames,
            (value) => handleSettingChange('preserveOriginalNames', value),
            '📋'
          )}
          
          {renderSettingRow(
            'Use AI for All Files',
            'Process all supported file types with AI',
            settings.useAIForAllFiles,
            (value) => handleSettingChange('useAIForAllFiles', value),
            '🧠'
          )}
        </View>

        {/* File Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>File Settings</Text>
          
          {renderInfoRow(
            'Maximum File Size',
            `Current limit: ${formatFileSize(settings.maxFileSize)}`,
            undefined,
            '📏'
          )}
          
          {renderInfoRow(
            'Supported File Types',
            APP_CONFIG.supportedFileTypes.join(', '),
            undefined,
            '📄'
          )}
        </View>

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.apiKeySection}>
            <View style={styles.apiKeyHeader}>
              <Text style={styles.settingTitle}>OpenAI API Key</Text>
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                <Text style={styles.toggleText}>
                  {showApiKey ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.settingSubtitle}>
              Required for AI-powered filename generation
            </Text>
            {showApiKey && (
              <TextInput
                style={styles.apiKeyInput}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder="Enter your OpenAI API key"
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          </View>
        </View>

        {/* Account & Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Subscription</Text>
          
          <TouchableOpacity style={styles.premiumCard} onPress={handleUpgradeToPremium}>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumIcon}>⭐</Text>
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumSubtitle}>
                  Unlimited processing, cloud sync, and more
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          {renderInfoRow(
            'About FileSense.AI',
            `Version ${APP_CONFIG.version}`,
            handleAbout,
            'ℹ️'
          )}
          
          {renderInfoRow(
            'Privacy Policy',
            'How we protect your data',
            handlePrivacyPolicy,
            '🔒'
          )}
          
          {renderInfoRow(
            'Terms of Service',
            'Usage terms and conditions',
            handleTermsOfService,
            '📜'
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <ActionButton
            title="Save Settings"
            onPress={handleSaveSettings}
            style={styles.saveButton}
            icon={<Text style={styles.actionIcon}>💾</Text>}
          />
          
          <ActionButton
            title="Reset to Defaults"
            onPress={handleResetSettings}
            variant="outline"
            style={styles.resetButton}
            icon={<Text style={styles.actionIcon}>🔄</Text>}
          />
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

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  // Setting Rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  settingSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  chevron: {
    ...Typography.h3,
    color: Colors.textLight,
    marginLeft: Spacing.md,
  },

  // API Key Section
  apiKeySection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  toggleText: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
  apiKeyInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body2,
    color: Colors.text,
  },

  // Premium Card
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${Colors.accent}15`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  premiumSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Actions
  actionSection: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  saveButton: {
    marginBottom: Spacing.md,
  },
  resetButton: {
    marginBottom: Spacing.md,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
});