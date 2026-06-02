<script lang="ts">
  import { onMount } from 'svelte'
  import {
    App,
    applyDocumentTheme,
    applyHostFonts,
    applyHostStyleVariables,
    type McpUiHostContext,
  } from '@modelcontextprotocol/ext-apps'
  import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
  import BtcChart from './BtcChart.svelte'
  import type { BitcoinPriceData, Candle } from './contract'

  let hostContext = $state<McpUiHostContext | undefined>()

  let symbol = $state('BTC')
  let resolution = $state('')
  let summary = $state<BitcoinPriceData['summary'] | null>(null)
  let series = $state<Candle[]>([])
  let loading = $state(true)

  $effect(() => {
    if (hostContext?.theme) applyDocumentTheme(hostContext.theme)
    if (hostContext?.styles?.variables) applyHostStyleVariables(hostContext.styles.variables)
    if (hostContext?.styles?.css?.fonts) applyHostFonts(hostContext.styles.css.fonts)
  })

  function ingest(result: CallToolResult) {
    const data = result.structuredContent as BitcoinPriceData | undefined
    if (!data) return
    symbol = data.symbol
    resolution = data.resolution
    summary = data.summary
    series = Array.isArray(data.series) ? data.series : []
    loading = false
  }

  onMount(async () => {
    const instance = new App(
      { name: 'santiment-bitcoin-price', version: '1.0.0' },
      { availableDisplayModes: ['inline'] },
    )

    instance.ontoolresult = ingest
    instance.onerror = console.error
    instance.onhostcontextchanged = (params) => {
      hostContext = { ...hostContext, ...params }
    }

    await instance.connect()
    hostContext = instance.getHostContext()
    loading = false
  })

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
</script>

<div class="night-mode bg-white p-4">
  <header class="flex items-center gap-3 mb-3">
    <h2 class="text-base font-semibold text-rhino">📊 {symbol} Price</h2>
    {#if resolution}
      <span class="text-xs font-medium bg-green px-2 py-0.5 rounded text-white-day">{resolution}</span>
    {/if}
  </header>

  {#if loading}
    <p class="text-center py-10 text-sm text-waterloo">Loading…</p>
  {:else if !summary || series.length === 0}
    <p class="text-center py-8 text-sm text-waterloo">No price data available.</p>
  {:else}
    <div class="flex items-baseline gap-3 mb-3">
      <span class="text-2xl font-semibold text-rhino">${fmt(summary.current_price)}</span>
      <span class="text-sm font-medium {summary.change_24h_pct >= 0 ? 'text-lima' : 'text-red'}">
        {fmtPct(summary.change_24h_pct)} 24h
      </span>
      <span class="text-sm font-medium {summary.change_7d_pct >= 0 ? 'text-lima' : 'text-red'}">
        {fmtPct(summary.change_7d_pct)} 7d
      </span>
    </div>

    <BtcChart data={series} themeKey={hostContext?.theme} />

    <footer class="flex gap-4 mt-2 text-xs text-waterloo">
      <span>24h high: ${fmt(summary.high_24h)}</span>
      <span>24h low: ${fmt(summary.low_24h)}</span>
    </footer>
  {/if}
</div>
