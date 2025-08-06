import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { Header, ActionButton } from '../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface OtpVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      phoneNumber: string;
      verificationId: string;
    };
  };
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { phoneNumber, verificationId } = route.params;
  const { verifyOtp, sendOtp } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all digits are entered
      if (value && index === 5) {
        Keyboard.dismiss();
        const completeOtp = newOtp.join('');
        if (completeOtp.length === 6) {
          handleVerifyOtp(completeOtp);
        }
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join('');
    
    if (codeToVerify.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(verificationId, codeToVerify);
      
      if (result.success) {
        // Navigate to profile setup if new user, or home if existing user
        if (result.user) {
          navigation.navigate('Home');
        } else {
          navigation.navigate('ProfileSetup', { phoneNumber });
        }
      } else {
        Alert.alert('Verification Failed', result.error || 'Invalid OTP code. Please try again.');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsResending(true);
    try {
      const result = await sendOtp(phoneNumber);
      
      if (result.success) {
        Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', result.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    if (phone.startsWith('+1')) {
      const digits = phone.slice(2);
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Verify Phone Number"
        subtitle="Enter the verification code"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <View style={styles.phoneIconContainer}>
            <Text style={styles.phoneIcon}>📱</Text>
          </View>
          <Text style={styles.instructionsTitle}>Check your messages</Text>
          <Text style={styles.instructionsText}>
            We sent a 6-digit verification code to
          </Text>
          <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>Verification Code</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>
        </View>

        {/* Verify Button */}
        <ActionButton
          title={isLoading ? 'Verifying...' : 'Verify Code'}
          onPress={() => handleVerifyOtp()}
          disabled={isLoading || otp.some(digit => !digit)}
          loading={isLoading}
          style={styles.verifyButton}
          icon={<Text style={styles.actionIcon}>✓</Text>}
        />

        {/* Resend Section */}
        <View style={styles.resendSection}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOtp} disabled={isResending}>
              <Text style={[styles.resendButton, isResending && styles.resendButtonDisabled]}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend code in {timer}s
            </Text>
          )}
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            💡 Make sure to check your spam folder if you don't see the message.
          </Text>
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
    justifyContent: 'center',
  },

  // Instructions Section
  instructionsSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  phoneIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  phoneIcon: {
    fontSize: 36,
  },
  instructionsTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  instructionsText: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  phoneNumber: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },

  // OTP Section
  otpSection: {
    marginBottom: Spacing.xl,
  },
  otpLabel: {
    ...Typography.body1,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    textAlign: 'center',
    ...Typography.h2,
    color: Colors.text,
    ...Shadows.small,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '20',
  },

  // Buttons
  verifyButton: {
    marginHorizontal: 0,
    marginBottom: Spacing.xl,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },

  // Resend Section
  resendSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resendText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  resendButton: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendButtonDisabled: {
    color: Colors.textLight,
  },
  timerText: {
    ...Typography.body2,
    color: Colors.textLight,
    fontWeight: '500',
  },

  // Help Section
  helpSection: {
    backgroundColor: Colors.accent + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  helpText: {
    ...Typography.body2,
    color: Colors.text,
    lineHeight: 20,
    textAlign: 'center',
  },
});