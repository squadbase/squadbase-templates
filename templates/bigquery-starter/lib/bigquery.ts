import { BigQuery } from '@google-cloud/bigquery';

export function createBigQueryClient() {
  const base64Credentials = process.env.BIGQUERY_SERVICE_ACCOUNT_JSON_BASE64;

  if (!base64Credentials) {
    throw new Error('BIGQUERY_SERVICE_ACCOUNT_JSON_BASE64 environment variable is not set');
  }

  const credentials = JSON.parse(
    Buffer.from(base64Credentials, 'base64').toString('utf-8'),
  );

  return new BigQuery({
    projectId: process.env.BIGQUERY_PROJECT_ID,
    credentials,
  });
}