'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEngagementMatrix } from '@/hooks/cv-page-analysis/use-engagement-matrix';
import { useGoogleAnalyticsStatus } from '@/hooks/use-google-analytics-status';

interface EngagementMatrixChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const chartConfig = {
  engagementRate: {
    label: 'Engagement Rate (%)',
    color: 'var(--color-chart-3)',
  },
  pageViews: {
    label: 'Page Views',
    color: 'var(--color-chart-4)',
  },
} satisfies ChartConfig;

export function EngagementMatrixChart({ dateRange }: EngagementMatrixChartProps) {
  const { data: gaStatus } = useGoogleAnalyticsStatus();
  const { data, isLoading, error } = useEngagementMatrix(dateRange);

  // Hide component if Google Analytics is not configured
  if (gaStatus && !gaStatus.isConfigured) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Rate × Page Views Matrix</CardTitle>
            <CardDescription>
              X-axis: Page Views, Y-axis: Engagement Rate. Each plot point represents a page
            </CardDescription>
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
            <CardTitle className="text-base">Engagement Rate × Page Views Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Failed to load data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Rate × Page Views Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = data.map((record) => ({
    x: record.pageViews,
    y: record.engagementRate,
    page: record.page,
  }));

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement Rate × Page Views Matrix</CardTitle>
          <CardDescription>
            X-axis: Page Views, Y-axis: Engagement Rate. Each plot point represents a page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                type="number"
                dataKey="x"
                name="Page Views"
                label={{ value: 'Page Views', position: 'insideBottomRight', offset: -10 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Engagement Rate (%)"
                label={{ value: 'Engagement Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const record = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium text-sm mb-1">{record.page}</div>
                      <div className="grid gap-1 text-xs text-muted-foreground">
                        <div className="flex justify-between gap-4">
                          <span>Page Views</span>
                          <span className="font-medium text-foreground">{record.x}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Engagement Rate</span>
                          <span className="font-medium text-foreground">{record.y}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter
                name="Page"
                data={chartData}
                fill="var(--color-chart-3)"
                shape="circle"
              />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
