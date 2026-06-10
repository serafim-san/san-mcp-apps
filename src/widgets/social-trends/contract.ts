export type Story = {
  title: string;
  summary: string;
  bullish_sentiment_ratio: number;
  bearish_sentiment_ratio: number;
  score: number;
  query: string;
  related_tokens: string[];
};

export type TimePeriod = {
  datetime: string;
  top_stories: Story[];
};

export type TrendingStoriesData = {
  time_period: string;
  size?: number;
  period_start?: string;
  period_end?: string;
  total_time_periods: number;
  trending_stories: TimePeriod[];
};

export function parseTrendingStories(
  result: { structuredContent?: unknown } | null | undefined,
): TrendingStoriesData | null {
  if (!result) return null;

  const sc = result.structuredContent as
    | Partial<TrendingStoriesData>
    | undefined;
  if (!sc || typeof sc !== "object") return null;
  if (!Array.isArray(sc.trending_stories)) return null;

  return sc as TrendingStoriesData;
}
