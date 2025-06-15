import { NextResponse } from 'next/server';
import { Configuration, PopupRequest } from '@azure/msal-browser';

interface AuthConfig {
  msalConfig: Configuration;
  loginRequest: PopupRequest;
  protectedResources: {
    dynamicsApi: {
      endpoint: string;
      scopes: string[];
    };
  };
}

export async function GET() {
  try {
    // Validate required environment variables
    const clientId = process.env.AZURE_AD_CLIENT_ID;
    const tenantId = process.env.AZURE_AD_TENANT_ID;
    const dynamicsUrl = process.env.DYNAMICS_URL;
    const redirectUri = process.env.AZURE_AD_REDIRECT_URI || 'http://localhost:3000';
    const dynamicsApiVersion = process.env.DYNAMICS_API_VERSION || '9.2';

    if (!clientId) {
      throw new Error('Missing AZURE_AD_CLIENT_ID environment variable');
    }
    if (!tenantId) {
      throw new Error('Missing AZURE_AD_TENANT_ID environment variable');
    }
    if (!dynamicsUrl) {
      throw new Error('Missing DYNAMICS_URL environment variable');
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

    // Add scopes for Microsoft Graph and Dynamics
    const loginRequest: PopupRequest = {
      scopes: ['openid', 'profile', 'email', `${dynamicsUrl}/.default`],
    };

    // Protected resources configuration
    const protectedResources = {
      dynamicsApi: {
        endpoint: `${dynamicsUrl}/api/data/v${dynamicsApiVersion}`,
        scopes: [`${dynamicsUrl}/.default`],
      },
    };

    const authConfig: AuthConfig = {
      msalConfig,
      loginRequest,
      protectedResources,
    };

    return NextResponse.json(authConfig);
  } catch (error) {
    console.error('Error getting auth config:', error);
    return NextResponse.json({ error: 'Failed to get auth configuration' }, { status: 500 });
  }
}
