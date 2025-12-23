'use client';

import { useState } from 'react';
import { PageDwellTimeChart } from './components/page-dwell-time-chart';
import { ChannelEngagementTable } from './components/channel-engagement-table';
import { GoogleAnalyticsSetupAlert } from '@/components/google-analytics-setup-alert';

export default function ChannelEngagementPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>('__all__');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Channel × Page × Engagement Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Analyze which pages users are spending time on by channel
        </p>
      </div>

      <GoogleAnalyticsSetupAlert />

      <div className="bg-card rounded-lg border p-4">
        <label className="block text-sm font-medium mb-2">Select Channel</label>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="w-full md:w-60 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="__all__">All Channels</option>
          <option value="Direct">Direct</option>
          <option value="Organic Search">Organic Search</option>
          <option value="Referral">Referral</option>
          <option value="Organic Social">Social Media</option>
          <option value="Paid Search">Paid Search</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <PageDwellTimeChart channel={selectedChannel} />
        <ChannelEngagementTable />
      </div>
    </div>
  );
}
