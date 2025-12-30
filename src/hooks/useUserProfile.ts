import { useUser } from '@/contexts/UserContext';
import { UserService } from '@/services/userService';
import { toast } from 'sonner';

/**
 * Custom hook for user profile management
 * Provides convenient methods for profile operations
 */
export const useUserProfile = () => {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useUser();

  /**
   * Refresh user profile
   */
  const refreshProfile = async () => {
    try {
      await fetchProfile();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to refresh profile');
    }
  };

  /**
   * Update user profile with API call
   */
  const updateUserProfile = async (updates: Partial<typeof profile>) => {
    if (!profile) return;

    try {
      // Optimistic update
      updateProfile(updates);
      
      // API call
      const updatedProfile = await UserService.updateUserProfile(updates);
      updateProfile(updatedProfile);
      
      toast.success('Profile updated successfully');
    } catch (err: any) {
      // Revert optimistic update
      await fetchProfile();
      toast.error(err.message || 'Failed to update profile');
    }
  };

  /**
   * Get user display name
   */
  const getDisplayName = () => {
    return UserService.getDisplayName(profile);
  };

  /**
   * Get user email
   */
  const getEmail = () => {
    return UserService.getEmail(profile);
  };

  /**
   * Check if user is verified
   */
  const isVerified = () => {
    return UserService.isVerified(profile);
  };

  /**
   * Check if profile is valid
   */
  const isProfileValid = () => {
    return UserService.isProfileValid(profile);
  };

  return {
    profile,
    isLoading,
    error,
    refreshProfile,
    updateUserProfile,
    getDisplayName,
    getEmail,
    isVerified,
    isProfileValid,
  };
};
