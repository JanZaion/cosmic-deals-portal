'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../lib/auth-config';
import { dynamicsApi } from '../lib/dynamics-api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let msalInstance: PublicClientApplication;

if (typeof window !== 'undefined') {
  msalInstance = new PublicClientApplication(msalConfig);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeMsal = async () => {
      if (typeof window === 'undefined') return;

      try {
        await msalInstance.initialize();

        // Check if there are any cached accounts
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          setUser(account);
          setIsAuthenticated(true);

          // Get access token for Dynamics API
          try {
            const tokenResponse = await msalInstance.acquireTokenSilent({
              ...loginRequest,
              account: account,
            });
            dynamicsApi.setAccessToken(tokenResponse.accessToken);
          } catch (error) {
            console.error('Error acquiring token silently:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing MSAL:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, []);

  const login = async () => {
    if (typeof window === 'undefined') return;

    try {
      setLoading(true);
      const loginResponse: AuthenticationResult = await msalInstance.loginPopup(loginRequest);

      if (loginResponse.account) {
        setUser(loginResponse.account);
        setIsAuthenticated(true);
        dynamicsApi.setAccessToken(loginResponse.accessToken);
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (typeof window === 'undefined') return;

    try {
      setLoading(true);
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: '/',
        mainWindowRedirectUri: '/',
      });
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
