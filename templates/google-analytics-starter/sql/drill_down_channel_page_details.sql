/**
 * Drill Down Channel Page Details
 *
 * Database Engine:
 *   Google Analytics
 *
 * Description:
 *   Detailed breakdown of page view performance metrics including
 *   engagement time and bounce rate for drill-down analysis.
 *   Filters by specific channel and page combinations.
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
 *   avg_session_time (number) - Average session duration in seconds
 *   bounce_rate (number) - Percentage of bounces
 */
SELECT
  channel,
  page,
  COUNT(*) as pageviews,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(session_duration) as avg_session_time,
  (COUNT(CASE WHEN bounced = true THEN 1 END) * 100.0 / COUNT(*)) as bounce_rate
FROM analytics_events
WHERE
  ({{ channel IS NULL }} OR channel = {{ channel }})
  AND ({{ page IS NULL }} OR page = {{ page }})
GROUP BY
  channel,
  page
ORDER BY
  channel,
  pageviews DESC
LIMIT 100;
