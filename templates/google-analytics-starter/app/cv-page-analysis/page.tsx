'use client';

import { useState } from 'react';
import { TopEngagementPagesChart } from './components/top-engagement-pages-chart';
import { ReturningUsersChart } from './components/returning-users-chart';
import { EngagementMatrixChart } from './components/engagement-matrix-chart';
import { GoogleAnalyticsSetupAlert } from '@/components/google-analytics-setup-alert';

export default function CVPageAnalysisPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CV Page Engagement Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze CV page effectiveness based on user engagement metrics
        </p>
      </div>

      <GoogleAnalyticsSetupAlert />

      <div className="bg-card rounded-lg border p-4 space-y-3">
        <label className="block text-sm font-medium">Select Date Range</label>
        <div className="grid gap-4 md:grid-cols-2 max-w-md">
          <div>
            <label className="text-xs text-muted-foreground">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopEngagementPagesChart dateRange={dateRange} />
        <ReturningUsersChart dateRange={dateRange} />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <EngagementMatrixChart dateRange={dateRange} />
      </div>
    </div>
  );
}
