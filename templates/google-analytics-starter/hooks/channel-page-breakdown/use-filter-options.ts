'use client';

import { useQuery } from '@tanstack/react-query';

interface FilterOptions {
  channels: string[];
  pages: string[];
}

interface UseFilterOptionsResponse {
  channels: string[];
  pages: string[];
  isLoading: boolean;
  error: string | null;
}

export function useFilterOptions(): UseFilterOptionsResponse {
  const { data, isLoading, error } = useQuery<FilterOptions>({
    queryKey: ['channelPageBreakdownFilterOptions'],
    queryFn: async () => {
      const response = await fetch('/api/channel-page-breakdown/filters');

      if (!response.ok) {
        throw new Error('Failed to fetch filter options');
      }

      return await response.json();
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes since filter options don't change frequently
    retry: 1,
  });

  return {
    channels: data?.channels ?? [],
    pages: data?.pages ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
