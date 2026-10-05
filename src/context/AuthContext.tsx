import React, { createContext, useContext, useState } from 'react';
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as ExpoLinking from 'expo-linking';
import {
  loginWithWebAPI,
  registerWithWebAPI,
  googleAuthWithWebAPI,
  getGoogleOAuthUrl,
  exchangeGoogleAuthCode,
} from '../services/api';

export interface MobileUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  membershipTier: string;
  vaultStatus: string;
  provider: 'google' | 'email';
}

interface AuthContextType {
  user: MobileUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  signInWithGoogle: (email?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAuthModalOpen: false,
  authModalMode: 'signin',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  setAuthModalMode: () => {},
  signInWithGoogle: async () => ({ success: true }),
  signInWithEmail: async () => ({ success: true }),
  signUpWithEmail: async () => ({ success: true }),
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MobileUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async (googleEmail?: string, googleName?: string) => {
    try {
      // If explicit Google credentials provided
      if (googleEmail) {
        const authUser = await googleAuthWithWebAPI(googleEmail, googleName);
        setUser({
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          avatarUrl: authUser.avatarUrl,
          membershipTier: authUser.membershipTier || 'Apex Verified Client',
          vaultStatus: authUser.vaultStatus || 'Active Google Identity',
          provider: 'google',
        });
        setIsAuthModalOpen(false);
        return { success: true };
      }

      // Launch Google OAuth in device browser securely
      const redirectUrl = ExpoLinking.createURL('auth/callback');
      const oauthUrl = getGoogleOAuthUrl(redirectUrl);
      let authUser;

      try {
        const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);
        if (result.type === 'success' && result.url) {
          // Parse the URL to get the code
          const parsedUrl = ExpoLinking.parse(result.url);
          const code = parsedUrl.queryParams?.code;
          
          if (!code) {
            return { success: false, error: 'No authorization code received' };
          }
          
          // Exchange the code for the actual user token/profile
          authUser = await exchangeGoogleAuthCode(code as string);
        } else {
          return { success: false, error: 'Google login was cancelled' };
        }
      } catch (linkErr) {
        console.warn('[Google OAuth Linking Warning]', linkErr);
        return { success: false, error: 'Failed to launch Google login' };
      }

      // Establish authenticated client profile
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatarUrl: authUser.avatarUrl,
        membershipTier: authUser.membershipTier || 'Apex Verified Client',
        vaultStatus: authUser.vaultStatus || 'Active Google Identity',
        provider: 'google',
      });
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Google authentication failed' };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const authUser = await loginWithWebAPI(cleanEmail, password);
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatarUrl: authUser.avatarUrl,
        membershipTier: authUser.membershipTier || 'Concierge Client',
        vaultStatus: authUser.vaultStatus || 'Verified Email Identity',
        provider: 'email',
      });
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid email or password.' };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const res = await registerWithWebAPI(cleanEmail, password, name);
      if (res && res.id) {
        setUser({
          id: res.id,
          name: res.name,
          email: res.email,
          avatarUrl: res.avatarUrl,
          membershipTier: res.membershipTier || 'New Concierge Client',
          vaultStatus: res.vaultStatus || 'Account Registered',
          provider: 'email',
        });
      }
      return { success: true, confirmationRequired: res?.confirmationRequired };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
