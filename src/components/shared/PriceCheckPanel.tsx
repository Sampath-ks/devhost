import { useState } from 'react'
import { X, TrendingUp, TrendingDown, CheckCircle2, Info } from 'lucide-react'
import { MARKETS } from '@/data/mandiPrices'
import { getPriceSuggestion } from '@/lib/priceService'
import type { ProduceListing } from '@/lib/produceTypes'

const messages = {
  above: 'Your price is above the suggested range. Buyers may pick cheaper listings.',
  within: 'Your price is within the suggested range. It looks competitive.',
  below: 'Your price is below the suggested range. You may be underpricing your produce.',
}

export default function PriceCheckPanel({
  listing,
  onClose,
}: {
  listing: ProduceListing
  onClose: () => void
}) {
  const [market, setMarket] = useState(MARKETS[0])

  const result = getPriceSuggestion({
    crop: listing.cropName,
    market,
    askingPrice: listing.askingPrice,
    grade: listing.qualityGrade,
  })

  const tone =
    result?.comparison === 'within'
      ? 'text-emerald-300'
      : result?.comparison === 'above'
        ? 'text-amber-300'
        : 'text-sky-300'

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Market price check</h4>
        <button onClick={onClose} aria-label="Close" className="text-muted hover:text-text">
          <X size={16} />
        </button>
      </div>

      <label className="mb-3 block text-xs text-muted">
        Market
        <select
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-farmer"
        >
          {MARKETS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {!result ? (
        <p className="text-sm text-muted">
          No sample price data for {listing.cropName} in {market}.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted">Benchmark</div>
              <div className="font-semibold">₹{result.benchmark}/kg</div>
            </div>
            <div>
              <div className="text-xs text-muted">Suggested range</div>
              <div className="font-semibold">
                ₹{result.rangeLow}–₹{result.rangeHigh}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Your price</div>
              <div className="font-semibold">₹{result.askingPrice}/kg</div>
            </div>
          </div>

          <p className={`mt-3 flex items-start gap-2 text-sm ${tone}`}>
            {result.comparison === 'within' ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            ) : result.comparison === 'above' ? (
              <TrendingUp size={16} className="mt-0.5 shrink-0" />
            ) : (
              <TrendingDown size={16} className="mt-0.5 shrink-0" />
            )}
            <span>
              {messages[result.comparison]} ({result.diffPercent > 0 ? '+' : ''}
              {result.diffPercent}% vs benchmark)
            </span>
          </p>

          <p className="mt-3 flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-xs text-muted">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong className="text-text">Sample data</strong>, not live prices. Source:{' '}
              {result.source}. Last updated {result.lastUpdated}. You decide whether to change your
              price.
            </span>
          </p>
        </>
      )}
    </div>
  )
}