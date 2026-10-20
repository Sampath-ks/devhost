import { mandiPrices } from '@/data/mandiPrices'
import type { QualityGrade } from '@/lib/produceTypes'

export type Comparison = 'above' | 'within' | 'below'

export interface PriceSuggestion {
  benchmark: number
  rangeLow: number
  rangeHigh: number
  askingPrice: number
  comparison: Comparison
  diffPercent: number // asking vs benchmark
  source: string
  lastUpdated: string
  isLive: boolean
  recordsUsed: number
}

const GRADE_FACTOR: Record<QualityGrade, number> = { A: 1.05, B: 1.0, C: 0.92 }

function median(nums: number[]) {
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// Swap this function's body for a real mandi API call later
export function getPriceSuggestion(params: {
  crop: string
  market: string
  askingPrice: number
  grade?: QualityGrade
}): PriceSuggestion | null {
  const { crop, market, askingPrice, grade } = params

  const records = mandiPrices.filter(
    (r) => r.crop.toLowerCase() === crop.trim().toLowerCase() && r.market === market
  )
  if (records.length === 0) return null

  const gradeFactor = grade ? GRADE_FACTOR[grade] : 1
  const benchmark = Math.round(median(records.map((r) => r.pricePerKg)) * gradeFactor * 10) / 10
  const rangeLow = Math.round(benchmark * 0.92)
  const rangeHigh = Math.round(benchmark * 1.08)

  const comparison: Comparison =
    askingPrice > rangeHigh ? 'above' : askingPrice < rangeLow ? 'below' : 'within'

  return {
    benchmark,
    rangeLow,
    rangeHigh,
    askingPrice,
    comparison,
    diffPercent: Math.round(((askingPrice - benchmark) / benchmark) * 100),
    source: 'Sample mandi data (mock)',
    lastUpdated: records.map((r) => r.date).sort().at(-1)!,
    isLive: false,
    recordsUsed: records.length,
  }
}