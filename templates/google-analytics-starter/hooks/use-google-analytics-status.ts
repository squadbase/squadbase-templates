import { useQuery } from '@tanstack/react-query';
import type { GoogleAnalyticsStatusResponse } from '@/app/api/google-analytics-status/route';

async function fetchGoogleAnalyticsStatus(): Promise<GoogleAnalyticsStatusResponse> {
  const response = await fetch('/api/google-analytics-status');
  if (!response.ok) {
    throw new Error('Failed to fetch Google Analytics status');
  }
  return response.json();
}

export function useGoogleAnalyticsStatus() {
  return useQuery({
    queryKey: ['google-analytics-status'],
    queryFn: fetchGoogleAnalyticsStatus,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
