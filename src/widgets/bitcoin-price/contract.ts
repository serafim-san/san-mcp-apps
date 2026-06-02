/**
 * Contract for the Bitcoin Price MCP App widget.
 *
 * Mirrored on the Elixir side (`lib/sanbase/mcp/bitcoin_price_tool.ex`).
 * Any change here must be reflected there.
 *
 * `time` is a UNIX timestamp in **seconds** (the format `lightweight-charts`
 * uses natively for `UTCTimestamp`).
 */

export type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
}

export type PriceSummary = {
  current_price: number
  change_24h_pct: number
  change_7d_pct: number
  high_24h: number
  low_24h: number
}

export type BitcoinPriceData = {
  symbol: string
  resolution: string
  summary: PriceSummary
  series: Candle[]
}
