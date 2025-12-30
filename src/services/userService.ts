import api from '@/lib/api';
import { UserProfile, UserProfileResponse, UserProfileErrorResponse } from '@/types/user';

/**
 * Centralized User Service
 * Handles all user-related API calls with proper JWT authentication
 */
export class UserService {
  /**
   * Get user profile
   * Requires JWT token in Authorization header
   */
  static async getUserProfile(): Promise<UserProfileResponse> {
    try {
      const response = await api.get('/auth/user/profile');
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        const errorDetail = error.response.data?.detail || 'Invalid or expired token';
        throw new Error(`Authentication failed: ${errorDetail}`);
      }
      
      if (error.response?.status === 404) {
        throw new Error('User profile not found');
      }
      
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      // Handle network errors
      throw new Error('Failed to fetch user profile. Please check your connection and try again.');
    }
  }

  /**
   * Update user profile
   * Requires JWT token in Authorization header
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfileResponse> {
    try {
      const response = await api.patch('/auth/user/profile', updates);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        const errorDetail = error.response.data?.detail || 'Invalid or expired token';
        throw new Error(`Authentication failed: ${errorDetail}`);
      }
      
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw new Error('Failed to update user profile. Please try again.');
    }
  }

  /**
   * Check if user profile is loaded and valid
   */
  static isProfileValid(profile: UserProfile | null): boolean {
    return !!(
      profile &&
      profile.id &&
      profile.full_name &&
      profile.email &&
      typeof profile.is_verified === 'boolean'
    );
  }

  /**
   * Get user display name with fallback
   */
  static getDisplayName(profile: UserProfile | null): string {
    if (!profile) return 'User';
    return profile.full_name || profile.email || 'User';
  }

  /**
   * Get user email with fallback
   */
  static getEmail(profile: UserProfile | null): string {
    if (!profile) return '';
    return profile.email || '';
  }

  /**
   * Check if user is verified
   */
  static isVerified(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return profile.is_verified === true;
  }
}
