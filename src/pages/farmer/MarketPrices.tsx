// MarketPrices.tsx
import { useState, useMemo } from 'react'
import { Sparkles, TrendingUp, TrendingDown, ArrowUpRight, Check } from 'lucide-react'
import PriceHistoryChart from '@/components/shared/PriceHistoryChart'
import { CROPS } from '@/data/crops'
import { getMandiPricesForCrop } from '@/data/mandiPrices'

export default function MarketPrices() {
  const [selectedCropId, setSelectedCropId] = useState<string>('crop-tomato')

  const selectedCrop = useMemo(() => {
    return CROPS.find((c) => c.id === selectedCropId) || CROPS[0]
  }, [selectedCropId])

  const selectedMandi = useMemo(() => {
    return getMandiPricesForCrop(selectedCrop.id)
  }, [selectedCrop.id])

  // Compute table statistics for all crops
  const tableData = useMemo(() => {
    return CROPS.map((crop) => {
      const mandi = getMandiPricesForCrop(crop.id)
      const series = mandi.series
      const first = series[0]?.modalPrice || crop.basePrice
      const latest = series[series.length - 1]?.modalPrice || crop.basePrice
      const changePct = first > 0 ? ((latest - first) / first) * 100 : 0

      return {
        crop,
        mandi,
        modalPrice: latest,
        changePct,
        minRange: mandi.minSuggestedPrice,
        maxRange: mandi.maxSuggestedPrice,
      }
    })
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold">
          Daily Mandi Rates
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-text font-normal mt-1">
          Market Price Intelligence
        </h1>
        <p className="text-sm text-text-muted mt-1.5 max-w-2xl">
          Verified daily modal rates, seasonal arrival fluctuations, and suggested farmgate floor prices across major APMC mandi hubs.
        </p>
      </div>

      {/* 1. Horizontal Crop Selector Scroller */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-text">
            Select Crop to Inspect
          </span>
          <span className="text-xs text-text-muted">
            Viewing: <strong className="text-farmer">{selectedCrop.name}</strong>
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-surface-2">
          {CROPS.map((crop) => {
            const isSelected = crop.id === selectedCropId
            const mandi = getMandiPricesForCrop(crop.id)

            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCropId(crop.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border shrink-0 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-farmer ${
                  isSelected
                    ? 'bg-farmer/20 border-farmer shadow-lg shadow-farmer/15'
                    : 'bg-surface border-border hover:bg-surface-2 hover:border-border/80'
                }`}
              >
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-9 h-9 object-contain drop-shadow"
                  loading="lazy"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-text block leading-tight">
                      {crop.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-farmer stroke-[3]" />}
                  </div>
                  <span className="text-xs text-text-muted font-medium tabular-nums">
                    ₹{mandi.currentModalPrice}/{crop.unit}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Featured Crop Chart with Annotation Tag */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border p-2 flex items-center justify-center shrink-0">
              <img
                src={selectedCrop.image}
                alt={selectedCrop.name}
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl sm:text-3xl text-text font-normal">
                  {selectedCrop.name}
                </h2>
                <span className="text-xs text-text-muted">({selectedCrop.hindiName})</span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Category: <span className="text-text font-medium">{selectedCrop.category}</span> · Shelf Life: {selectedCrop.shelfLifeDays} days
              </p>
            </div>
          </div>

          {/* Annotation Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-farmer/15 border border-farmer/40 text-farmer text-xs sm:text-sm font-semibold self-start sm:self-auto shadow-sm">
            <Sparkles className="w-4 h-4 text-gold shrink-0" />
            <span>
              Suggested Range: ₹{selectedMandi.minSuggestedPrice} to ₹{selectedMandi.maxSuggestedPrice} per {selectedCrop.unit}
            </span>
          </div>
        </div>

        {/* The Animated PriceHistoryChart */}
        <div className="flex justify-center pt-2">
          <PriceHistoryChart
            crop={selectedCrop}
            label={`${selectedCrop.name} Spot Price`}
            segments={['Grade A Assayed', 'Grade B Standard', 'Farmgate Average']}
            className="border-none shadow-none bg-transparent p-0"
          />
        </div>
      </div>

      {/* 3. Comprehensive All-Crops Mandi Table */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif text-2xl text-text font-normal">
            All Crops Mandi Benchmark Table
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Click on any crop row below to load its 90-day history into the interactive chart above.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
          <table className="w-full text-left text-sm" role="table">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-text-muted bg-surface-2/40">
                <th scope="col" className="py-4 px-6 font-semibold">Crop</th>
                <th scope="col" className="py-4 px-6 font-semibold">Category</th>
                <th scope="col" className="py-4 px-6 font-semibold tabular-nums text-right">Modal Rate</th>
                <th scope="col" className="py-4 px-6 font-semibold text-right">30D Trend</th>
                <th scope="col" className="py-4 px-6 font-semibold text-right">Suggested Fair Range</th>
                <th scope="col" className="py-4 px-6 font-semibold text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tableData.map(({ crop, modalPrice, changePct, minRange, maxRange }) => {
                const isSelected = crop.id === selectedCropId
                const isPositive = changePct >= 0

                return (
                  <tr
                    key={crop.id}
                    onClick={() => setSelectedCropId(crop.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-farmer/15 hover:bg-farmer/20 font-medium'
                        : 'hover:bg-surface-2/60'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={crop.image}
                          alt={crop.name}
                          className="w-8 h-8 object-contain shrink-0"
                          loading="lazy"
                        />
                        <div>
                          <span className="text-text font-medium block leading-tight">{crop.name}</span>
                          <span className="text-[11px] text-text-muted">{crop.hindiName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-text-muted text-xs">
                      {crop.category}
                    </td>

                    <td className="py-4 px-6 tabular-nums text-right font-medium text-text">
                      ₹{modalPrice} <span className="text-xs text-text-muted font-normal">/{crop.unit}</span>
                    </td>

                    <td className="py-4 px-6 tabular-nums text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'rose-500/10 text-rose-400'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{changePct.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-4 px-6 tabular-nums text-right text-text-muted font-medium">
                      ₹{minRange} – ₹{maxRange} <span className="text-xs font-normal">/{crop.unit}</span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-farmer text-bg border-farmer font-semibold'
                            : 'border-border text-text-muted hover:text-text'
                        }`}
                      >
                        {isSelected ? 'Active' : 'View'}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
