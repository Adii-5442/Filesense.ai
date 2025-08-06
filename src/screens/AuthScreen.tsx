import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { Header, ActionButton } from '../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface AuthScreenProps {
  navigation: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { sendOtp, continueAsGuest } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formattedValue, setFormattedValue] = useState('');

  const handleSendOtp = async () => {
    if (!formattedValue || formattedValue.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOtp(formattedValue);
      
      if (result.success && result.sessionInfo) {
        navigation.navigate('OtpVerification', {
          phoneNumber: formattedValue,
          verificationId: result.sessionInfo,
        });
      } else {
        Alert.alert('Error', result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    Alert.alert(
      'Continue as Guest',
      'As a guest, you can process up to 5 files. Sign up for unlimited processing and additional features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            continueAsGuest();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Welcome to FileSense.AI"
        subtitle="AI-powered file organization"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🧠</Text>
          </View>
          <Text style={styles.welcomeTitle}>Get Started</Text>
          <Text style={styles.welcomeDescription}>
            Sign in to unlock unlimited file processing and save your organized files to the cloud.
          </Text>
        </View>

        {/* Phone Input Section */}
        <View style={styles.phoneSection}>
          <Text style={styles.sectionTitle}>Enter your phone number</Text>
          <Text style={styles.sectionDescription}>
            We'll send you a verification code to confirm your number.
          </Text>
          
          <View style={styles.phoneInputContainer}>
            <PhoneInput
              ref={null}
              defaultValue={phoneNumber}
              defaultCode="US"
              layout="first"
              onChangeText={(text) => {
                setPhoneNumber(text);
              }}
              onChangeFormattedText={(text) => {
                setFormattedValue(text);
              }}
              withDarkTheme={false}
              withShadow={false}
              autoFocus={false}
              containerStyle={styles.phoneInputStyle}
              textContainerStyle={styles.phoneTextContainer}
              textInputStyle={styles.phoneTextInput}
              codeTextStyle={styles.phoneCodeText}
              flagButtonStyle={styles.phoneFlagButton}
            />
          </View>

          <ActionButton
            title={isLoading ? 'Sending...' : 'Send Verification Code'}
            onPress={handleSendOtp}
            disabled={isLoading || !formattedValue}
            loading={isLoading}
            style={styles.sendOtpButton}
            icon={<Text style={styles.actionIcon}>📱</Text>}
          />
        </View>

        {/* Guest Option */}
        <View style={styles.guestSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.guestCard} onPress={handleContinueAsGuest}>
            <View style={styles.guestContent}>
              <View style={styles.guestIcon}>
                <Text style={styles.guestIconText}>👤</Text>
              </View>
              <View style={styles.guestTextContainer}>
                <Text style={styles.guestTitle}>Continue as Guest</Text>
                <Text style={styles.guestDescription}>
                  Process up to 5 files without signing up
                </Text>
              </View>
              <Text style={styles.guestArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Why sign up?</Text>
          
          {[
            {
              icon: '∞',
              title: 'Unlimited Processing',
              description: 'Process as many files as you need',
            },
            {
              icon: '☁️',
              title: 'Cloud Storage',
              description: 'Save and sync your files across devices',
            },
            {
              icon: '📈',
              title: 'Usage Analytics',
              description: 'Track your productivity and savings',
            },
            {
              icon: '🎯',
              title: 'Premium Features',
              description: 'Advanced AI models and batch processing',
            },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
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

        {/* Privacy Note */}
        <View style={styles.privacySection}>
          <Text style={styles.privacyText}>
            🔒 Your privacy is protected. We use your phone number only for authentication 
            and never share it with third parties.
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

  // Phone Section
  phoneSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  phoneInputContainer: {
    marginBottom: Spacing.lg,
  },
  phoneInputStyle: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    width: '100%',
    height: 56,
    ...Shadows.small,
  },
  phoneTextContainer: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
  },
  phoneTextInput: {
    ...Typography.body1,
    color: Colors.text,
    fontSize: 16,
  },
  phoneCodeText: {
    ...Typography.body1,
    color: Colors.text,
    fontSize: 16,
  },
  phoneFlagButton: {
    backgroundColor: 'transparent',
  },
  sendOtpButton: {
    marginHorizontal: 0,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },

  // Guest Section
  guestSection: {
    marginBottom: Spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
    fontWeight: '500',
  },
  guestCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  guestContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.accent + '20',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  guestIconText: {
    fontSize: 24,
  },
  guestTextContainer: {
    flex: 1,
  },
  guestTitle: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  guestDescription: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  guestArrow: {
    ...Typography.h3,
    color: Colors.textLight,
  },

  // Features Section
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  featuresTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureIconText: {
    fontSize: 20,
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
    lineHeight: 18,
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