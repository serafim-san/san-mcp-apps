<script lang="ts">
  import { onMount } from 'svelte'
  import {
    createChart,
    CandlestickSeries,
    ColorType,
    type IChartApi,
    type ISeriesApi,
    type UTCTimestamp,
  } from '@santiment-network/chart-next'
  import type { Candle } from './contract'

  type Props = { data: Candle[]; themeKey?: unknown }
  const { data, themeKey }: Props = $props()

  let container: HTMLDivElement
  let chart: IChartApi | null = null
  let series: ISeriesApi<'Candlestick'> | null = null

  function resolveTextColor(): string {
    const cs = getComputedStyle(container)
    const v = cs.getPropertyValue('--color-text-primary').trim()
    if (v) return v
    // Tolerable on both light and dark backgrounds.
    return '#94a3b8'
  }

  onMount(() => {
    const textColor = resolveTextColor()

    chart = createChart(container, {
      width: container.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(150,150,150,0.15)' },
        horzLines: { color: 'rgba(150,150,150,0.15)' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: false },
      crosshair: { mode: 1 },
    })

    series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    // Resize chart when container resizes (e.g. iframe size changes).
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      chart?.applyOptions({ width: Math.floor(width) })
    })
    ro.observe(container)

    return () => {
      ro.disconnect()
      chart?.remove()
      chart = null
      series = null
    }
  })

  $effect(() => {
    if (!series || !data?.length) return
    series.setData(
      data.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    )
    chart?.timeScale().fitContent()
  })

  // Re-resolve text color when the host theme changes (themeKey re-triggers $effect).
  $effect(() => {
    void themeKey
    if (!chart || !container) return
    chart.applyOptions({ layout: { textColor: resolveTextColor() } })
  })
</script>

<div bind:this={container} class="w-full h-[300px]"></div>
