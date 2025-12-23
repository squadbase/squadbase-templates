import snowflake from 'snowflake-sdk';

// Disable Snowflake SDK logging
snowflake.configure({ logLevel: 'OFF' });

export function createSnowflakeConnection() {
  return snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USER!,
    role: process.env.SNOWFLAKE_ROLE!,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
    authenticator: 'SNOWFLAKE_JWT',
    privateKey: Buffer.from(process.env.SNOWFLAKE_PRIVATE_KEY_BASE64 ?? '', 'base64').toString('utf-8'),
  });
}