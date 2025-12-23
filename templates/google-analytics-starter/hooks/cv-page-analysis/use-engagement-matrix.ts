'use client';

import { useQuery } from '@tanstack/react-query';
import type { EngagementMatrixRecord, EngagementMatrixResponseBody } from '@/app/api/cv-page-analysis/engagement-matrix/route';

export type { EngagementMatrixRecord };

export function useEngagementMatrix(dateRange?: { startDate: string; endDate: string }) {
  const query = useQuery({
    queryKey: ['engagement-matrix', dateRange?.startDate, dateRange?.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange?.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange?.endDate) {
        params.append('endDate', dateRange.endDate);
      }

      const response = await fetch(
        `/api/cv-page-analysis/engagement-matrix?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch engagement matrix data');
      }

      const body = (await response.json()) as EngagementMatrixResponseBody;
      return body.data;
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
  };
}
