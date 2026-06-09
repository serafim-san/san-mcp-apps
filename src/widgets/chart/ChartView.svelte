<script lang="ts">
  import Chart, { RawSeries, Tooltip } from "san-webkit-next/ui/app/Chart";
  import { noop } from "rxjs";
  import {
    useChartCtx,
    useChartGlobalParametersCtx,
    useChartPanesCtx,
    useMetricSeriesCtx,
  } from "san-webkit-next/ui/app/Chart/ctx";
  import { useUiCtx } from "san-webkit-next/ctx/ui";
  import type { TInterval } from "san-webkit-next/ui/app/Chart/api";
  import type { TAssetSlug } from "san-webkit-next/ctx/assets";

  import type { ChartData } from "./contract";
  import { toMetricConfig } from "./series-spec";

  type TProps = {
    data: ChartData;
    isNightMode: boolean;
  };
  const { data, isNightMode }: TProps = $props();

  useUiCtx.set({ isNightMode });
  useChartCtx.set();
  useChartPanesCtx.set();
  useChartGlobalParametersCtx.set({
    from: data.period_start,
    to: data.period_end,
    interval: data.interval as TInterval,
    selector: { slug: data.slug as TAssetSlug },
    includeIncompleteData: false,
  });

  const { metricSeries } = useMetricSeriesCtx.set(
    data.series.map((s) => toMetricConfig(s, data.slug)),
  );
</script>

<div class="w-full h-[400px]">
  <Chart
    class="h-full w-full"
    onRangeSelectChange={noop}
    onRangeSelectEnd={noop}
    options={{ timeScale: { timeVisible: true, secondsVisible: false } }}
  >
    {#snippet children()}
      {#each metricSeries.$ as series (series.id)}
        <RawSeries {series} />
      {/each}
      <Tooltip />
    {/snippet}
  </Chart>
</div>
