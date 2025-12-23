import { NextResponse } from "next/server";
import { createBigQueryClient } from "@/lib/bigquery";

export interface BigQueryDatabaseRecord {
  name: string;
  datasetId: string;
  projectId: string;
  location: string;
}

export async function GET() {
  try {
    const bigquery = createBigQueryClient();

    const [datasets] = await bigquery.getDatasets();

    const databases: BigQueryDatabaseRecord[] = datasets.map((dataset) => ({
      name: dataset.id || "",
      datasetId: dataset.id || "",
      projectId: dataset.metadata?.datasetReference?.projectId || "",
      location: dataset.metadata?.location || "",
    }));

    return NextResponse.json({ data: databases });
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}
