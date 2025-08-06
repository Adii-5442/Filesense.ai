import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, AuthResponse } from '../services/authService';

/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 */

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
  
  // Auth methods
  sendOtp: (phoneNumber: string) => Promise<{ success: boolean; sessionInfo?: string; error?: string }>;
  verifyOtp: (verificationId: string, otpCode: string) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  
  // File processing methods
  canProcessFiles: (fileCount: number) => { canProcess: boolean; remainingFiles: number };
  
  // Guest methods
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.initialize();
      
      if (userData) {
        setUser(userData);
        setIsGuest(false);
      } else {
        setUser(null);
        setIsGuest(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    return await authService.sendOtp(phoneNumber);
  };

  const verifyOtp = async (verificationId: string, otpCode: string): Promise<AuthResponse> => {
    try {
      const result = await authService.verifyOtp(verificationId, otpCode);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsGuest(false);
      }
      
      return result;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: 'Verification failed',
      };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResponse> => {
    try {
      const result = await authService.updateProfile(updates);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Profile update failed',
      };
    }
  };

  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authService.signOut();
      
      if (result.success) {
        setUser(null);
        setIsGuest(false);
      }
      
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Sign out failed',
      };
    }
  };

  const canProcessFiles = (fileCount: number): { canProcess: boolean; remainingFiles: number } => {
    if (isGuest) {
      // Guest users can process up to 5 files
      return { canProcess: fileCount <= 5, remainingFiles: 5 };
    }
    
    return authService.canProcessFiles(fileCount);
  };

  const continueAsGuest = (): void => {
    setIsGuest(true);
    setUser(null);
  };

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    isGuest,
    
    // Auth methods
    sendOtp,
    verifyOtp,
    updateProfile,
    signOut,
    
    // File processing methods
    canProcessFiles,
    
    // Guest methods
    continueAsGuest,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};