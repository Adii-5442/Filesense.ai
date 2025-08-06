import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Header, ActionButton } from '../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface ProfileSetupScreenProps {
  navigation: any;
  route: {
    params: {
      phoneNumber: string;
    };
  };
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { phoneNumber } = route.params;
  const { updateProfile } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteSetup = async () => {
    if (!displayName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const updates = {
        displayName: displayName.trim(),
        ...(email.trim() && { email: email.trim() }),
      };

      const result = await updateProfile(updates);
      
      if (result.success) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Setup Failed', result.error || 'Failed to setup profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Complete Your Profile"
        subtitle="Tell us a bit about yourself"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.checkIconContainer}>
            <Text style={styles.checkIcon}>✅</Text>
          </View>
          <Text style={styles.welcomeTitle}>Phone Verified!</Text>
          <Text style={styles.welcomeDescription}>
            Your phone number {phoneNumber} has been verified successfully.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={Colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.inputHint}>
              We'll use this for important account notifications
            </Text>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>What you get with your account:</Text>
          
          {[
            {
              icon: '∞',
              title: 'Unlimited Processing',
              description: 'No monthly limits on file processing',
            },
            {
              icon: '☁️',
              title: 'Cloud Sync',
              description: 'Access your files from any device',
            },
            {
              icon: '📊',
              title: 'Analytics',
              description: 'Track your productivity improvements',
            },
            {
              icon: '🚀',
              title: 'Priority Support',
              description: 'Get help when you need it',
            },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>{benefit.icon}</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <ActionButton
            title={isLoading ? 'Setting up...' : 'Complete Setup'}
            onPress={handleCompleteSetup}
            disabled={isLoading || !displayName.trim()}
            loading={isLoading}
            style={styles.completeButton}
            icon={<Text style={styles.actionIcon}>🎉</Text>}
          />
          
          <ActionButton
            title="Skip for Now"
            onPress={handleSkip}
            variant="outline"
            style={styles.skipButton}
          />
        </View>

        {/* Privacy Note */}
        <View style={styles.privacySection}>
          <Text style={styles.privacyText}>
            🔒 Your information is secure and will never be shared with third parties. 
            You can update these details anytime in your profile settings.
          </Text>
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

  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  checkIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  checkIcon: {
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

  // Form Section
  formSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body1,
    color: Colors.text,
    ...Shadows.small,
  },
  inputHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: Spacing.xl,
  },
  benefitsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  benefitIconText: {
    fontSize: 24,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  benefitDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Actions
  actionSection: {
    marginBottom: Spacing.xl,
  },
  completeButton: {
    marginHorizontal: 0,
    marginBottom: Spacing.md,
  },
  skipButton: {
    marginHorizontal: 0,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },

  // Privacy Section
  privacySection: {
    backgroundColor: Colors.info + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xxl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  privacyText: {
    ...Typography.body2,
    color: Colors.text,
    lineHeight: 20,
  },
});