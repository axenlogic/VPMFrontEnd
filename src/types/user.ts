// User Profile API Types

export type UserRole = 'vpm_admin' | 'district_admin' | 'district_viewer' | 'public';

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  is_verified: boolean;
  role?: UserRole;
  district_id?: number | null;
}

export interface UserProfileError {
  detail: string;
}

// API Response Types
export interface UserProfileResponse extends UserProfile { }

// Error Response Types
export interface UserProfileErrorResponse {
  detail: string;
}

// Context Types
export interface UserContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}
