import { BetaAnalyticsDataClient } from "@google-analytics/data";

export function createGoogleAnalyticsClient() {
  const credentials = JSON.parse(
    Buffer.from(
      process.env.GA_SERVICE_ACCOUNT_JSON_BASE64!,
      "base64"
    ).toString("utf-8")
  );
  return new BetaAnalyticsDataClient({
    credentials,
  });
}

export function getGAPropertyId() {
  return process.env.GA_PROPERTY_ID!;
}
