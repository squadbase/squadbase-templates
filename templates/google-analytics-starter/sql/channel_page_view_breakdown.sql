/**
 * Channel Page View Breakdown
 *
 * Database Engine:
 *   Google Analytics
 *
 * Description:
 *   Analyze page views distributed across different channels and pages.
 *   Supports filtering by specific channel or page for drill-down analysis.
 *   Returns aggregated metrics including pageviews and unique user counts.
 *
 * Data Source:
 *   Google Analytics via API - Sessions and events data
 *
 * Parameters:
 *   $channel (string) - Optional filter for specific channel (null for all)
 *   $page (string) - Optional filter for specific page (null for all)
 *
 * Returns:
 *   channel (string) - Traffic channel name
 *   page (string) - Page path/URL
 *   pageviews (number) - Total page view count
 *   unique_users (number) - Count of unique users
 */
SELECT
  channel,
  page,
  COUNT(*) as pageviews,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE
  ({{ channel IS NULL }} OR channel = {{ channel }})
  AND ({{ page IS NULL }} OR page = {{ page }})
GROUP BY
  channel,
  page
ORDER BY
  channel,
  pageviews DESC;
