import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/google-analytics';

export interface ReturningUsersRecord {
  page: string;
  returningUserCount: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '30daysAgo';
  const endDate = searchParams.get('endDate') || 'today';

  const client = createGoogleAnalyticsClient();

  try {
    // returningUsers metric doesn't exist, so we calculate it as totalUsers - newUsers
    const [response] = await client.runReport({
      property: `properties/${getGAPropertyId()}`,
      dateRanges: [
        {
          startDate,
          endDate,
        },
      ],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'totalUsers' }, { name: 'newUsers' }],
      limit: 100,
    });

    const data: ReturningUsersRecord[] = [];

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const metricValues = row.metricValues || [];

      const pagePath = dimensionValues[0]?.value || 'Unknown';
      const totalUsers = parseInt(metricValues[0]?.value || '0', 10);
      const newUsers = parseInt(metricValues[1]?.value || '0', 10);
      const returningUserCount = totalUsers - newUsers;

      if (returningUserCount > 0) {
        data.push({
          page: pagePath,
          returningUserCount,
        });
      }
    });

    // Sort by returning user count descending and take top 10
    data.sort((a, b) => b.returningUserCount - a.returningUserCount);
    const top10 = data.slice(0, 10);

    return Response.json(top10);
  } catch (error) {
    console.error('Error fetching returning users:', error);
    return Response.json(
      { error: 'Failed to fetch returning users data' },
      { status: 500 }
    );
  }
}
