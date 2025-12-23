'use client';

import { useQuery } from '@tanstack/react-query';

export interface ChannelPageViewRecord {
  name: string;
  channel: string;
  page: string;
  pageviews: number;
  uniqueUsers: number;
}

interface UseChannelPageViewDataResponse {
  data: ChannelPageViewRecord[];
  isLoading: boolean;
  error: string | null;
  channels: string[];
  pages: string[];
}

export function useChannelPageViewData(
  selectedChannel: string,
  selectedPage: string,
  limit: number = 10
): UseChannelPageViewDataResponse {
  const queryParams = new URLSearchParams();
  if (selectedChannel && selectedChannel !== '__all__') {
    queryParams.append('channel', selectedChannel);
  }
  if (selectedPage && selectedPage !== '__all__') {
    queryParams.append('page', selectedPage);
  }
  queryParams.append('limit', limit.toString());

  const queryString = queryParams.toString();
  const queryKey = ['channelPageViewData', selectedChannel, selectedPage, limit];

  const { data: apiData, isLoading, error } = useQuery<{
    data: ChannelPageViewRecord[];
    channels: string[];
    pages: string[];
  }>({
    queryKey,
    queryFn: async () => {
      const url = `/api/channel-page-breakdown/chart${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch channel page view data');
      }

      return await response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    data: apiData?.data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    channels: apiData?.channels ?? [],
    pages: apiData?.pages ?? [],
  };
}
