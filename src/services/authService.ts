import { authApi } from '@/lib/api';

// Types for API responses
export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  username: string;
  full_name: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  access_token: string;
  token_type: string;
  username: string;
  full_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  full_name: string;
}

export interface ApiError {
  detail: string;
}

// Password validation utility
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least 1 digit');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Centralized API service
export class AuthService {
  /**
   * Sign up a new user
   */
  static async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      // Validate password before sending request
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      const response = await authApi.signup(data);
      return response;
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // Handle validation errors
      if (error.message) {
        throw new Error(error.message);
      }
      
      // Handle network errors
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Verify OTP for email verification
   */
  static async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    try {
      const response = await authApi.verifyOtp(data);
      return response;
    } catch (error: any) {
      // Handle API errors
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // Handle network errors
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await authApi.login({ email, password });
      return response;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string) {
    try {
      const response = await authApi.forgotPassword({ email });
      return response;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to send reset email. Please try again.');
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string) {
    try {
      const response = await authApi.resetPassword({ token, new_password: newPassword });
      return response;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to reset password. Please try again.');
    }
  }
}
