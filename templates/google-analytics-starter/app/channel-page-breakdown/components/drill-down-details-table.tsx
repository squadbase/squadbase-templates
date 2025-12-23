'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDrillDownDetails } from '@/hooks/channel-page-breakdown/use-drill-down-details';
import { useGoogleAnalyticsStatus } from '@/hooks/use-google-analytics-status';

interface DrillDownDetailsTableProps {
  selectedChannel: string;
  selectedPage: string;
  limit?: number;
}

export function DrillDownDetailsTable({
  selectedChannel,
  selectedPage,
  limit = 50,
}: DrillDownDetailsTableProps) {
  const { data: gaStatus } = useGoogleAnalyticsStatus();
  const { data, isLoading, error } = useDrillDownDetails(selectedChannel, selectedPage, limit);

  // Hide component if Google Analytics is not configured
  if (gaStatus && !gaStatus.isConfigured) {
    return null;
  }

  if (isLoading) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drill-Down Details</CardTitle>
            <CardDescription>
              Detailed page view analysis for the selected channel/page
            </CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drill-Down Details</CardTitle>
            <CardDescription>
              Detailed page view analysis for the selected channel/page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-red-500">
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
            <CardTitle className="text-base">Drill-Down Details</CardTitle>
            <CardDescription>
              Detailed page view analysis for the selected channel/page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>No detailed data available</p>
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
          <CardTitle className="text-base">Drill-Down Details</CardTitle>
          <CardDescription>
            Detailed page view analysis for the selected channel/page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Implement data table with pagination and sorting */}
          {/* TODO: Display channel, page, pageviews, unique users, bounce rate columns */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Page Views</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right">Avg Session Time</TableHead>
                  <TableHead className="text-right">Bounce Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.channel}</TableCell>
                    <TableCell>{row.page}</TableCell>
                    <TableCell className="text-right">{row.pageviews}</TableCell>
                    <TableCell className="text-right">{row.uniqueUsers}</TableCell>
                    <TableCell className="text-right">{row.avgSessionTime?.toFixed(1)}s</TableCell>
                    <TableCell className="text-right">{row.bounceRate?.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
