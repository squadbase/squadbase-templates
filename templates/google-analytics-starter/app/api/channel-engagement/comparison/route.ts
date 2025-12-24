import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/google-analytics';

export interface ChannelEngagementComparison {
  channel: string;
  averageSessionDuration: number;
  engagementRate: number;
  activeUsers: number;
  totalSessions: number;
}

export async function GET() {
  const client = createGoogleAnalyticsClient();

  try {
    const [response] = await client.runReport({
      property: `properties/${getGAPropertyId()}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'averageSessionDuration' },
        { name: 'engagementRate' },
        { name: 'activeUsers' },
        { name: 'sessions' },
      ],
    });

    const data: ChannelEngagementComparison[] = [];

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const metricValues = row.metricValues || [];

      const channel = dimensionValues[0]?.value || 'Unknown';
      const avgSessionDuration = parseFloat(metricValues[0]?.value || '0');
      const engagementRate = parseFloat(metricValues[1]?.value || '0') * 100;
      const activeUsers = parseInt(metricValues[2]?.value || '0', 10);
      const sessions = parseInt(metricValues[3]?.value || '0', 10);

      data.push({
        channel,
        averageSessionDuration: avgSessionDuration,
        engagementRate,
        activeUsers,
        totalSessions: sessions,
      });
    });

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching channel engagement comparison:', error);
    return Response.json(
      { error: 'Failed to fetch engagement comparison data' },
      { status: 500 }
    );
  }
}
