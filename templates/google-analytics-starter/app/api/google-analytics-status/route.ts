import { NextResponse } from 'next/server';

export type GoogleAnalyticsStatusResponse = {
  isConfigured: boolean;
};

export async function GET() {
  const isConfigured = !!process.env.GA_SERVICE_ACCOUNT_JSON_BASE64;

  return NextResponse.json<GoogleAnalyticsStatusResponse>({ isConfigured });
}
