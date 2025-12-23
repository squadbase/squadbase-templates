import { NextRequest, NextResponse } from "next/server";
import { createBigQueryClient } from "@/lib/bigquery";

export interface TableRecord {
  name: string;
  kind: string;
  database_name: string;
  schema_name: string;
  owner: string;
  comment: string | null;
  created_on: string;
  rows: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const databaseName = searchParams.get("database");
    const schemaName = searchParams.get("schema");

    if (!databaseName || !schemaName) {
      return NextResponse.json(
        { error: "Database and schema names are required" },
        { status: 400 }
      );
    }

    const bigquery = createBigQueryClient();
    const dataset = bigquery.dataset(databaseName);

    const [tables] = await dataset.getTables();

    const tableRecords: TableRecord[] = await Promise.all(
      tables.map(async (table) => {
        const [metadata] = await table.getMetadata();
        return {
          name: table.id || "",
          kind: metadata.type || "TABLE",
          database_name: databaseName,
          schema_name: schemaName,
          owner: "",
          comment: metadata.description || null,
          created_on: metadata.creationTime
            ? new Date(parseInt(metadata.creationTime)).toISOString()
            : "",
          rows:
            metadata.numRows !== undefined
              ? parseInt(metadata.numRows)
              : null,
        };
      })
    );

    return NextResponse.json({ data: tableRecords });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables and views" },
      { status: 500 }
    );
  }
}
