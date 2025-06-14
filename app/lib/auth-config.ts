import { Configuration, PopupRequest } from '@azure/msal-browser';

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'common'}`,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Add scopes for Microsoft Graph and Dynamics
export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', `${process.env.NEXT_PUBLIC_DYNAMICS_URL}/.default`],
};

// Protected resources configuration
export const protectedResources = {
  dynamicsApi: {
    endpoint: `${process.env.NEXT_PUBLIC_DYNAMICS_URL}/api/data/v${process.env.NEXT_PUBLIC_DYNAMICS_API_VERSION}`,
    scopes: [`${process.env.NEXT_PUBLIC_DYNAMICS_URL}/.default`],
  },
};
