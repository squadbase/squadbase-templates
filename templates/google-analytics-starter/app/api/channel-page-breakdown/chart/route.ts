import { NextRequest, NextResponse } from 'next/server';
import { createGoogleAnalyticsClient, getGAPropertyId } from '@/lib/connections/google-analytics';

export type ChannelPageViewData = {
  name: string;
  channel: string;
  page: string;
  pageviews: number;
  uniqueUsers: number;
};

export async function GET(request: NextRequest) {
  const client = createGoogleAnalyticsClient();

  try {
    const searchParams = request.nextUrl.searchParams;
    const selectedChannel = searchParams.get('channel');
    const selectedPage = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Build dimension and filter conditions for GA report
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

    const data: ChannelPageViewData[] = [];
    const channelsSet = new Set<string>();
    const pagesSet = new Set<string>();

    response.rows?.forEach((row) => {
      const dimensionValues = row.dimensionValues || [];
      const metricValues = row.metricValues || [];

      const channel = dimensionValues[0]?.value || 'Unknown';
      const page = dimensionValues[1]?.value || 'Unknown';
      const pageviews = parseInt(metricValues[0]?.value || '0', 10);
      const uniqueUsers = parseInt(metricValues[1]?.value || '0', 10);

      data.push({
        name: `${channel} - ${page}`,
        channel,
        page,
        pageviews,
        uniqueUsers,
      });

      channelsSet.add(channel);
      pagesSet.add(page);
    });

    // Extract unique channels and pages for filter dropdowns
    const channels = Array.from(channelsSet).sort();
    const pages = Array.from(pagesSet).sort();

    return NextResponse.json({
      data,
      channels,
      pages,
    });
  } catch (error) {
    console.error('Error fetching channel page view data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channel page view data' },
      { status: 500 }
    );
  }
}
