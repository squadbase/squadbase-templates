'use client';

import { useQuery } from '@tanstack/react-query';
import type { DrillDownDetailData } from '@/app/api/channel-page-breakdown/drill-down/route';

export interface DrillDownDetailRecord extends DrillDownDetailData {}

interface UseDrillDownDetailsResponse {
  data: DrillDownDetailRecord[];
  isLoading: boolean;
  error: string | null;
}

export function useDrillDownDetails(
  selectedChannel: string,
  selectedPage: string,
  limit: number = 50
): UseDrillDownDetailsResponse {
  const queryParams = new URLSearchParams();
  if (selectedChannel && selectedChannel !== '__all__') {
    queryParams.append('channel', selectedChannel);
  }
  if (selectedPage && selectedPage !== '__all__') {
    queryParams.append('page', selectedPage);
  }
  queryParams.append('limit', limit.toString());

  const queryString = queryParams.toString();
  const queryKey = ['drillDownDetails', selectedChannel, selectedPage, limit];

  const { data: apiData, isLoading, error } = useQuery<DrillDownDetailRecord[]>({
    queryKey,
    queryFn: async () => {
      const url = `/api/channel-page-breakdown/drill-down${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch drill-down details');
      }

      const payload = await response.json();
      if (!Array.isArray(payload)) {
        return [];
      }

      return payload as DrillDownDetailRecord[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    data: apiData ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
