// Lab.tsx
import { useState } from 'react'
import CategoryDeck from '@/components/shared/CategoryDeck'
import PriceHistoryChart from '@/components/shared/PriceHistoryChart'
import StatusTimeline from '@/components/shared/StatusTimeline'
import TearReceipt from '@/components/shared/TearReceipt'
import { CROPS } from '@/data/crops'
import { ORDERS } from '@/data/orders'
import { FARMERS } from '@/data/farmers'

export default function Lab() {
  const [selectedCropIndex, setSelectedCropIndex] = useState(0)
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null)
  const [tornCount, setTornCount] = useState(0)

  const activeCrop = CROPS[selectedCropIndex]
  const sampleOrder = ORDERS[3] // Collected order with Rice & Onion
  const sampleFarmer = FARMERS[0]

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6 md:px-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 border-b border-border pb-6">
        <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
          Component Lab & Sandbox
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-text mt-2">
          KisanSetu Reusable Components
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-2xl">
          Testing all four interactive Kokonut adaptations configured with Indian agricultural data,
          rupee formatting (₹), and theme tokens.
        </p>
        {lastActionMessage && (
          <div className="mt-4 p-3 rounded-xl bg-surface border border-gold/40 text-gold text-xs font-mono">
            {lastActionMessage}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* SECTION 1: CategoryDeck */}
        <section className="bg-surface/60 border border-border rounded-3xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-farmer font-semibold">
              Component 01
            </span>
            <h2 className="font-serif text-2xl text-text mt-1">CategoryDeck (Crop Throw Deck)</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Drag cards away, swipe, or use keyboard arrows to cycle through crop categories. Click to inspect specs.
            </p>
          </div>
          <div className="flex justify-center">
            <CategoryDeck
              crops={CROPS.slice(0, 5)}
              accent="#3F8F4A"
              actionLabel="View Mandi Floor Quotes"
              onAction={(card) => setLastActionMessage(`Action triggered on crop card: ${card.title}`)}
              onChange={(card) => {
                const idx = CROPS.findIndex((c) => c.id === card.id)
                if (idx >= 0) setSelectedCropIndex(idx)
              }}
            />
          </div>
        </section>

        {/* SECTION 2: PriceHistoryChart */}
        <section className="bg-surface/60 border border-border rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-buyer font-semibold">
                Component 02
              </span>
              <h2 className="font-serif text-2xl text-text mt-1">PriceHistoryChart (Mandi Trends)</h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Morphing SVG spline with 90-day daily price points, period switcher, day scrub, and event pins.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="crop-select" className="text-xs text-text-muted">
                Select Crop:
              </label>
              <select
                id="crop-select"
                value={activeCrop.id}
                onChange={(e) => {
                  const idx = CROPS.findIndex((c) => c.id === e.target.value)
                  if (idx >= 0) setSelectedCropIndex(idx)
                }}
                className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs text-text focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {CROPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (₹/{c.unit})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center">
            <PriceHistoryChart crop={activeCrop} />
          </div>
        </section>

        {/* SECTION 3: StatusTimeline */}
        <section className="bg-surface/60 border border-border rounded-3xl p-6 sm:p-8">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-widest text-store font-semibold">
              Component 03
            </span>
            <h2 className="font-serif text-2xl text-text mt-1">StatusTimeline (Produce & Settlement)</h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Live animated rail stepper, rolling rupee odometer, and direct farmer UPI payout state.
            </p>
          </div>
          <div className="flex justify-center">
            <StatusTimeline
              amount={sampleOrder.total}
              farmerName={sampleFarmer.name}
              buyerName={sampleOrder.buyerName}
              txnId={`TXN-KS-${sampleOrder.orderNumber}`}
              timestamp="Today, 02:30 PM"
            />
          </div>
        </section>

        {/* SECTION 4: TearReceipt */}
        <section className="bg-surface/60 border border-border rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                Component 04
              </span>
              <h2 className="font-serif text-2xl text-text mt-1">TearReceipt (Store Collection Receipt)</h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Thermal printer animation with physics-driven tear interaction. Pull downward or yank to tear off.
              </p>
            </div>
            {tornCount > 0 && (
              <span className="text-xs text-farmer font-medium px-3 py-1 rounded-full bg-farmer/10 border border-farmer/30 self-start">
                Torn Receipts: {tornCount}
              </span>
            )}
          </div>
          <div className="flex justify-center">
            <TearReceipt
              order={sampleOrder}
              merchant="KisanSetu Central Store"
              currency="₹"
              onTear={() => {
                setTornCount((c) => c + 1)
                setLastActionMessage('Receipt successfully torn and collected!')
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
