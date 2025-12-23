import { NextResponse } from "next/server";
import { createBigQueryClient } from "@/lib/bigquery";

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
    const bigquery = createBigQueryClient();

    const [datasets] = await bigquery.getDatasets();

    const allObjects: SchemaObjectRecord[] = [];

    for (const dataset of datasets) {
      const datasetId = dataset.id || "";
      const [tables] = await dataset.getTables();

      for (const table of tables) {
        const [metadata] = await table.getMetadata();
        allObjects.push({
          database_name: datasetId,
          schema_name: datasetId,
          name: table.id || "",
          kind: metadata.type || "TABLE",
          created_on: metadata.creationTime
            ? new Date(parseInt(metadata.creationTime)).toISOString()
            : "",
          comment: metadata.description || null,
          owner: "",
          rows:
            metadata.numRows !== undefined
              ? parseInt(metadata.numRows)
              : null,
        });
      }
    }

    return NextResponse.json({ data: allObjects });
  } catch (error) {
    console.error("Error fetching schema objects:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables and views" },
      { status: 500 }
    );
  }
}
