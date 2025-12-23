'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChannelEngagementComparison } from '@/hooks/channel-engagement/use-channel-engagement-comparison';
import { useGoogleAnalyticsStatus } from '@/hooks/use-google-analytics-status';

export function ChannelEngagementTable() {
  const { data: gaStatus } = useGoogleAnalyticsStatus();
  const { data, isLoading, error } = useChannelEngagementComparison();

  // Hide component if Google Analytics is not configured
  if (gaStatus && !gaStatus.isConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Session Duration & Engagement Rate Comparison
            </CardTitle>
            <CardDescription>Cross-channel metrics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base">
              Session Duration & Engagement Rate Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600 text-sm">
              Failed to load engagement comparison data. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Session Duration & Engagement Rate Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-sm">No data available</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Session Duration & Engagement Rate Comparison
          </CardTitle>
          <CardDescription>
            {/* TODO: Add data-driven description with metrics summary */}
            Compare average session duration and engagement rate across channels over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement table rendering with sorting and filtering capabilities */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-semibold px-4 py-2">Channel</th>
                  <th className="text-right font-semibold px-4 py-2">Avg Session Duration</th>
                  <th className="text-right font-semibold px-4 py-2">Engagement Rate</th>
                  <th className="text-right font-semibold px-4 py-2">Active Users</th>
                  <th className="text-right font-semibold px-4 py-2">Total Sessions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.channel} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.channel}</td>
                    <td className="px-4 py-3 text-right">
                      {Math.round(row.averageSessionDuration * 10) / 10}s
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Math.round(row.engagementRate * 100) / 100}%
                    </td>
                    <td className="px-4 py-3 text-right">{row.activeUsers.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{row.totalSessions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
