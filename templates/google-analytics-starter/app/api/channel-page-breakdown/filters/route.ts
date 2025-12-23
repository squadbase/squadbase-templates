import { NextResponse } from 'next/server';
import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/connections/google-analytics';

export async function GET() {
  const client = createGoogleAnalyticsClient();

  try {
    // Fetch all unique channels and pages without any filtering
    const [response] = await client.runReport({
      property: `properties/${getGAPropertyId()}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
        { name: 'pagePath' },
      ],
      metrics: [
        { name: 'screenPageViews' },
      ],
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit: 10000, // Get a large set to capture all unique values
    });

    const channelsSet = new Set<string>();
    const pagesSet = new Set<string>();

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const channel = dimensionValues[0]?.value || 'Unknown';
      const page = dimensionValues[1]?.value || 'Unknown';

      channelsSet.add(channel);
      pagesSet.add(page);
    });

    const channels = Array.from(channelsSet).sort();
    const pages = Array.from(pagesSet).sort();

    return NextResponse.json({
      channels,
      pages,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
