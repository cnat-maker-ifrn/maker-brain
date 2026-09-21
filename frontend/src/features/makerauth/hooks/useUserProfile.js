import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useAuth } from '@/context/AuthContext';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useUserProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await authService.getMe();
      setProfile(data);
    } catch (err) {
      setError(extractServerErrors(err));
      // Fallback to basic user info from auth token if available
      if (authUser) {
        setProfile({
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          groups: authUser.groups || [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile: profile || authUser,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
