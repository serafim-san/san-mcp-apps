/**
 * Contract for the Chart MCP App widget.
 *
 * Mirrored on the Elixir side (`lib/sanbase/mcp/show_chart_tool.ex`).
 * Any change here must be reflected there.
 *
 * `time` is a UNIX timestamp in **seconds** (the format `lightweight-charts`
 * uses natively for `UTCTimestamp`).
 */

import type { TChartMetric } from "san-webkit-next/ctx/metrics-registry/types";

export type SeriesStyle = "candles" | "line" | "area" | "histogram";
export type Unit = NonNullable<TChartMetric["unit"]>;
export type SeriesId = "primary" | "overlay";

export type CandlePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type ValuePoint = {
  time: number;
  value: number | null;
};

export type ChartSeries = {
  id: SeriesId;
  name: string;
  label: string;
  style: SeriesStyle;
  color: string;
  pane: number;
  unit: Unit;
  data: CandlePoint[] | ValuePoint[];
};

export type SeriesSummary = {
  label: string;
  unit: Unit;
  current: number | null;
  change_pct: number;
};

export type ChartData = {
  slug: string;
  range: string;
  interval: string;
  period_start: string;
  period_end: string;
  summary: {
    primary: SeriesSummary | null;
    overlay: SeriesSummary | null;
  };
  series: ChartSeries[];
  warning?: string;
};

export interface GenericToolResult {
  structuredContent?: unknown;
  [key: string]: any;
}

export function parseChartData(
  result: GenericToolResult | null | undefined,
): ChartData | null {
  if (!result || typeof result !== "object") return null;

  const sc = result.structuredContent as Partial<ChartData> | undefined;
  if (!sc || typeof sc !== "object") return null;
  if (typeof sc.slug !== "string" || !Array.isArray(sc.series)) return null;

  return sc as ChartData;
}
