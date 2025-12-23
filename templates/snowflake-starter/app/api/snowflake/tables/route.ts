import { NextRequest, NextResponse } from "next/server";
import { createSnowflakeConnection } from "@/lib/snowflake";

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

    const connection = createSnowflakeConnection();

    const tables = await new Promise<TableRecord[]>((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(new Error(`Connection failed: ${err.message}`));
          return;
        }

        const query = `
          SELECT
            TABLE_NAME as "name",
            TABLE_TYPE as "kind",
            '${databaseName}' as "database_name",
            TABLE_SCHEMA as "schema_name",
            TABLE_OWNER as "owner",
            COMMENT as "comment",
            CREATED as "created_on",
            ROW_COUNT as "rows"
          FROM ${databaseName}.INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = '${schemaName}'
          ORDER BY TABLE_NAME
        `;

        connection.execute({
          sqlText: query,
          complete: (err, _stmt, rows) => {
            connection.destroy((destroyErr) => {
              if (destroyErr) {
                console.error("Error destroying connection:", destroyErr);
              }
            });

            if (err) {
              reject(new Error(`Failed to fetch tables: ${err.message}`));
              return;
            }

            resolve((rows as TableRecord[]) || []);
          },
        });
      });
    });

    return NextResponse.json({ data: tables });
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables and views" },
      { status: 500 }
    );
  }
}
