'use client';

import { useState, useRef } from 'react';
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
import { useTopEngagementPages } from '@/hooks/cv-page-analysis/use-top-engagement-pages';
import { useGoogleAnalyticsStatus } from '@/hooks/use-google-analytics-status';

interface TopEngagementPagesChartProps {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

const chartConfig = {
  averageEngagementTime: {
    label: 'Engagement Time (seconds)',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig;

interface CustomYAxisTickProps {
  x: number;
  y: number;
  payload: {
    value: string;
  };
  onMouseEnter: (page: string, y: number) => void;
  onMouseLeave: () => void;
}

function CustomYAxisTick({
  x,
  y,
  payload,
  onMouseEnter,
  onMouseLeave,
}: CustomYAxisTickProps) {
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: 'bounding-box' as React.CSSProperties['pointerEvents'] }}>
      <foreignObject x={-95} y={-12} width={95} height={24} style={{ overflow: 'visible', pointerEvents: 'none' }}>
        <div
          style={{ pointerEvents: 'auto' }}
          className="relative h-full flex items-center"
          onMouseEnter={() => onMouseEnter(payload.value, y)}
          onMouseLeave={onMouseLeave}
        >
          <div className="truncate text-xs cursor-pointer w-full pr-1">
            {payload.value}
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

export function TopEngagementPagesChart({ dateRange }: TopEngagementPagesChartProps) {
  const { data: gaStatus } = useGoogleAnalyticsStatus();
  const { data, isLoading, error } = useTopEngagementPages(dateRange);
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (page: string, y: number) => {
    setHoveredPage(page);
    setHoverPosition(y);
  };

  const handleMouseLeave = () => {
    setHoveredPage(null);
  };

  // Hide component if Google Analytics is not configured
  if (gaStatus && !gaStatus.isConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 Pages by Average Engagement Time</CardTitle>
            <CardDescription>Analysis of pages where users spend the most time</CardDescription>
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
            <CardTitle className="text-base">Top 10 Pages by Average Engagement Time</CardTitle>
            <CardDescription>Analysis of pages where users spend the most time</CardDescription>
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
            <CardTitle className="text-base">Top 10 Pages by Average Engagement Time</CardTitle>
            <CardDescription>Analysis of pages where users spend the most time</CardDescription>
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

  // Transform data for chart display
  const chartData = data.map((item) => ({
    page: item.page,
    time: item.averageEngagementTime,
  }));

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Pages by Average Engagement Time</CardTitle>
          <CardDescription>Analysis of pages where users spend the most time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative" ref={chartContainerRef}>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis type="number" />
                <YAxis
                  dataKey="page"
                  type="category"
                  width={100}
                  tick={(props) => (
                    <CustomYAxisTick
                      {...props}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    />
                  )}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="time" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
            {hoveredPage && (
              <div
                className="absolute left-0 bg-popover text-popover-foreground text-xs rounded border border-border p-2 whitespace-nowrap shadow-lg pointer-events-none"
                style={{
                  top: hoverPosition - 10,
                  zIndex: 9999,
                }}
              >
                {hoveredPage}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
