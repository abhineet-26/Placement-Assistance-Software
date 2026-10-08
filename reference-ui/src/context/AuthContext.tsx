import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { StudentProfile, User, UserRole } from '../types';

interface AuthContextType {
  role: UserRole;
  user: User | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  switchRole: (role: UserRole) => void;
  refreshUserData: () => Promise<void>;
  updateStudentProfile: (updates: Partial<StudentProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('pl_current_role');
    return (saved as UserRole) || 'student';
  });

  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentRoleData = async (activeRole: UserRole) => {
    setIsLoading(true);
    try {
      const currentUser = await api.getCurrentUser(activeRole);
      setUser(currentUser);

      if (activeRole === 'student') {
        const profile = await api.getStudentProfile();
        setStudentProfile(profile);
      }
    } catch (err) {
      console.error('Error fetching auth data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRoleData(role);
    localStorage.setItem('pl_current_role', role);
  }, [role]);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
  };

  const refreshUserData = async () => {
    await fetchCurrentRoleData(role);
  };

  const updateStudentProfile = async (updates: Partial<StudentProfile>) => {
    const updated = await api.updateStudentProfile(updates);
    setStudentProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        user,
        studentProfile,
        isLoading,
        switchRole,
        refreshUserData,
        updateStudentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
