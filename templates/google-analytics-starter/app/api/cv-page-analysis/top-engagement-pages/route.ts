import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/connections/google-analytics';

export interface TopEngagementPageData {
  page: string;
  averageEngagementTime: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '30daysAgo';
  const endDate = searchParams.get('endDate') || 'today';

  const client = createGoogleAnalyticsClient();

  try {
    const [response] = await client.runReport({
      property: `properties/${getGAPropertyId()}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'averageSessionDuration' }, { name: 'activeUsers' }],
      orderBys: [
        {
          metric: { metricName: 'averageSessionDuration' },
          desc: true,
        },
      ],
      limit: 10,
    });

    const data: TopEngagementPageData[] = [];

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const metricValues = row.metricValues || [];

      const pagePath = dimensionValues[0]?.value || 'Unknown';
      const sessionDuration = parseFloat(metricValues[0]?.value || '0');

      data.push({
        page: pagePath,
        averageEngagementTime: sessionDuration,
      });
    });

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching top engagement pages:', error);
    return Response.json(
      { error: 'Failed to fetch top engagement pages data' },
      { status: 500 }
    );
  }
}
