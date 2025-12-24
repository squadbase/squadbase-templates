import { NextRequest, NextResponse } from 'next/server';
import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/google-analytics';

export type DrillDownDetailData = {
  channel: string;
  page: string;
  pageviews: number;
  uniqueUsers: number;
  avgSessionTime?: number;
  bounceRate?: number;
};

export async function GET(request: NextRequest) {
  const client = createGoogleAnalyticsClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const selectedChannel = searchParams.get('channel');
    const selectedPage = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Build dimension filters for GA report
    const dimensionFilter = {
      andGroup: {
        expressions: [
          ...(selectedChannel && selectedChannel !== '__all__'
            ? [
                {
                  filter: {
                    fieldName: 'sessionDefaultChannelGroup',
                    stringFilter: {
                      matchType: 1, // EXACT
                      value: selectedChannel,
                      caseSensitive: false,
                    },
                  },
                },
              ]
            : []),
          ...(selectedPage && selectedPage !== '__all__'
            ? [
                {
                  filter: {
                    fieldName: 'pagePath',
                    stringFilter: {
                      matchType: 1, // EXACT
                      value: selectedPage,
                      caseSensitive: false,
                    },
                  },
                },
              ]
            : []),
        ],
      },
    };

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
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      ...(selectedChannel || selectedPage
        ? {
            dimensionFilter:
              dimensionFilter.andGroup.expressions.length > 0
                ? dimensionFilter
                : undefined,
          }
        : {}),
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true,
        },
      ],
      limit: limit,
    });

    const data: DrillDownDetailData[] = [];

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const metricValues = row.metricValues || [];

      const channel = dimensionValues[0]?.value || 'Unknown';
      const page = dimensionValues[1]?.value || 'Unknown';
      const pageviews = parseInt(metricValues[0]?.value || '0', 10);
      const uniqueUsers = parseInt(metricValues[1]?.value || '0', 10);
      const avgSessionTime = parseFloat(metricValues[2]?.value || '0');
      const bounceRate = parseFloat(metricValues[3]?.value || '0') * 100;

      data.push({
        channel,
        page,
        pageviews,
        uniqueUsers,
        avgSessionTime,
        bounceRate,
      });
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching drill-down details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drill-down details' },
      { status: 500 }
    );
  }
}
