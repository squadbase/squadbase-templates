import { useQuery } from "@tanstack/react-query";

const DATA_API_BASE = "/api/data-source";

export function useDataSourceQuery(
  slug: string,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: ["data-source", slug, params ?? {}],
    queryFn: async () => {
      const res = await fetch(`${DATA_API_BASE}/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: params ?? {} }),
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
