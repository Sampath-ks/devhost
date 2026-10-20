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