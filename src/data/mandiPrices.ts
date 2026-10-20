// mandiPrices.ts
import type { MandiCropPrices, MandiPricePoint } from '@/types'
import { CROPS } from './crops'

export interface MandiRecord {
  crop: string
  market: string
  pricePerKg: number // ₹/kg
  date: string // YYYY-MM-DD
}

// SAMPLE DATA ONLY: replace with the real mandi API later
const BASE_PRICE: Record<string, number> = {
  Tomato: 25,
  Onion: 19,
  Potato: 22,
  Banana: 34,
  Rice: 42,
  Brinjal: 28,
  Cabbage: 16,
  Carrot: 38,
  Mango: 65,
}

const MARKET_FACTOR: Record<string, number> = {
  Mangaluru: 1.0,
  Udupi: 0.97,
  Bengaluru: 1.06,
  Mysuru: 0.95,
  Hubballi: 0.92,
}

const DAYS = [
  { date: '2026-10-19', factor: 1.0 },
  { date: '2026-10-18', factor: 0.98 },
  { date: '2026-10-17', factor: 1.02 },
]

const round = (n: number) => Math.round(n * 2) / 2

export const mandiPrices: MandiRecord[] = Object.entries(BASE_PRICE).flatMap(([crop, base]) =>
  Object.entries(MARKET_FACTOR).flatMap(([market, mf]) =>
    DAYS.map((d) => ({
      crop,
      market,
      pricePerKg: round(base * mf * d.factor),
      date: d.date,
    }))
  )
)

export const MARKETS = Object.keys(MARKET_FACTOR)

// Seeded pseudo-random number generator (Mulberry32) for reproducible, stable data
function createSeededRandom(seed: number) {
  let s = seed
  return function () {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const END_DATE_MS = Date.parse('2026-10-20T00:00:00Z')
const DAY_MS = 86_400_000

function generateSeriesForCrop(
  basePrice: number,
  daysCount: number,
  offsetDays: number,
  seed: number
): MandiPricePoint[] {
  const rng = createSeededRandom(seed)
  const points: MandiPricePoint[] = []

  let price = basePrice * (0.92 + rng() * 0.16)

  for (let i = daysCount - 1; i >= 0; i--) {
    const t = END_DATE_MS - (i + offsetDays) * DAY_MS
    const dateStr = new Date(t).toISOString().slice(0, 10)

    // Gradual random walk with mean reversion to basePrice
    const drift = (basePrice - price) * 0.04
    const shock = (rng() - 0.49) * (basePrice * 0.06)
    price = Math.max(basePrice * 0.65, Math.min(basePrice * 1.45, price + drift + shock))

    const modal = Math.round(price)
    const spread = Math.max(2, Math.round(modal * (0.05 + rng() * 0.05)))
    const min = modal - spread
    const max = modal + spread

    points.push({
      date: dateStr,
      modalPrice: modal,
      minPrice: min,
      maxPrice: max,
    })
  }

  return points
}

export const MANDI_PRICES: Record<string, MandiCropPrices> = {}

CROPS.forEach((crop, index) => {
  const seed1 = 1000 + index * 97
  const seed2 = 5000 + index * 83

  const currentSeries = generateSeriesForCrop(crop.basePrice, 90, 0, seed1)
  const previousSeries = generateSeriesForCrop(crop.basePrice * 0.96, 90, 90, seed2)

  const latestModal = currentSeries[currentSeries.length - 1].modalPrice
  const minSuggested = Math.round(latestModal * 0.9)
  const maxSuggested = Math.round(latestModal * 1.15)

  MANDI_PRICES[crop.id] = {
    cropId: crop.id,
    currentModalPrice: latestModal,
    minSuggestedPrice: minSuggested,
    maxSuggestedPrice: maxSuggested,
    series: currentSeries,
    previousPeriodSeries: previousSeries,
  }
})

export function getMandiPricesForCrop(cropId: string): MandiCropPrices {
  return (
    MANDI_PRICES[cropId] || {
      cropId,
      currentModalPrice: 30,
      minSuggestedPrice: 25,
      maxSuggestedPrice: 35,
      series: [],
      previousPeriodSeries: [],
    }
  )
}

export default MANDI_PRICES
