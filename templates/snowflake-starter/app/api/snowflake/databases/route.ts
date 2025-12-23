import { NextResponse } from "next/server";
import { createSnowflakeConnection } from "@/lib/snowflake";

export interface SnowflakeDatabaseRecord {
  created_on: string;
  name: string;
  is_default: string;
  is_current: string;
  origin: string;
  owner: string;
  comment: string;
  options: string;
  retention_time: string;
  kind: string;
  owner_role_type: string;
  object_visibility: string | null;
}

export async function GET() {
  try {
    const connection = createSnowflakeConnection();

    const databases = await new Promise<SnowflakeDatabaseRecord[]>(
      (resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            reject(new Error(`Connection failed: ${err.message}`));
            return;
          }

          connection.execute({
            sqlText: "SHOW DATABASES",
            complete: (err, _stmt, rows) => {
              connection.destroy((destroyErr) => {
                if (destroyErr) {
                  console.error("Error destroying connection:", destroyErr);
                }
              });

              if (err) {
                reject(new Error(`Query failed: ${err.message}`));
                return;
              }

              resolve((rows || []) as SnowflakeDatabaseRecord[]);
            },
          });
        });
      }
    );

    return NextResponse.json({ data: databases });
  } catch (error) {
    console.error("Error fetching databases:", error);
    return NextResponse.json(
      { error: "Failed to fetch databases" },
      { status: 500 }
    );
  }
}
