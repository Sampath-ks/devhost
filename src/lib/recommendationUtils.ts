import type { ProduceListing, QualityGrade } from '@/lib/produceTypes'

export type WeightUnit = 'g' | 'kg' | 'quintal' | 'tonne'

export interface UnitConfig {
  label: string
  symbol: string
  toKg: number
  step: number
  quickPresets: number[]
}

export const UNIT_CONFIGS: Record<WeightUnit, UnitConfig> = {
  g: {
    label: 'Grams (g)',
    symbol: 'g',
    toKg: 0.001,
    step: 10,
    quickPresets: [50, 100, 200, 500, 1000],
  },
  kg: {
    label: 'Kilograms (kg)',
    symbol: 'kg',
    toKg: 1,
    step: 1,
    quickPresets: [5, 10, 25, 50, 100, 200],
  },
  quintal: {
    label: 'Quintals (q = 100kg)',
    symbol: 'q',
    toKg: 100,
    step: 0.5,
    quickPresets: [1, 2, 5, 10],
  },
  tonne: {
    label: 'Metric Tonnes (t = 1000kg)',
    symbol: 't',
    toKg: 1000,
    step: 0.1,
    quickPresets: [0.5, 1, 2, 5],
  },
}

export const CROP_IMAGES: Record<string, string> = {
  banana: '/assets/images/crops/banana.png',
  brinjal: '/assets/images/crops/brinjal.png',
  carrot: '/assets/images/crops/carrot.png',
  chilli: '/assets/images/crops/chilli.png',
  coconut: '/assets/images/crops/coconut.png',
  mango: '/assets/images/crops/mango.png',
  onion: '/assets/images/crops/onion.png',
  potato: '/assets/images/crops/potato.png',
  rice: '/assets/images/crops/rice.png',
  tomato: '/assets/images/crops/tomato.png',
}

export const gradeStyles: Record<QualityGrade, { badge: string; text: string }> = {
  A: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', text: 'Grade A (Premium)' },
  B: { badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', text: 'Grade B (Standard)' },
  C: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', text: 'Grade C (Commercial)' },
}

// Friendly farmer profile map
const FARMER_NAMES: Record<string, { name: string; farm: string }> = {
  'hiragkulal877@gmail.com': { name: 'Hirag Kulal', farm: 'Coastal Agro Farm' },
  'rajesh.kumar@greenvalley.in': { name: 'Rajesh Kumar', farm: 'Green Valley Organics' },
  'basavaraj.m@mysurufresh.com': { name: 'Basavaraj M', farm: 'Mysuru Agro Fields' },
  'savita.patil@belagaviorganics.in': { name: 'Savita Patil', farm: 'Belagavi Greens' },
  'ramesh.patil@karnatakaagri.org': { name: 'Ramesh Patil', farm: 'Hassan Farm Cluster' },
  'anita.shetty@coastalagri.in': { name: 'Anita Shetty', farm: 'Coastal Agri Estate' },
  'devadas.gowda@mandyafarms.com': { name: 'Devadas Gowda', farm: 'Mandya Sugarcane & Crops' },
  'suresh.naik@hublifresh.in': { name: 'Suresh Naik', farm: 'Hubli Harvest Farms' },
}

export function getFarmerDisplayName(farmerId: string): { name: string; farm: string } {
  if (FARMER_NAMES[farmerId]) return FARMER_NAMES[farmerId]
  const clean = (farmerId || '').split('@')[0].replace(/[._0-9]/g, ' ').trim()
  const capitalized = clean
    ? clean
        .split(' ')
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
    : farmerId || 'Verified Farmer'
  return { name: capitalized || farmerId || 'Verified Farmer', farm: 'Local Farm' }
}

export function formatUnitAmount(amountKg: number, unit: WeightUnit): string {
  const config = UNIT_CONFIGS[unit]
  const val = amountKg / config.toKg
  if (unit === 'g') {
    return `${Math.round(val).toLocaleString()} g`
  }
  if (val >= 10) {
    return `${Math.round(val * 10) / 10} ${config.symbol}`
  }
  return `${Number(val.toFixed(2))} ${config.symbol}`
}

export type RecommendationStrategy = 'cheapest' | 'highest_grade' | 'fewest_farmers'

export interface RecommendedFarmerItem {
  listing: ProduceListing
  farmerId: string
  farmerName: string
  farmName: string
  availableKg: number
  allocatedKg: number
  allocatedInUnit: number
  pricePerKg: number
  itemTotal: number
  percentOfTotal: number
}

export interface RecommendationResult {
  status: 'exact_match' | 'partial_alternative' | 'no_stock' | 'invalid_input'
  cropName: string
  targetKg: number
  totalAvailableKg: number
  totalAllocatedKg: number
  totalPrice: number
  effectiveAvgPricePerKg: number
  shortfallKg: number
  items: RecommendedFarmerItem[]
  farmerCount: number
}
