import { DuckDBInstance } from "@duckdb/node-api";

let instance: DuckDBInstance | null = null;

export async function createDuckDBConnection() {
  if (!instance) {
    instance = await DuckDBInstance.create();
  }
  return await instance.connect();
}
