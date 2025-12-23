import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/connections/google-analytics';

export interface EngagementMatrixRecord {
  page: string;
  pageViews: number;
  engagementRate: number;
}

export interface EngagementMatrixResponseBody {
  data: EngagementMatrixRecord[];
  rowCount: number;
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
      metrics: [
        { name: 'screenPageViews' },
        { name: 'engagementRate' },
      ],
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit: 50,
    });

    const data: EngagementMatrixRecord[] = [];

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const metricValues = row.metricValues || [];

      const pagePath = dimensionValues[0]?.value || 'Unknown';
      const pageViews = parseInt(metricValues[0]?.value || '0', 10);
      const engagementRate = Math.round(parseFloat(metricValues[1]?.value || '0') * 100);

      data.push({
        page: pagePath,
        pageViews,
        engagementRate,
      });
    });

    return Response.json({
      data,
      rowCount: data.length,
    } satisfies EngagementMatrixResponseBody);
  } catch (error) {
    console.error('Error fetching engagement matrix:', error);
    return Response.json(
      { error: 'Failed to fetch engagement matrix data' },
      { status: 500 }
    );
  }
}
