import { NextResponse } from 'next/server';
import { Configuration, PopupRequest } from '@azure/msal-browser';

interface AuthConfig {
  msalConfig: Configuration;
  loginRequest: PopupRequest;
}

export async function GET() {
  try {
    // Validate required environment variables
    const clientId = process.env.AZURE_AD_CLIENT_ID;
    const tenantId = process.env.AZURE_AD_TENANT_ID;
    const redirectUri = process.env.AZURE_AD_REDIRECT_URI || 'http://localhost:3000';

    if (!clientId) {
      throw new Error('Missing AZURE_AD_CLIENT_ID environment variable');
    }
    if (!tenantId) {
      throw new Error('Missing AZURE_AD_TENANT_ID environment variable');
    }

    // MSAL configuration
    const msalConfig: Configuration = {
      auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri,
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
      },
    };

    // Basic login request (Dynamics scope will be added post-auth)
    const loginRequest: PopupRequest = {
      scopes: ['openid', 'profile', 'email'],
    };

    const authConfig: AuthConfig = {
      msalConfig,
      loginRequest,
    };

    return NextResponse.json(authConfig);
  } catch (error) {
    console.error('Error getting auth config:', error);
    return NextResponse.json({ error: 'Failed to get auth configuration' }, { status: 500 });
  }
}
