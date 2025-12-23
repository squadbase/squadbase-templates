'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageDwellTime } from '@/hooks/channel-engagement/use-page-dwell-time';
import { useGoogleAnalyticsStatus } from '@/hooks/use-google-analytics-status';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface PageDwellTimeChartProps {
  channel: string;
}

const chartConfig = {
  dwell: {
    label: 'Average Dwell Time (seconds)',
    color: 'var(--color-chart-1)',
  },
  engagement: {
    label: 'Engagement Rate (%)',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

export function PageDwellTimeChart({ channel }: PageDwellTimeChartProps) {
  const { data: gaStatus } = useGoogleAnalyticsStatus();
  const { data, isLoading, error } = usePageDwellTime(channel);

  // Hide component if Google Analytics is not configured
  if (gaStatus && !gaStatus.isConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Page Dwell Time (by Channel)</CardTitle>
            <CardDescription>Average engagement time per page</CardDescription>
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
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base">Page Dwell Time (by Channel)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600 text-sm">
              Failed to load page dwell time data. Please try again.
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
            <CardTitle className="text-base">Page Dwell Time (by Channel)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 text-sm">No data available for this channel</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform data for chart
  const chartData = data.slice(0, 10).map((item) => ({
    page: item.page.substring(0, 30) + (item.page.length > 30 ? '...' : ''),
    dwell: Math.round(item.averageEngagementTime * 10) / 10,
    engagement: Math.round(item.engagementRate * 10) / 10,
  }));

  const channelLabel = channel === '__all__' ? 'All Channels' : `Channel: ${channel}`;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page Dwell Time (by Channel)</CardTitle>
          <CardDescription>
            {channelLabel} - Average engagement time and engagement rate per page (Top 10)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="page"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis yAxisId="left" label={{ value: 'Dwell Time (seconds)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Engagement Rate (%)', angle: 90, position: 'insideRight' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" align="right" />
              <Bar yAxisId="left" dataKey="dwell" fill="var(--color-chart-1)" radius={4} />
              <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
