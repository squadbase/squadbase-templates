import { NextResponse } from "next/server";

export interface BigQueryStatusResponse {
  configured: boolean;
}

export async function GET() {
  const serviceAccountJson = process.env.BIGQUERY_SERVICE_ACCOUNT_JSON_BASE64;
  const projectId = process.env.BIGQUERY_PROJECT_ID;

  const configured = Boolean(serviceAccountJson && projectId);

  return NextResponse.json({ configured });
}
