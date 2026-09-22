import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { setStoredAdminToken } from '../services/agencyApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  refreshAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => null,
  signInWithEmail: async () => null,
  signUpWithEmail: async () => null,
  logout: async () => {},
  getIdToken: async () => null,
  refreshAdminStatus: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(forceRefresh);
    } catch (err) {
      console.error('Error fetching Firebase ID token:', err);
      return null;
    }
  }, []);

  const verifyServerAdmin = useCallback(async (token: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      const adminStatus = Boolean(data.isAdmin);
      if (adminStatus) {
        // Sync custom claims in background if needed
        fetch('/api/auth/refresh-claims', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      return adminStatus;
    } catch (err) {
      console.error('Error verifying admin with server:', err);
      return false;
    }
  }, []);

  const refreshAdminStatus = useCallback(async (): Promise<boolean> => {
    const token = await getIdToken(true);
    if (!token) {
      setIsAdmin(false);
      return false;
    }
    const admin = await verifyServerAdmin(token);
    setIsAdmin(admin);
    if (admin) {
      setStoredAdminToken(token);
    }
    return admin;
  }, [getIdToken, verifyServerAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const admin = await verifyServerAdmin(token);
          setIsAdmin(admin);
          if (admin) {
            setStoredAdminToken(token);
          }
        } catch (err) {
          console.error('Auth verification error on state change:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [verifyServerAdmin]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(true);
      const admin = await verifyServerAdmin(token);
      setIsAdmin(admin);
      if (admin) {
        setStoredAdminToken(token);
      }
      return result.user;
    } catch (err: any) {
      console.error('Firebase Google Sign-in error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const token = await result.user.getIdToken(true);
      const admin = await verifyServerAdmin(token);
      setIsAdmin(admin);
      if (admin) {
        setStoredAdminToken(token);
      }
      return result.user;
    } catch (err: any) {
      console.error('Firebase Email sign-in error:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName: displayName.trim() });
      }
      const token = await result.user.getIdToken(true);
      const admin = await verifyServerAdmin(token);
      setIsAdmin(admin);
      if (admin) {
        setStoredAdminToken(token);
      }
      return result.user;
    } catch (err: any) {
      console.error('Firebase Email sign-up error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setIsAdmin(false);
      setStoredAdminToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        getIdToken,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

