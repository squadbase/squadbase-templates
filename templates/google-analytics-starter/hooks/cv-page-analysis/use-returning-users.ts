'use client';

import { useQuery } from '@tanstack/react-query';
import type { ReturningUsersRecord } from '@/app/api/cv-page-analysis/returning-users/route';

export function useReturningUsers(dateRange?: {
  startDate: string;
  endDate: string;
}) {
  const query = useQuery({
    queryKey: ['returningUsers', dateRange?.startDate, dateRange?.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

      const response = await fetch(`/api/cv-page-analysis/returning-users?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch returning users data');
      }

      const payload = (await response.json()) as unknown;
      const data = Array.isArray(payload) ? (payload as ReturningUsersRecord[]) : [];

      return data;
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
  };
}
