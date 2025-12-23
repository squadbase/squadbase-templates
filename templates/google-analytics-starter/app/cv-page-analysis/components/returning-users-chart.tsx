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
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReturningUsers } from '@/hooks/cv-page-analysis/use-returning-users';
import { useGoogleAnalyticsStatus } from '@/hooks/use-google-analytics-status';

interface ReturningUsersChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const chartConfig = {
  returningUserCount: {
    label: 'Returning Users',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

export function ReturningUsersChart({ dateRange }: ReturningUsersChartProps) {
  const { data: gaStatus } = useGoogleAnalyticsStatus();
  const { data, isLoading, error } = useReturningUsers(dateRange);

  // Hide component if Google Analytics is not configured
  if (gaStatus && !gaStatus.isConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pages with Most Returning Users</CardTitle>
            <CardDescription>Display pages with high number of repeat visitors</CardDescription>
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
            <CardTitle className="text-base">Pages with Most Returning Users</CardTitle>
            <CardDescription>Display pages with high number of repeat visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">Failed to load data</p>
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
            <CardTitle className="text-base">Pages with Most Returning Users</CardTitle>
            <CardDescription>Display pages with high number of repeat visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = data.map((record) => ({
    page: record.page,
    returningUserCount: record.returningUserCount,
  }));

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pages with Most Returning Users</CardTitle>
          <CardDescription>Display pages with high number of repeat visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="page"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="returningUserCount" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
