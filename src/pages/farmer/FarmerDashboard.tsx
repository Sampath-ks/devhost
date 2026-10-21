// FarmerDashboard.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  Activity,
  MapPin,
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

type FarmerDashboardTab = 'orders' | 'inventory' | 'mandi' | 'metrics'

export default function FarmerDashboard() {
  const { currentFarmer, currentFarmerListings, crops } = useAppStore()
  const { listings } = useListings()
  const { farmerOrders, acceptOrder, rejectOrder } = useOrders()

  const [activeTab, setActiveTab] = useState<FarmerDashboardTab>('orders')
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [orderNotice, setOrderNotice] = useState<string | null>(null)

  // Calculations for stats
  const open = listings.filter((l) => l.status !== 'Closed')
  const active = listings.filter((l) => l.status === 'Active')
  const totalLocalKg = active.reduce((sum, l) => sum + l.quantityKg, 0)

  const activeListingsCount = Math.max(currentFarmerListings.length, open.length)
  const totalStoreKg = currentFarmerListings.reduce((acc, curr) => acc + curr.quantity, 0)
  const totalQuantity = totalLocalKg > 0 ? totalLocalKg : totalStoreKg
  const totalEstimatedEarnings =
    currentFarmerListings.reduce((acc, curr) => acc + curr.quantity * curr.pricePerUnit, 0) ||
    totalQuantity * 32

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

  const NAV_ITEMS: { id: FarmerDashboardTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'orders',
      label: 'Incoming Orders',
      icon: <ShoppingBag size={17} />,
      badge: pendingOrders.length > 0 ? pendingOrders.length : undefined,
    },
    {
      id: 'inventory',
      label: 'My Harvest Listings',
      icon: <Package size={17} />,
      badge: open.length > 0 ? open.length : undefined,
    },
    {
      id: 'mandi',
      label: 'Market Trends & Payouts',
      icon: <TrendingUp size={17} />,
    },
    {
      id: 'metrics',
      label: 'Performance KPIs',
      icon: <Activity size={17} />,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notice alert */}
      {orderNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-farmer/40 text-emerald-200 text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Check size={18} className="text-farmer shrink-0" />
            <span className="font-medium">{orderNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setOrderNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Dashboard Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ─── SIDE DASHBOARD NAVIGATION ─── */}
        <aside className="w-full lg:w-72 shrink-0 bg-surface border border-border rounded-3xl p-5 space-y-6 shadow-sm sticky top-24">
          {/* Farmer Profile Card */}
          <div className="border-b border-border/60 pb-5">
            <div className="flex items-center gap-1.5 text-farmer text-[11px] font-semibold tracking-wide uppercase mb-1">
              <ShieldCheck size={14} />
              <span>Verified Grower</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-text leading-snug">
              {currentFarmer.name}
            </h2>
            <div className="mt-2 text-xs text-muted space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-muted/80 shrink-0" />
                <span>
                  {currentFarmer.village}, {currentFarmer.district}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-muted/80 shrink-0" />
                <span>{currentFarmer.distanceKm} km to Central Store</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted px-3 pb-1">
              Dashboard Navigation
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-farmer text-text font-bold shadow-md shadow-farmer/20'
                      : 'text-muted hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-text' : 'text-farmer'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-text text-farmer'
                          : 'bg-gold/20 text-gold border border-gold/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Quick Actions Panel */}
          <div className="border-t border-border/60 pt-5 space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted px-3 pb-1">
              Quick Actions
            </div>
            <Link
              to="/farmer/add"
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-farmer/15 border border-farmer/40 text-farmer text-xs font-semibold hover:bg-farmer hover:text-text transition-all"
            >
              <PlusCircle size={15} />
              <span>Add Harvest Listing</span>
            </Link>
            <Link
              to="/farmer/listings"
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-muted hover:text-text text-xs font-medium transition-colors"
            >
              <ListChecks size={15} className="text-farmer" />
              <span>Manage All Listings</span>
            </Link>
          </div>
        </aside>

        {/* ─── MAIN CONTENT VIEW CANVAS ─── */}
        <main className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            {/* VIEW 1: INCOMING BUYER ORDERS */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* View Header */}
                <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={20} className="text-farmer" />
                      <h1 className="text-2xl font-serif font-bold text-text">
                        Incoming Buyer Orders
                      </h1>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Review direct harvest orders from verified buyers. Accept orders to initiate store delivery.
                    </p>
                  </div>
                  {pendingOrders.length > 0 && (
                    <span className="px-3 py-1.5 rounded-full bg-gold/15 text-gold border border-gold/30 text-xs font-semibold self-start sm:self-auto animate-pulse">
                      {pendingOrders.length} Order{pendingOrders.length > 1 ? 's' : ''} Pending Acceptance
                    </span>
                  )}
                </div>

                {/* Orders List */}
                {farmerOrders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
                    <ShoppingBag size={36} className="mx-auto text-muted/40" />
                    <h3 className="text-base font-semibold text-text">No incoming orders yet</h3>
                    <p className="text-xs text-muted max-w-md mx-auto">
                      When buyers purchase your listed crops, their orders will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {farmerOrders.map((order) => {
                      const isPending = order.status === 'PENDING_APPROVAL'

                      return (
                        <div
                          key={order.id}
                          className={`rounded-3xl border p-6 bg-surface shadow-sm transition-all space-y-4 ${
                            isPending
                              ? 'border-gold/50 shadow-md shadow-gold/5 ring-1 ring-gold/20'
                              : 'border-border'
                          }`}
                        >
                          {/* Order Header Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50 pb-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-gold">#{order.id}</span>
                                <h3 className="font-serif text-lg font-bold text-text">
                                  {order.cropName}{' '}
                                  {order.variety ? (
                                    <span className="font-sans text-xs font-normal text-muted">
                                      ({order.variety})
                                    </span>
                                  ) : null}
                                </h3>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-surface-2 border border-border text-muted">
                                  Buyer: <strong className="text-text font-medium">{order.buyerId}</strong>
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-1">
                                Quantity: <strong className="text-text">{order.quantityKg} kg</strong> @ ₹{order.pricePerKg}/kg
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <span className="text-[11px] text-muted block">Direct Farmgate Payout</span>
                              <span className="text-xl font-bold text-farmer">
                                ₹{order.totalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Stepper Progress */}
                          <div className="py-2">
                            <OrderStepper
                              status={order.status}
                              farmerDeliveredAt={order.farmerDeliveredAt}
                              buyerCollectedAt={order.buyerCollectedAt}
                            />
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/50">
                            <div className="text-[11px] text-muted flex items-center gap-1.5">
                              <Clock size={13} />
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
                                <span className="text-xs text-gold font-medium bg-gold/10 border border-gold/30 px-3 py-1.5 rounded-xl inline-block">
                                  Produce accepted — Please deliver to Central Store for inspection
                                </span>
                              ) : order.status === 'DELIVERED_TO_STORE' ? (
                                <span className="text-xs text-sky-400 font-medium bg-sky-950/40 border border-sky-500/30 px-3 py-1.5 rounded-xl inline-block">
                                  Delivered to Central Store — Awaiting Buyer Collection
                                </span>
                              ) : order.status === 'COLLECTED_BY_BUYER' ? (
                                <span className="text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl inline-block">
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
              </motion.div>
            )}

            {/* VIEW 2: HARVEST INVENTORY */}
            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* View Header */}
                <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package size={20} className="text-farmer" />
                      <h1 className="text-2xl font-serif font-bold text-text">
                        Active Harvest Listings ({open.length})
                      </h1>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Manage your listed crops, available stock, and check mandi price recommendations.
                    </p>
                  </div>
                  <Link
                    to="/farmer/add"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-farmer text-text text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-farmer/20 self-start sm:self-auto"
                  >
                    <PlusCircle size={15} />
                    <span>Add New Listing</span>
                  </Link>
                </div>

                {open.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
                    <Package size={36} className="mx-auto text-muted/40" />
                    <h3 className="text-base font-semibold text-text">No active listings found</h3>
                    <p className="text-xs text-muted max-w-sm mx-auto">
                      List your current crops to start receiving orders from direct buyers.
                    </p>
                    <Link
                      to="/farmer/add"
                      className="inline-block mt-2 px-4 py-2 rounded-xl bg-farmer text-text text-xs font-semibold"
                    >
                      List Harvest Now
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {open.map((l) => (
                      <div
                        key={l.id}
                        className="rounded-3xl border border-border bg-surface p-5 space-y-4 hover:border-farmer/40 transition-colors shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-serif text-lg font-bold text-text">
                              {l.cropName}{' '}
                              {l.variety ? (
                                <span className="font-sans text-xs font-normal text-muted">
                                  ({l.variety})
                                </span>
                              ) : null}
                            </h3>
                            <div className="text-xs text-muted mt-1 space-x-2">
                              <span>
                                Available: <strong className="text-text">{l.quantityKg} kg</strong>
                              </span>
                              <span>·</span>
                              <span>
                                Asking: <strong className="text-farmer font-bold">₹{l.askingPrice}/kg</strong>
                              </span>
                            </div>
                          </div>
                          <span className="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted border border-border">
                            Grade {l.qualityGrade}
                          </span>
                        </div>

                        {checkingId === l.id ? (
                          <div className="pt-2">
                            <PriceCheckPanel listing={l} onClose={() => setCheckingId(null)} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCheckingId(l.id)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:border-farmer hover:text-farmer transition-colors cursor-pointer bg-surface-2/40"
                          >
                            <BarChart3 size={14} className="text-farmer" />
                            <span>Check Mandi Market Benchmark</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 3: MARKET TRENDS & SETTLEMENT */}
            {activeTab === 'mandi' && (
              <motion.div
                key="mandi"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* View Header */}
                <div className="bg-surface border border-border rounded-3xl p-6 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={20} className="text-gold" />
                      <h1 className="text-2xl font-serif font-bold text-text">
                        Market Trends & Live Settlements
                      </h1>
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Official APMC mandi benchmarks, grade spreads, and recent bank transfers.
                    </p>
                  </div>
                  <Link
                    to="/farmer/prices"
                    className="text-xs font-medium text-farmer hover:underline flex items-center gap-1"
                  >
                    <span>All Crops Mandi Rates</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Mandi Benchmark Chart */}
                  <div className="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-gold uppercase tracking-wider">
                          Official Mandi Benchmark
                        </span>
                        <h3 className="font-serif text-xl font-bold text-text mt-0.5">
                          {topCrop.name} Price Trajectory
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                          90-day spot trend vs. your floor price of ₹
                          {currentFarmerListings[0]?.pricePerUnit || topCrop.basePrice}/{topCrop.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-2">
                      <PriceHistoryChart
                        crop={topCrop}
                        label={`${topCrop.name} Mandi Rates`}
                        segments={['Grade A Premium', 'Grade B Standard', 'Farmgate Floor']}
                        className="border-none shadow-none bg-transparent p-0"
                      />
                    </div>
                  </div>

                  {/* Settlement Timeline */}
                  <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-farmer uppercase tracking-wider">
                          Live Settlement
                        </span>
                        <h3 className="font-serif text-xl font-bold text-text mt-0.5">
                          Recent Harvest Payout
                        </h3>
                        <p className="text-xs text-muted mt-0.5">
                          Batch ORD-2026-8801 · FreshRoots Organics
                        </p>
                      </div>
                      <span className="text-xs text-farmer font-semibold px-2.5 py-1 rounded-full bg-farmer/10 border border-farmer/30">
                        UPI Settled
                      </span>
                    </div>
                    <div className="flex justify-center pt-2">
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
                </div>
              </motion.div>
            )}

            {/* VIEW 4: PERFORMANCE METRICS */}
            {activeTab === 'metrics' && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* View Header */}
                <div className="bg-surface border border-border rounded-3xl p-6">
                  <div className="flex items-center gap-2">
                    <Activity size={20} className="text-farmer" />
                    <h1 className="text-2xl font-serif font-bold text-text">
                      Farm Performance & Realization
                    </h1>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Summary metrics of harvest volume, active farmgate lots, and revenue potential.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Card 1: Active Listings */}
                  <div className="p-6 rounded-3xl bg-surface border border-border space-y-2">
                    <div className="flex items-center justify-between text-muted text-xs uppercase tracking-wider font-semibold">
                      <span>Active Listings</span>
                      <div className="w-8 h-8 rounded-lg bg-farmer/15 border border-farmer/30 flex items-center justify-center text-farmer">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-4xl font-semibold text-text tracking-tight">
                      <AnimatedNumber value={activeListingsCount} />
                    </p>
                    <p className="text-xs text-muted">Available for direct buyer bids & orders</p>
                  </div>

                  {/* Card 2: Total Quantity Listed */}
                  <div className="p-6 rounded-3xl bg-surface border border-border space-y-2">
                    <div className="flex items-center justify-between text-muted text-xs uppercase tracking-wider font-semibold">
                      <span>Total Harvest Listed</span>
                      <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-4xl font-semibold text-text tracking-tight">
                      <AnimatedNumber value={totalQuantity} />{' '}
                      <span className="text-lg font-normal text-muted">kg</span>
                    </p>
                    <p className="text-xs text-muted">Across grade-inspected crop batches</p>
                  </div>

                  {/* Card 3: Estimated Floor Value */}
                  <div className="p-6 rounded-3xl bg-surface border border-border space-y-2">
                    <div className="flex items-center justify-between text-muted text-xs uppercase tracking-wider font-semibold">
                      <span>Estimated Floor Value</span>
                      <div className="w-8 h-8 rounded-lg bg-farmer/15 border border-farmer/30 flex items-center justify-center text-farmer font-bold">
                        ₹
                      </div>
                    </div>
                    <p className="text-4xl font-semibold text-farmer tracking-tight">
                      ₹<AnimatedNumber value={totalEstimatedEarnings} />
                    </p>
                    <p className="text-xs text-muted">
                      Avg. realization {formatINR(totalQuantity > 0 ? totalEstimatedEarnings / totalQuantity : 0)}/kg
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}