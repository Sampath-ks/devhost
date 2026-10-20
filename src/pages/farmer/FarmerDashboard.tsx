// FarmerDashboard.tsx
import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusCircle, Package, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import PriceHistoryChart from '@/components/shared/PriceHistoryChart'
import StatusTimeline from '@/components/shared/StatusTimeline'
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

  // Calculate stats
  const activeListingsCount = currentFarmerListings.length

  const totalQuantity = useMemo(() => {
    return currentFarmerListings.reduce((sum, item) => sum + item.quantity, 0)
  }, [currentFarmerListings])

  const totalEstimatedEarnings = useMemo(() => {
    return currentFarmerListings.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0)
  }, [currentFarmerListings])

  // Farmer's top crop (first crop listed or crop with highest quantity)
  const topCropId = currentFarmerListings[0]?.cropId || 'crop-onion'
  const topCrop = crops.find((c) => c.id === topCropId) || crops[1]

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
            Farmgate node: <span className="text-text font-medium">{currentFarmer.village}, {currentFarmer.district}</span> · Distance to Central Store: {currentFarmer.distanceKm} km
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </motion.div>

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
          <p className="text-xs text-text-muted mt-2">Available for direct buyer bids</p>
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
            <AnimatedNumber value={totalQuantity} /> <span className="text-lg font-normal text-text-muted">kg</span>
          </p>
          <p className="text-xs text-text-muted mt-2">Across grade-inspected crop batches</p>
        </div>

        {/* Card 3: Estimated Earnings */}
        <div className="p-6 rounded-2xl bg-surface border border-border relative overflow-hidden group">
          <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">
            <span>Estimated Floor Value</span>
            <div className="w-8 h-8 rounded-lg bg-farmer/15 border border-farmer/30 flex items-center justify-center text-farmer">
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

      {/* 3. Main Dashboard Grid: PriceHistoryChart & StatusTimeline */}
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
                90-day spot trend vs. your floor price of ₹{currentFarmerListings[0]?.pricePerUnit || topCrop.basePrice}/{topCrop.unit}
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
    </div>
  )
}
