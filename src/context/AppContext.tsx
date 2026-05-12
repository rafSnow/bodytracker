import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Profile } from '../types/profile';
import type { Goal } from '../types/goal';
import { db } from '../db/database';
import { Toast } from '../components/ui/Toast';

interface AppContextType {
  profile: Profile | null;
  goal: Goal | null;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  loading: boolean;
  updateProfileState: (profile: Profile) => void;
  showToast: (message: string, type?: 'success' | 'danger' | 'warning' | 'info', action?: { label: string; onClick: () => void }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState<{ 
    message: string; 
    type: 'success' | 'danger' | 'warning' | 'info'; 
    isVisible: boolean;
    action?: { label: string; onClick: () => void };
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (
    message: string, 
    type: 'success' | 'danger' | 'warning' | 'info' = 'success',
    action?: { label: string; onClick: () => void }
  ) => {
    setToast({ message, type, isVisible: true, action });
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const p = await db.profile.get(1);
        const g = await db.goals.get(1);
        if (p) setProfile(p);
        if (g) setGoal(g);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const updateProfileState = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  return (
    <AppContext.Provider value={{ profile, goal, theme, setTheme, loading, updateProfileState, showToast }}>
      {children}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        action={toast.action}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
