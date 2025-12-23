'use client';

import { useQuery } from '@tanstack/react-query';
import type { TopEngagementPageData } from '@/app/api/cv-page-analysis/top-engagement-pages/route';

export interface TopEngagementPage {
  page: string;
  averageEngagementTime: number;
}

interface UseTopEngagementPagesResponse {
  data: TopEngagementPage[];
  isLoading: boolean;
  error: string | null;
}

export function useTopEngagementPages(dateRange?: {
  startDate: string;
  endDate: string;
}): UseTopEngagementPagesResponse {
  const queryParams = new URLSearchParams();
  if (dateRange?.startDate) {
    queryParams.append('startDate', dateRange.startDate);
  }
  if (dateRange?.endDate) {
    queryParams.append('endDate', dateRange.endDate);
  }

  const queryString = queryParams.toString();
  const queryKey = ['topEngagementPages', dateRange?.startDate, dateRange?.endDate];

  const { data: apiData, isLoading, error } = useQuery<TopEngagementPageData[]>({
    queryKey,
    queryFn: async () => {
      const url = `/api/cv-page-analysis/top-engagement-pages${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch top engagement pages');
      }

      const payload = (await response.json()) as unknown;
      if (!Array.isArray(payload)) {
        return [];
      }

      return payload as TopEngagementPageData[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const data = apiData ?? [];
  const errorMessage = error ? (error as Error).message : null;

  return {
    data,
    isLoading,
    error: errorMessage,
  };
}
