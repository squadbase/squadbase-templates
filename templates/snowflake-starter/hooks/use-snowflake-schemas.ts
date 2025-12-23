import { useQuery } from "@tanstack/react-query";
import type { SchemaRecord } from "@/app/api/snowflake/schemas/route";

export function useSnowflakeSchemas(databaseName?: string) {
  return useQuery<SchemaRecord[]>({
    queryKey: ["snowflake-schemas", databaseName],
    queryFn: async () => {
      if (!databaseName) {
        return [];
      }

      const response = await fetch(
        `/api/snowflake/schemas?database=${encodeURIComponent(databaseName)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch schemas");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!databaseName,
  });
}
