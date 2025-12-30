// User Profile API Types

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  is_verified: boolean;
}

export interface UserProfileError {
  detail: string;
}

// API Response Types
export interface UserProfileResponse extends UserProfile {}

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
