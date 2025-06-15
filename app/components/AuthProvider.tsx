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
  dynamicsReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let msalInstance: PublicClientApplication;
let msalConfig: Configuration;
let basicLoginRequest: PopupRequest;
let dynamicsScopes: string[] = [];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [authConfigLoaded, setAuthConfigLoaded] = useState(false);
  const [dynamicsReady, setDynamicsReady] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Stage 1: Get auth configuration (pre-authentication)
        if (!authConfigLoaded) {
          const response = await fetch('/api/auth-config');
          if (!response.ok) {
            throw new Error('Failed to fetch auth configuration');
          }

          const authConfig = await response.json();
          msalConfig = authConfig.msalConfig;
          basicLoginRequest = authConfig.loginRequest;

          // Initialize MSAL instance
          msalInstance = new PublicClientApplication(msalConfig);
          setAuthConfigLoaded(true);
        }

        await msalInstance.initialize();

        // Check if there are any cached accounts
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const account = accounts[0];
          setUser(account);
          setIsAuthenticated(true);

          // Stage 2: Get Dynamics configuration and token (post-authentication)
          await initializeDynamicsConfig(account);
        }
      } catch (error) {
        console.error('Error initializing MSAL:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, [authConfigLoaded]);

  const initializeDynamicsConfig = async (account: AccountInfo) => {
    try {
      setDynamicsReady(false);

      // Fetch Dynamics configuration (only for authenticated users)
      const response = await fetch('/api/dynamics-config');
      if (!response.ok) {
        throw new Error('Failed to fetch Dynamics configuration');
      }

      const dynamicsConfig = await response.json();
      dynamicsScopes = dynamicsConfig.scopes;

      // Initialize Dynamics API with configuration
      await dynamicsApi.initialize(dynamicsConfig);

      // Get access token for Dynamics API with the correct scopes
      try {
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: dynamicsScopes,
          account: account,
        });

        dynamicsApi.setAccessToken(tokenResponse.accessToken);
        setDynamicsReady(true);
      } catch (silentError) {
        console.warn('Silent token acquisition failed, trying interactive:', silentError);

        try {
          const interactiveTokenResponse = await msalInstance.acquireTokenPopup({
            scopes: dynamicsScopes,
            account: account,
          });

          dynamicsApi.setAccessToken(interactiveTokenResponse.accessToken);
          setDynamicsReady(true);
        } catch (interactiveError) {
          console.error('Interactive token acquisition failed:', interactiveError);
          setDynamicsReady(false);
          throw interactiveError;
        }
      }
    } catch (error) {
      console.error('Error initializing Dynamics config:', error);
      setDynamicsReady(false);
      throw error;
    }
  };

  const login = async () => {
    if (typeof window === 'undefined' || !msalInstance) return;

    try {
      setLoading(true);
      setDynamicsReady(false);

      // First, login with basic scopes
      const loginResponse: AuthenticationResult = await msalInstance.loginPopup(basicLoginRequest);

      if (loginResponse.account) {
        setUser(loginResponse.account);
        setIsAuthenticated(true);

        // Stage 2: Initialize Dynamics config after authentication
        await initializeDynamicsConfig(loginResponse.account);
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Reset state on login failure
      setUser(null);
      setIsAuthenticated(false);
      setDynamicsReady(false);
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
      setDynamicsReady(false);
      dynamicsApi.clearConfig(); // Clear sensitive config on logout
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
    dynamicsReady,
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
