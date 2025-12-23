import { NextResponse } from "next/server";
import { createSnowflakeConnection } from "@/lib/snowflake";

export interface SchemaObjectRecord {
  database_name: string;
  schema_name: string;
  name: string;
  kind: string;
  created_on: string;
  comment: string | null;
  owner: string;
  rows?: number | null;
}

export async function GET() {
  try {
    const connection = createSnowflakeConnection();

    const schemaObjects = await new Promise<SchemaObjectRecord[]>(
      (resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            reject(new Error(`Connection failed: ${err.message}`));
            return;
          }

          // Get all databases first
          connection.execute({
            sqlText: "SHOW DATABASES",
            complete: (err, _stmt, databases) => {
              if (err) {
                connection.destroy((destroyErr) => {
                  if (destroyErr) {
                    console.error("Error destroying connection:", destroyErr);
                  }
                });
                reject(new Error(`Failed to fetch databases: ${err.message}`));
                return;
              }

              const dbList = (databases || []) as Array<{ name: string }>;
              const allObjects: SchemaObjectRecord[] = [];
              let completedDatabases = 0;

              if (dbList.length === 0) {
                connection.destroy((destroyErr) => {
                  if (destroyErr) {
                    console.error("Error destroying connection:", destroyErr);
                  }
                });
                resolve([]);
                return;
              }

              // For each database, get tables and views
              dbList.forEach((db) => {
                const dbName = db.name;

                // Query to get tables and views from all schemas in the database
                const query = `
                  SELECT
                    '${dbName}' as database_name,
                    table_schema as schema_name,
                    table_name as name,
                    table_type as kind,
                    created as created_on,
                    comment,
                    table_owner as owner,
                    row_count as rows
                  FROM ${dbName}.INFORMATION_SCHEMA.TABLES
                  ORDER BY table_schema, table_name
                `;

                connection.execute({
                  sqlText: query,
                  complete: (err, _stmt, rows) => {
                    if (!err && rows) {
                      allObjects.push(...(rows as SchemaObjectRecord[]));
                    }

                    completedDatabases++;

                    // When all databases are processed
                    if (completedDatabases === dbList.length) {
                      connection.destroy((destroyErr) => {
                        if (destroyErr) {
                          console.error(
                            "Error destroying connection:",
                            destroyErr
                          );
                        }
                      });
                      resolve(allObjects);
                    }
                  },
                });
              });
            },
          });
        });
      }
    );

    return NextResponse.json({ data: schemaObjects });
  } catch (error) {
    console.error("Error fetching schema objects:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables and views" },
      { status: 500 }
    );
  }
}
