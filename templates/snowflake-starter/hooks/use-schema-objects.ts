import { useQuery } from "@tanstack/react-query";
import type { SchemaObjectRecord } from "@/app/api/snowflake/schema-objects/route";

export function useSchemaObjects() {
  return useQuery({
    queryKey: ["snowflake", "schema-objects"],
    queryFn: async () => {
      const response = await fetch("/api/snowflake/schema-objects");
      if (!response.ok) {
        throw new Error("Failed to fetch schema objects");
      }
      const result = await response.json();
      return result.data as SchemaObjectRecord[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
