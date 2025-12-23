'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useChannelPageViewData } from '@/hooks/channel-page-breakdown/use-channel-page-view-data';
import { useFilterOptions } from '@/hooks/channel-page-breakdown/use-filter-options';
import { useGoogleAnalyticsStatus } from '@/hooks/use-google-analytics-status';

interface ChannelPageViewChartProps {
  selectedChannel: string;
  onChannelSelect: (channel: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 20, 50, 100];

const chartConfig = {
  pageviews: {
    label: 'Page Views',
    color: 'var(--color-chart-1)',
  },
  uniqueUsers: {
    label: 'Users',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

export function ChannelPageViewChart({
  selectedChannel,
  onChannelSelect,
  limit,
  onLimitChange,
}: ChannelPageViewChartProps) {
  const { data: gaStatus } = useGoogleAnalyticsStatus();
  const { data, isLoading, error } = useChannelPageViewData(
    selectedChannel,
    '__all__',
    limit
  );
  const { channels, isLoading: isFilterLoading } = useFilterOptions();

  // Hide component if Google Analytics is not configured
  if (gaStatus && !gaStatus.isConfigured) {
    return null;
  }

  if (isLoading || isFilterLoading) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel-wise Page View Breakdown</CardTitle>
            <CardDescription>Page view analysis by channel and page combination</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel-wise Page View Breakdown</CardTitle>
            <CardDescription>Page view analysis by channel and page combination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-80 text-red-500">
              <p>An error occurred: {error}</p>
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
            <CardTitle className="text-base">Channel-wise Page View Breakdown</CardTitle>
            <CardDescription>Page view analysis by channel and page combination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-80 text-muted-foreground">
              <p>No data available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel-wise Page View Breakdown</CardTitle>
          <CardDescription>Page view analysis by channel and page combination</CardDescription>
          <div className="grid gap-4 md:grid-cols-2 mt-4 max-w-2xl">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Channel</label>
              <select
                value={selectedChannel}
                onChange={(e) => onChannelSelect(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="__all__">All Channels</option>
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Display Count</label>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                {LIMIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    Top {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement chart rendering with selected filters */}
          {/* TODO: Handle drill-down interactions on chart elements */}
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="pageviews" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="uniqueUsers" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
