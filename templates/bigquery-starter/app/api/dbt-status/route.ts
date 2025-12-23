export async function GET() {
  const configured =
    !!process.env.DBT_HOST &&
    !!process.env.DBT_ACCOUNT_ID &&
    !!process.env.DBT_TOKEN &&
    !!process.env.DBT_PROD_ENV_ID;

  return Response.json({
    configured,
  });
}
