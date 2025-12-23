import { NextRequest, NextResponse } from 'next/server';
import { createBigQueryClient } from '@/lib/bigquery';

export interface SchemaRecord {
  name: string;
  database_name: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const databaseName = searchParams.get('database');

    if (!databaseName) {
      return NextResponse.json(
        { error: 'Database name is required' },
        { status: 400 },
      );
    }

    const bigquery = createBigQueryClient();
    const dataset = bigquery.dataset(databaseName);

    const [tables] = await dataset.getTables();

    const schemas: SchemaRecord[] =
      tables.length > 0
        ? [{ name: databaseName, database_name: databaseName }]
        : [];

    return NextResponse.json({ data: schemas });
  } catch (error) {
    console.error('Error fetching schemas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemas' },
      { status: 500 },
    );
  }
}
