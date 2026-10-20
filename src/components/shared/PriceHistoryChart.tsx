// PriceHistoryChart.tsx
import { useMemo } from 'react'
import MetricCard, { type MetricPoint, type MetricEvent } from '@/components/kokonut/revenue_chart'
import { getMandiPricesForCrop } from '@/data/mandiPrices'
import { CROPS } from '@/data/crops'
import type { Crop } from '@/types'

export interface PriceHistoryChartProps {
  cropId?: string
  crop?: Crop
  label?: string
  segments?: string[]
  data?: MetricPoint[]
  events?: MetricEvent[]
  periods?: number[]
  defaultPeriod?: number
  format?: 'currency' | 'number'
  currency?: string
  className?: string
}

export default function PriceHistoryChart({
  cropId = 'crop-tomato',
  crop,
  label,
  segments,
  data,
  events,
  periods = [7, 30, 90],
  defaultPeriod = 30,
  format = 'currency',
  currency = 'INR',
  className,
}: PriceHistoryChartProps) {
  const activeCrop = crop ?? CROPS.find((c) => c.id === cropId) ?? CROPS[0]
  const mandiData = useMemo(() => getMandiPricesForCrop(activeCrop.id), [activeCrop.id])

  // Convert 90-day daily price points to MetricPoint[] with breakdown parts
  const resolvedData: MetricPoint[] = useMemo(() => {
    if (data) return data

    // Combine previousPeriod and current series so card has double the longest period (180 days)
    const combined = [...mandiData.previousPeriodSeries, ...mandiData.series]

    return combined.map((pt) => {
      // Breakdown into Grade A, Grade B, and Farmgate Base
      const gradeA = Math.round(pt.modalPrice * 1.08)
      const gradeB = pt.modalPrice
      const farmGate = Math.round(pt.modalPrice * 0.92)

      return {
        date: pt.date,
        parts: [gradeA, gradeB, farmGate],
      }
    })
  }, [data, mandiData])

  const resolvedSegments = segments ?? ['Grade A Mandi', 'Grade B Mandi', 'Farmgate Floor']
  const resolvedLabel = label ?? `${activeCrop.name} Mandi Price Trends (₹/${activeCrop.unit})`

  const resolvedEvents: MetricEvent[] = useMemo(() => {
    if (events) return events
    const len = resolvedData.length
    if (len < 30) return []

    return [
      {
        date: resolvedData[len - 25]?.date ?? '2026-09-25',
        label: 'Festive Season Spike',
      },
      {
        date: resolvedData[len - 10]?.date ?? '2026-10-10',
        label: 'New Kharif Inflow',
      },
    ]
  }, [events, resolvedData])

  return (
    <div className="flex flex-col items-center w-full">
      <MetricCard
        label={resolvedLabel}
        segments={resolvedSegments}
        data={resolvedData}
        events={resolvedEvents}
        periods={periods}
        defaultPeriod={defaultPeriod}
        format={format}
        currency={currency}
        locale="en-IN"
        className={className}
      />
    </div>
  )
}
