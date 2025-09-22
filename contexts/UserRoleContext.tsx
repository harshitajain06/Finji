import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
// @ts-ignore - Firebase config is in JS
import { auth } from '../config/firebase';

interface UserRoleContextType {
  userRole: 'investor' | 'applicant';
  setUserRole: (role: 'investor' | 'applicant') => void;
  isLoading: boolean;
  user: any;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // @ts-ignore - auth is imported from JS file
  const [user, loading, error] = useAuthState(auth);
  const [userRole, setUserRole] = useState<'investor' | 'applicant'>('applicant');

  // Update role when user changes
  useEffect(() => {
    if (user?.photoURL) {
      setUserRole(user.photoURL as 'investor' | 'applicant');
    } else {
      setUserRole('applicant');
    }
  }, [user?.photoURL]);

  const value = {
    userRole,
    setUserRole,
    isLoading: loading,
    user
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};
