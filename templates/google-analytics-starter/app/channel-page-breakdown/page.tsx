'use client';

import { useState } from 'react';
import { ChannelPageViewChart } from './components/channel-page-view-chart';
import { DrillDownDetailsTable } from './components/drill-down-details-table';
import { GoogleAnalyticsSetupAlert } from '@/components/google-analytics-setup-alert';

export default function ChannelPageBreakdownPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>('__all__');
  const [limit, setLimit] = useState<number>(10);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Channel-wise Page View Breakdown Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze which pages receive traffic from each channel and drill down to view detailed information
        </p>
      </div>

      <GoogleAnalyticsSetupAlert />

      <div className="grid gap-6 lg:grid-cols-1">
        <ChannelPageViewChart
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
          limit={limit}
          onLimitChange={setLimit}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <DrillDownDetailsTable
          selectedChannel={selectedChannel}
          selectedPage="__all__"
          limit={limit}
        />
      </div>
    </div>
  );
}
