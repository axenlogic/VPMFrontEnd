import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { UserProfile, UserContextType } from "@/types/user";
import { UserService } from "@/services/userService";
import { useAuth } from "./AuthContext";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  /**
   * Fetch user profile from API
   */
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userProfile = await UserService.getUserProfile();
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user profile");
      console.error("Error fetching user profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  /**
   * Clear user profile data
   */
  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Update profile with local changes
   * This is for optimistic updates before API call
   */
  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
    },
    [profile]
  );

  /**
   * Fetch profile when authentication state changes
   */
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProfile();
    } else {
      clearProfile();
    }
  }, [isAuthenticated, token, fetchProfile, clearProfile]);

  /**
   * Auto-refresh profile every 5 minutes if authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchProfile();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchProfile]);

  const value: UserContextType = {
    profile,
    isLoading,
    error,
    fetchProfile,
    clearProfile,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
