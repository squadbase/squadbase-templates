import { useQuery } from '@tanstack/react-query';
import type { PageDwellTimeData } from '@/app/api/channel-engagement/page-dwell-time/route';

export function usePageDwellTime(channel: string) {
  return useQuery({
    queryKey: ['page-dwell-time', channel],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (channel && channel !== '__all__') {
        params.append('channel', channel);
      }

      const response = await fetch(
        `/api/channel-engagement/page-dwell-time?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch page dwell time data');
      }

      return response.json() as Promise<PageDwellTimeData[]>;
    },
  });
}
