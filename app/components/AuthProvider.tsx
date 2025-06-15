'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  PublicClientApplication,
  AccountInfo,
  AuthenticationResult,
  Configuration,
  PopupRequest,
} from '@azure/msal-browser';
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
let msalConfig: Configuration;
let loginRequest: PopupRequest;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      if (typeof window === 'undefined') return;

      try {
        // First, get the auth configuration from the API route
        if (!configLoaded) {
          const response = await fetch('/api/auth-config');
          if (!response.ok) {
            throw new Error('Failed to fetch auth configuration');
          }

          const authConfig = await response.json();
          msalConfig = authConfig.msalConfig;
          loginRequest = authConfig.loginRequest;

          // Initialize MSAL instance with the fetched configuration
          msalInstance = new PublicClientApplication(msalConfig);
          setConfigLoaded(true);
        }

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
  }, [configLoaded]);

  const login = async () => {
    if (typeof window === 'undefined' || !msalInstance) return;

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
    if (typeof window === 'undefined' || !msalInstance) return;

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
