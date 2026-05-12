import { useState } from 'react';
import { db } from '../db/database';
import { useAppContext } from '../context/AppContext';
import type { Profile } from '../types/profile';

export function useProfile() {
  const { profile, loading: contextLoading, updateProfileState } = useAppContext();
  const [loading, setLoading] = useState(false);

  const saveProfile = async (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const newProfile: Profile = {
        ...data,
        id: 1,
        createdAt: now,
        updatedAt: now,
      };
      await db.profile.put(newProfile);
      updateProfileState(newProfile);
    } catch (error) {
      console.error('Failed to save profile', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return;
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const updatedProfile: Profile = {
        ...profile,
        ...data,
        id: 1,
        updatedAt: now,
      };
      await db.profile.put(updatedProfile);
      updateProfileState(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading: loading || contextLoading,
    saveProfile,
    updateProfile,
  };
}
