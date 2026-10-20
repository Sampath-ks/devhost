// FarmerDashboard.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusCircle,
  Package,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  Check,
  X,
  Clock,
  BarChart3,
  ListChecks,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useListings } from '@/hooks/useListings'
import { useOrders } from '@/hooks/useOrders'
import PriceHistoryChart from '@/components/shared/PriceHistoryChart'
import StatusTimeline from '@/components/shared/StatusTimeline'
import PriceCheckPanel from '@/components/shared/PriceCheckPanel'
import OrderStepper from '@/components/ui/Stepper'
import { formatINR } from '@/lib/utils'

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const duration = 1000
    const stepTime = 20
    const steps = duration / stepTime
    const increment = (end - start) / steps

    const timer = setInterval(() => {
      start += increment
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplay(end)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  return <span className="tabular-nums">{display.toLocaleString('en-IN')}</span>
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function FarmerDashboard() {
  const { currentFarmer, currentFarmerListings, crops } = useAppStore()
  const { listings } = useListings()
  const { farmerOrders, acceptOrder, rejectOrder } = useOrders()

  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [orderNotice, setOrderNotice] = useState<string | null>(null)

  // Calculations for stats
  const open = listings.filter((l) => l.status !== 'Closed')
  const active = listings.filter((l) => l.status === 'Active')
  const totalLocalKg = active.reduce((sum, l) => sum + l.quantityKg, 0)

  const activeListingsCount = Math.max(currentFarmerListings.length, open.length)
  const totalStoreKg = currentFarmerListings.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalQuantity = totalLocalKg > 0 ? totalLocalKg : totalStoreKg
  const totalEstimatedEarnings = currentFarmerListings.reduce(
    (acc, curr) => acc + curr.quantity * curr.pricePerUnit,
    0
  ) || (totalQuantity * 32)

  const pendingOrders = farmerOrders.filter((o) => o.status === 'PENDING_APPROVAL')

  // Top crop determination for chart
  const topCropId = currentFarmerListings[0]?.cropId || 'crop-onion'
  const topCrop = crops.find((c) => c.id === topCropId) || crops[1]

  const handleAccept = (orderId: string, cropName: string) => {
    acceptOrder(orderId)
    setOrderNotice(
      `Order for ${cropName} accepted! Buyer notified. Please deliver produce to the Central Store.`
    )
    setTimeout(() => setOrderNotice(null), 4500)
  }

  const handleReject = (orderId: string, cropName: string) => {
    rejectOrder(orderId, 'Quantity or delivery unavailable')
    setOrderNotice(`Order for ${cropName} declined. Buyer notified.`)
    setTimeout(() => setOrderNotice(null), 4500)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Greeting Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-farmer">
              Kisan Cultivator Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-farmer px-2 py-0.5 rounded-full bg-farmer/10 border border-farmer/30">
              <ShieldCheck className="w-3 h-3" />
              Verified Grower
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-text font-normal">
            Namaste, {currentFarmer.name} ji
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Farmgate node:{' '}
            <span className="text-text font-medium">
              {currentFarmer.village}, {currentFarmer.district}
            </span>{' '}
            · Distance to Central Store: {currentFarmer.distanceKm} km
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/farmer/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-farmer text-text text-sm font-medium hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-farmer/20"
          >
            <PlusCircle className="w-4 h-4" />
            Add Harvest Listing
          </Link>
          <Link
            to="/farmer/produce"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-text text-sm font-medium hover:bg-surface-2 transition-colors"
          >
            <Package className="w-4 h-4" />
            My Produce
          </Link>
          <Link
            to="/farmer/listings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-text text-sm font-medium hover:border-farmer transition-colors"
          >
            <ListChecks className="w-4 h-4 text-farmer" />
            Manage Listings
          </Link>
        </div>
      </motion.div>

      {/* Notice alert */}
      {orderNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-farmer/40 text-emerald-200 text-sm flex items-center gap-2 animate-auth-in">
          <Check size={18} className="text-farmer shrink-0" />
          <span>{orderNotice}</span>
        </div>
      )}

      {/* 2. Stat Cards with Rolling Number Animation */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-5"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
      >
        {/* Card 1: Active Listings */}
        <div className="p-6 rounded-2xl bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">
            <span>Active Listings</span>
            <div className="w-8 h-8 rounded-lg bg-farmer/15 border border-farmer/30 flex items-center justify-center text-farmer">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-4xl font-semibold text-text tracking-tight">
            <AnimatedNumber value={activeListingsCount} />
          </p>
          <p className="text-xs text-text-muted mt-2">Available for direct buyer bids & orders</p>
        </div>

        {/* Card 2: Total Quantity Listed */}
        <div className="p-6 rounded-2xl bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">
            <span>Total Harvest Listed</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-4xl font-semibold text-text tracking-tight">
            <AnimatedNumber value={totalQuantity} />{' '}
            <span className="text-lg font-normal text-text-muted">kg</span>
          </p>
          <p className="text-xs text-text-muted mt-2">Across grade-inspected crop batches</p>
        </div>

        {/* Card 3: Estimated Floor Value */}
        <div className="p-6 rounded-2xl bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">
            <span>Estimated Floor Value</span>
            <div className="w-8 h-8 rounded-lg bg-farmer/15 border border-farmer/30 flex items-center justify-center text-farmer font-bold">
              ₹
            </div>
          </div>
          <p className="text-4xl font-semibold text-farmer tracking-tight">
            ₹<AnimatedNumber value={totalEstimatedEarnings} />
          </p>
          <p className="text-xs text-text-muted mt-2">
            Average realization {formatINR(totalQuantity > 0 ? totalEstimatedEarnings / totalQuantity : 0)}/kg
          </p>
        </div>
      </motion.div>

      {/* 3. Incoming Buyer Orders Section */}
      <div className="space-y-4 bg-surface/50 border border-border rounded-3xl p-6 sm:p-7">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
              <ShoppingBag size={22} className="text-farmer" />
              Incoming Buyer Orders ({farmerOrders.length})
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Review buyer orders. Once accepted, deliver the batch to the Central Store.
            </p>
          </div>
          {pendingOrders.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/30 text-xs font-semibold animate-pulse">
              {pendingOrders.length} Pending Acceptance
            </span>
          )}
        </div>

        {farmerOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-8 text-center text-xs text-muted">
            No orders received from buyers yet. New buyer requests will arrive here in real time.
          </div>
        ) : (
          <div className="space-y-4">
            {farmerOrders.map((order) => {
              const isPending = order.status === 'PENDING_APPROVAL'

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border p-5 bg-surface transition-all ${
                    isPending
                      ? 'border-gold/50 shadow-md shadow-gold/5 ring-1 ring-gold/20'
                      : 'border-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gold">#{order.id}</span>
                        <h3 className="font-semibold text-text text-base">
                          {order.cropName} {order.variety ? `(${order.variety})` : ''}
                        </h3>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Buyer: <strong className="text-text">{order.buyerId}</strong> · {order.quantityKg} kg @ ₹{order.pricePerKg}/kg
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="sm:text-right">
                        <span className="text-xs text-muted block">Direct Farmgate Payout</span>
                        <span className="text-lg font-bold text-farmer">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress Stepper */}
                  <div className="py-4">
                    <OrderStepper
                      status={order.status}
                      farmerDeliveredAt={order.farmerDeliveredAt}
                      buyerCollectedAt={order.buyerCollectedAt}
                    />
                  </div>

                  {/* Actions or Next Step Guidance */}
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/50">
                    <div className="text-[11px] text-muted flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div>
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(order.id, order.cropName)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-farmer text-text text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            <Check size={14} /> Accept Order
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(order.id, order.cropName)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-xs font-medium hover:bg-red-950/40 cursor-pointer"
                          >
                            <X size={14} /> Decline
                          </button>
                        </div>
                      ) : order.status === 'ACCEPTED' ? (
                        <span className="text-xs text-gold font-medium bg-gold/10 border border-gold/30 px-3 py-1.5 rounded-lg inline-block">
                          Produce accepted — Please deliver to Central Store for inspection
                        </span>
                      ) : order.status === 'DELIVERED_TO_STORE' ? (
                        <span className="text-xs text-sky-400 font-medium bg-sky-950/40 border border-sky-500/30 px-3 py-1.5 rounded-lg inline-block">
                          Delivered to Central Store — Awaiting Buyer Collection
                        </span>
                      ) : order.status === 'COLLECTED_BY_BUYER' ? (
                        <span className="text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg inline-block">
                          Completed & Escrow Paid to Account
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Main Dashboard Grid: PriceHistoryChart & StatusTimeline */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT }}
      >
        {/* Left Col (7 cols): PriceHistoryChart for Top Crop */}
        <div className="lg:col-span-7 bg-surface/70 border border-border rounded-3xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                Mandi Benchmark
              </span>
              <h3 className="font-serif text-2xl text-text mt-0.5">
                {topCrop.name} Price Trajectory
              </h3>
              <p className="text-xs text-text-muted mt-1">
                90-day spot trend vs. your floor price of ₹
                {currentFarmerListings[0]?.pricePerUnit || topCrop.basePrice}/{topCrop.unit}
              </p>
            </div>
            <Link
              to="/farmer/prices"
              className="text-xs font-medium text-farmer hover:text-farmer/80 flex items-center gap-1 transition-colors"
            >
              All Crops <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex justify-center">
            <PriceHistoryChart
              crop={topCrop}
              label={`${topCrop.name} Mandi Rates`}
              segments={['Grade A Premium', 'Grade B Standard', 'Farmgate Floor']}
              className="border-none shadow-none bg-transparent p-0"
            />
          </div>
        </div>

        {/* Right Col (5 cols): Recent Activity StatusTimeline */}
        <div className="lg:col-span-5 bg-surface/70 border border-border rounded-3xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs font-semibold text-farmer uppercase tracking-wider">
                Live Settlement
              </span>
              <h3 className="font-serif text-2xl text-text mt-0.5">
                Recent Harvest Payout
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Batch ORD-2026-8801 · FreshRoots Organics
              </p>
            </div>
            <span className="text-xs text-farmer font-semibold px-2.5 py-1 rounded-full bg-farmer/10 border border-farmer/30">
              UPI Settled
            </span>
          </div>

          <div className="flex justify-center">
            <StatusTimeline
              amount={6000}
              farmerName={`${currentFarmer.name} (Direct Payee)`}
              buyerName="FreshRoots Organics (Escrow)"
              txnId="TXN-KS-ORD-8801"
              timestamp="Today, 11:30 AM"
              rateText="Direct Account Transfer: 0% Platform Deductions"
              className="border-none shadow-none bg-transparent p-0"
            />
          </div>
        </div>
      </motion.div>

      {/* 5. Your Produce Listings & Market Check */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Active Harvest Listings</h2>
          <Link to="/farmer/produce" className="text-xs text-farmer hover:underline flex items-center gap-1">
            View All in Inventory <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {open.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            No open listings.{' '}
            <Link to="/farmer/add" className="text-farmer hover:underline font-medium">
              List a harvest now
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {open.map((l) => (
              <div key={l.id} className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border/80">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">
                      {l.cropName} {l.variety ? <span className="font-normal text-muted">({l.variety})</span> : ''}
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      {l.quantityKg} kg · ₹{l.askingPrice}/kg · Grade {l.qualityGrade}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted border border-border">
                    {l.status}
                  </span>
                </div>

                {checkingId === l.id ? (
                  <div className="mt-4">
                    <PriceCheckPanel listing={l} onClose={() => setCheckingId(null)} />
                  </div>
                ) : (
                  <button
                    onClick={() => setCheckingId(l.id)}
                    className="mt-4 flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-farmer transition-colors cursor-pointer"
                  >
                    <BarChart3 size={14} className="text-farmer" /> Check market benchmark
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}