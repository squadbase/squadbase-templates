import { NextRequest, NextResponse } from "next/server";
import { createSnowflakeConnection } from "@/lib/snowflake";

export interface SchemaRecord {
  name: string;
  database_name: string;
  owner: string;
  comment: string | null;
  created_on: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const databaseName = searchParams.get("database");

    if (!databaseName) {
      return NextResponse.json(
        { error: "Database name is required" },
        { status: 400 }
      );
    }

    const connection = createSnowflakeConnection();

    const schemas = await new Promise<SchemaRecord[]>((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          reject(new Error(`Connection failed: ${err.message}`));
          return;
        }

        connection.execute({
          sqlText: `SHOW SCHEMAS IN DATABASE ${databaseName}`,
          complete: (err, _stmt, rows) => {
            connection.destroy((destroyErr) => {
              if (destroyErr) {
                console.error("Error destroying connection:", destroyErr);
              }
            });

            if (err) {
              reject(new Error(`Failed to fetch schemas: ${err.message}`));
              return;
            }

            const schemaList = (rows || []).map((row: any) => ({
              name: row.name,
              database_name: row.database_name,
              owner: row.owner,
              comment: row.comment,
              created_on: row.created_on,
            }));

            resolve(schemaList);
          },
        });
      });
    });

    return NextResponse.json({ data: schemas });
  } catch (error) {
    console.error("Error fetching schemas:", error);
    return NextResponse.json(
      { error: "Failed to fetch schemas" },
      { status: 500 }
    );
  }
}
