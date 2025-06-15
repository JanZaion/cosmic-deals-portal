import { NextResponse } from 'next/server';

interface DynamicsConfig {
  baseUrl: string;
  dynamicsUrl: string;
  apiVersion: string;
  scopes: string[];
}

export async function GET() {
  try {
    const dynamicsUrl = process.env.DYNAMICS_URL;
    const dynamicsApiVersion = process.env.DYNAMICS_API_VERSION || '9.2';

    if (!dynamicsUrl) {
      throw new Error('Missing DYNAMICS_URL environment variable');
    }

    const config: DynamicsConfig = {
      baseUrl: `${dynamicsUrl}/api/data/v${dynamicsApiVersion}`,
      dynamicsUrl,
      apiVersion: dynamicsApiVersion,
      scopes: [`${dynamicsUrl}/.default`], // OAuth scopes for Dynamics
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error getting Dynamics config:', error);
    return NextResponse.json({ error: 'Failed to get Dynamics configuration' }, { status: 500 });
  }
}
