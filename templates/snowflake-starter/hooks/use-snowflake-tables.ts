import { useQuery } from "@tanstack/react-query";
import type { TableRecord } from "@/app/api/snowflake/tables/route";

export function useSnowflakeTables(databaseName?: string, schemaName?: string) {
  return useQuery<TableRecord[]>({
    queryKey: ["snowflake-tables", databaseName, schemaName],
    queryFn: async () => {
      if (!databaseName || !schemaName) {
        return [];
      }

      const response = await fetch(
        `/api/snowflake/tables?database=${encodeURIComponent(
          databaseName
        )}&schema=${encodeURIComponent(schemaName)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tables and views");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!databaseName && !!schemaName,
  });
}
