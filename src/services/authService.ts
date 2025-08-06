import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication Service for React Native
 * Handles Firebase phone authentication and user management
 */

export interface User {
  uid: string;
  phoneNumber: string;
  displayName?: string;
  email?: string;
  role: 'free' | 'premium' | 'admin';
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'trial';
  filesProcessedThisMonth: number;
  monthlyLimit: number;
  totalFilesProcessed: number;
  settings: {
    autoRename: boolean;
    preserveOriginalNames: boolean;
    useAIForAllFiles: boolean;
    maxFileSize: number;
  };
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  code?: string;
}

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api/v1' 
  : 'https://your-backend-domain.com/api/v1';

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  /**
   * Initialize auth service and check for existing session
   */
  async initialize(): Promise<User | null> {
    try {
      // Check for stored auth token
      const storedToken = await AsyncStorage.getItem('@auth_token');
      const storedUser = await AsyncStorage.getItem('@user_data');

      if (storedToken && storedUser) {
        this.authToken = storedToken;
        this.currentUser = JSON.parse(storedUser);
        
        // Validate token with backend
        const isValid = await this.validateToken(storedToken);
        if (isValid) {
          return this.currentUser;
        }
      }

      // Check Firebase auth state
      const firebaseUser = auth().currentUser;
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userData = await this.getUserProfile(token);
        if (userData.success && userData.user) {
          await this.setAuthData(userData.user, token);
          return userData.user;
        }
      }

      return null;
    } catch (error) {
      console.error('Auth initialization error:', error);
      return null;
    }
  }

  /**
   * Send OTP to phone number
   */
  async sendOtp(phoneNumber: string): Promise<{ success: boolean; sessionInfo?: string; error?: string }> {
    try {
      // Use Firebase client SDK to send OTP
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      return {
        success: true,
        sessionInfo: confirmation.verificationId,
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send OTP',
      };
    }
  }

  /**
   * Verify OTP and sign in user
   */
  async verifyOtp(verificationId: string, otpCode: string): Promise<AuthResponse> {
    try {
      // Create credential and sign in with Firebase
      const credential = auth.PhoneAuthProvider.credential(verificationId, otpCode);
      const userCredential = await auth().signInWithCredential(credential);
      
      // Get Firebase ID token
      const token = await userCredential.user.getIdToken();
      
      // Register/get user from backend
      const userData = await this.registerUser(token, {
        phoneNumber: userCredential.user.phoneNumber!,
      });

      if (userData.success && userData.user) {
        await this.setAuthData(userData.user, token);
        return userData;
      }

      return {
        success: false,
        error: 'Failed to complete authentication',
      };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error.message || 'Invalid OTP code',
      };
    }
  }

  /**
   * Register/update user profile
   */
  async registerUser(
    idToken: string, 
    userData: { phoneNumber: string; displayName?: string; email?: string }
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          ...userData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          user: data.data.user,
        };
      }

      return {
        success: false,
        error: data.error || 'Registration failed',
        code: data.code,
      };
    } catch (error: any) {
      console.error('Register user error:', error);
      return {
        success: false,
        error: 'Network error during registration',
      };
    }
  }

  /**
   * Get current user profile from backend
   */
  async getUserProfile(token?: string): Promise<AuthResponse> {
    try {
      const authToken = token || this.authToken;
      if (!authToken) {
        return {
          success: false,
          error: 'No authentication token',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        this.currentUser = data.data.user;
        return {
          success: true,
          user: data.data.user,
        };
      }

      return {
        success: false,
        error: data.error || 'Failed to get user profile',
        code: data.code,
      };
    } catch (error: any) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      if (!this.authToken) {
        return {
          success: false,
          error: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (data.success) {
        this.currentUser = { ...this.currentUser, ...data.data.user };
        await AsyncStorage.setItem('@user_data', JSON.stringify(this.currentUser));
        
        return {
          success: true,
          user: this.currentUser,
        };
      }

      return {
        success: false,
        error: data.error || 'Failed to update profile',
        code: data.code,
      };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // Sign out from Firebase
      await auth().signOut();
      
      // Sign out from backend
      if (this.authToken) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.warn('Backend logout failed:', error);
        }
      }

      // Clear local data
      await this.clearAuthData();
      
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Check if user can process files based on their plan
   */
  canProcessFiles(fileCount: number): { canProcess: boolean; remainingFiles: number } {
    if (!this.currentUser) {
      // Guest users can process up to 5 files
      return { canProcess: fileCount <= 5, remainingFiles: 5 };
    }

    const remainingFiles = this.currentUser.monthlyLimit - this.currentUser.filesProcessedThisMonth;
    const canProcess = remainingFiles >= fileCount || this.currentUser.role === 'premium';

    return { canProcess, remainingFiles };
  }

  // Private helper methods

  private async setAuthData(user: User, token: string): Promise<void> {
    this.currentUser = user;
    this.authToken = token;
    
    await AsyncStorage.setItem('@user_data', JSON.stringify(user));
    await AsyncStorage.setItem('@auth_token', token);
  }

  private async clearAuthData(): Promise<void> {
    this.currentUser = null;
    this.authToken = null;
    
    await AsyncStorage.multiRemove(['@user_data', '@auth_token']);
  }

  private async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();