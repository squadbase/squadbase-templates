import { useQuery } from "@tanstack/react-query";

interface DbtStatus {
  configured: boolean;
}

export function useDbdStatus() {
  return useQuery({
    queryKey: ["dbt-status"],
    queryFn: async () => {
      const response = await fetch("/api/dbt-status");
      if (!response.ok) {
        throw new Error("Failed to fetch dbt status");
      }
      return response.json() as Promise<DbtStatus>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
