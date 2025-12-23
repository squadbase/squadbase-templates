import { useQuery } from '@tanstack/react-query';
import type { ChannelEngagementComparison } from '@/app/api/channel-engagement/comparison/route';

export function useChannelEngagementComparison() {
  return useQuery({
    queryKey: ['channel-engagement-comparison'],
    queryFn: async () => {
      const response = await fetch('/api/channel-engagement/comparison');

      if (!response.ok) {
        throw new Error('Failed to fetch channel engagement comparison');
      }

      return response.json() as Promise<ChannelEngagementComparison[]>;
    },
  });
}
