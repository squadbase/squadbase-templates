import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/connections/google-analytics';

export interface PageDwellTimeData {
  channel: string;
  page: string;
  averageEngagementTime: number;
  userCount: number;
  engagementRate: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel');

  const client = createGoogleAnalyticsClient();

  try {
    const dimensions = channel === '__all__' || !channel
      ? [{ name: 'sessionDefaultChannelGroup' }, { name: 'pagePath' }]
      : [{ name: 'pagePath' }];

    const filterExpressions = channel && channel !== '__all__'
      ? {
          filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: {
              matchType: 'EXACT' as const,
              value: channel,
            },
          },
        }
      : undefined;

    const [response] = await client.runReport({
      property: `properties/${getGAPropertyId()}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions,
      metrics: [
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' },
        { name: 'activeUsers' },
      ],
      dimensionFilter: filterExpressions,
      orderBys: [
        {
          metric: { metricName: 'activeUsers' },
          desc: true,
        },
      ],
      limit: 50,
    });

    const data: PageDwellTimeData[] = [];

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const metricValues = row.metricValues || [];

      const channelName = channel === '__all__' || !channel
        ? dimensionValues[0]?.value || 'Unknown'
        : channel;
      const pagePath = channel === '__all__' || !channel
        ? dimensionValues[1]?.value || 'Unknown'
        : dimensionValues[0]?.value || 'Unknown';

      const engagementRate = parseFloat(metricValues[0]?.value || '0') * 100;
      const sessionDuration = parseFloat(metricValues[1]?.value || '0');
      const userCount = parseInt(metricValues[2]?.value || '0', 10);

      data.push({
        channel: channelName,
        page: pagePath,
        averageEngagementTime: sessionDuration,
        userCount,
        engagementRate,
      });
    });

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching page dwell time:', error);
    return Response.json(
      { error: 'Failed to fetch page dwell time data' },
      { status: 500 }
    );
  }
}
