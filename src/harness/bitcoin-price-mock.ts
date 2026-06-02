import type { BitcoinPriceData, Candle } from '../widgets/bitcoin-price/contract'

function generateSeries(): Candle[] {
  const now = Math.floor(Date.now() / 1000)
  const HOUR = 3600
  const candles: Candle[] = []
  let price = 64000

  for (let i = 168; i >= 0; i--) {
    const time = now - i * HOUR
    const drift = (Math.random() - 0.45) * 400
    const open = price
    const close = Math.max(45000, open + drift)
    const high = Math.max(open, close) + Math.random() * 250
    const low = Math.min(open, close) - Math.random() * 250
    candles.push({ time, open, high, low, close })
    price = close
  }

  return candles
}

const series = generateSeries()
const last = series[series.length - 1].close
const dayAgo = series[series.length - 25]?.close ?? series[0].close
const weekAgo = series[0].close
const day = series.slice(-25)

export const BITCOIN_MOCK: BitcoinPriceData = {
  symbol: 'BTC',
  resolution: '1h',
  summary: {
    current_price: last,
    change_24h_pct: ((last - dayAgo) / dayAgo) * 100,
    change_7d_pct: ((last - weekAgo) / weekAgo) * 100,
    high_24h: Math.max(...day.map((c) => c.high)),
    low_24h: Math.min(...day.map((c) => c.low)),
  },
  series,
}
