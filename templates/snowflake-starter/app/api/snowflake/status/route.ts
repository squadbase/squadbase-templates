import { NextResponse } from "next/server";

export interface SnowflakeStatusResponse {
  configured: boolean;
}

export async function GET() {
  const account = process.env.SNOWFLAKE_ACCOUNT;
  const user = process.env.SNOWFLAKE_USER;
  const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY_BASE64;

  const configured = Boolean(account && user && privateKey);

  return NextResponse.json({ configured });
}
