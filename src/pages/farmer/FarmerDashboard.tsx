// FarmerDashboard.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Store,
  LogOut,
  ChevronRight,
  Sprout,
} from 'lucide-react'
import { clearSession } from '@/lib/session'
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

function EmptyOrdersIllustration() {
  return (
    <div className="relative w-48 h-40 mx-auto flex items-center justify-center">
      <svg
        viewBox="0 0 200 160"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Golden Sun */}
        <circle cx="100" cy="80" r="42" fill="#FBBF24" opacity="0.95" />

        {/* Distant sea horizon line */}
        <path d="M30 118 Q 65 114, 100 118 T 170 118" stroke="#255941" strokeWidth="1.5" />
        {/* Distant boat silhouette */}
        <g opacity="0.7" transform="translate(36, 108) scale(0.42)">
          <path d="M2 15 C 8 20, 24 20, 30 15 L 26 10 L 6 10 Z" fill="#18412E" />
          <line x1="16" y1="10" x2="16" y2="2" stroke="#18412E" strokeWidth="2" />
        </g>

        {/* Little birds in the sky */}
        <path
          d="M136 58 Q 139 54, 142 58 Q 145 54, 148 58"
          stroke="#4D8369"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M150 68 Q 152 65, 154 68 Q 156 65, 158 68"
          stroke="#4D8369"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Crops / Greens sprouting from crate */}
        {/* Left leaf */}
        <path
          d="M80 78 C 72 60, 85 48, 92 58 C 96 64, 94 74, 88 78 Z"
          fill="#4ADE80"
          stroke="#14532D"
          strokeWidth="2"
        />
        {/* Center large leaf */}
        <path
          d="M100 78 C 92 52, 108 38, 116 52 C 121 62, 114 74, 106 78 Z"
          fill="#22C55E"
          stroke="#14532D"
          strokeWidth="2.2"
        />
        {/* Right leaf */}
        <path
          d="M112 78 C 118 60, 132 62, 128 72 C 125 76, 120 78, 115 78 Z"
          fill="#86EFAC"
          stroke="#14532D"
          strokeWidth="2"
        />
        {/* Leaf veins */}
        <path d="M86 68 Q 88 74, 90 78" stroke="#14532D" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M106 62 Q 106 70, 104 78"
          stroke="#14532D"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Wooden Harvest Crate */}
        {/* Main Crate body */}
        <rect
          x="66"
          y="76"
          width="68"
          height="40"
          rx="4"
          fill="#A7F3D0"
          stroke="#064E3B"
          strokeWidth="2.5"
        />
        {/* Horizontal slats */}
        <line x1="66" y1="90" x2="134" y2="90" stroke="#064E3B" strokeWidth="2" />
        <line x1="66" y1="104" x2="134" y2="104" stroke="#064E3B" strokeWidth="2" />
        {/* Left and right corner vertical posts */}
        <rect
          x="66"
          y="76"
          width="10"
          height="40"
          rx="2"
          fill="#6EE7B7"
          stroke="#064E3B"
          strokeWidth="2"
        />
        <rect
          x="124"
          y="76"
          width="10"
          height="40"
          rx="2"
          fill="#6EE7B7"
          stroke="#064E3B"
          strokeWidth="2"
        />
        {/* Handle slot */}
        <rect x="91" y="81" width="18" height="5" rx="2.5" fill="#064E3B" />

        {/* Ground grass ripples */}
        <path
          d="M48 126 Q 100 118, 152 126"
          stroke="#22C55E"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M65 133 Q 100 126, 135 133"
          stroke="#16A34A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

type FarmerDashboardTab = 'orders' | 'inventory' | 'mandi' | 'metrics'

export default function FarmerDashboard() {
  const navigate = useNavigate()
  const { currentFarmer, currentFarmerListings, crops } = useAppStore()
  const { listings } = useListings()
  const { farmerOrders, acceptOrder, rejectOrder } = useOrders()

  const [activeTab, setActiveTab] = useState<FarmerDashboardTab>('orders')
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [orderNotice, setOrderNotice] = useState<string | null>(null)

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

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
      icon: <Sprout size={17} />,
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
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top action row with aligned Logout button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-[#214734] bg-[#0c1a14]/85 backdrop-blur-md px-3.5 py-1.5 text-xs text-slate-200 transition-all hover:bg-[#163526] hover:text-white cursor-pointer shadow-sm hover:border-emerald-500/40"
        >
          <LogOut className="h-3.5 w-3.5 text-slate-300" />
          <span>Log out</span>
        </button>
      </div>

      {/* Notice alert */}
      {orderNotice && (
        <div className="p-4 rounded-2xl bg-[#0e2419]/90 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-between shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Check size={18} className="text-emerald-400 shrink-0" />
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
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* ─── SIDE DASHBOARD NAVIGATION ─── */}
        <aside className="w-full lg:w-80 shrink-0 bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 space-y-5 shadow-2xl relative overflow-hidden">
          {/* Subtle bottom leaf contour lines */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-15 overflow-hidden h-16">
            <svg viewBox="0 0 300 60" className="w-full h-full" fill="none">
              <path d="M0 45 Q 75 25, 150 45 T 300 40" stroke="#38a169" strokeWidth="1.5" />
              <path d="M0 55 Q 100 35, 200 55 T 300 50" stroke="#48bb78" strokeWidth="1" />
            </svg>
          </div>

          {/* Farmer Profile Card */}
          <div className="border-b border-[#1b3b2b]/70 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold tracking-wider uppercase mb-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Verified Grower</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-white leading-snug">
                  {currentFarmer.name}
                </h2>
                <div className="mt-2 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-400 shrink-0" />
                    <span>
                      {currentFarmer.village}, {currentFarmer.district}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Store size={13} className="text-emerald-400 shrink-0" />
                    <span>{currentFarmer.distanceKm} km to Central Store</span>
                  </div>
                </div>
              </div>

              {/* Farmer Circular Avatar */}
              <div className="relative shrink-0 ml-3">
                <img
                  src="/assets/images/portraits/farmer_avatar.jpg"
                  alt={currentFarmer.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/60 shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#5f9378] px-1">
              Dashboard Navigation
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2f6f45] text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-[#152e22]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-[#14281f] text-emerald-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      size={15}
                      className={isActive ? 'text-white' : 'text-slate-500'}
                    />
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Quick Actions Panel */}
          <div className="border-t border-[#1b3b2b]/70 pt-4 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#5f9378] px-1 pb-1">
              Quick Actions
            </div>
            <Link
              to="/farmer/add"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#388254]/85 hover:bg-[#388254] text-white text-xs font-semibold shadow-md transition-all border border-emerald-400/30"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle size={15} className="text-emerald-200" />
                <span>Add Harvest Listing</span>
              </div>
              <ChevronRight size={15} className="text-emerald-200" />
            </Link>
            <Link
              to="/farmer/listings"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#12241b]/80 hover:bg-[#1a3829] text-slate-300 hover:text-white text-xs font-medium transition-colors border border-[#214734]/50"
            >
              <div className="flex items-center gap-2.5">
                <ListChecks size={15} className="text-emerald-400" />
                <span>Manage All Listings</span>
              </div>
              <ChevronRight size={15} className="text-slate-500" />
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
                className="space-y-4"
              >
                {/* View Header with subtle coastal landscape horizon peek */}
                <div className="bg-[#0c1a14]/85 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Subtle right horizon accent */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2/5 opacity-15 pointer-events-none bg-cover bg-center rounded-r-3xl"
                    style={{ backgroundImage: `url('/assets/images/portals/auth_bg.jpg')` }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#14281f] border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                        <ShoppingBag size={20} className="text-emerald-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                          Incoming Buyer Orders
                        </h1>
                        <Sprout size={18} className="text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 ml-13">
                      Review direct harvest orders from verified buyers. Accept orders to initiate store delivery.
                    </p>
                  </div>
                  {pendingOrders.length > 0 && (
                    <span className="relative z-10 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-semibold self-start sm:self-auto animate-pulse">
                      {pendingOrders.length} Order{pendingOrders.length > 1 ? 's' : ''} Pending Acceptance
                    </span>
                  )}
                </div>

                {/* Orders Content Canvas */}
                {farmerOrders.length === 0 ? (
                  <div className="rounded-3xl border border-[#1b3b2b]/80 bg-[#0c1a14]/90 backdrop-blur-md p-10 sm:p-14 text-center space-y-4 shadow-2xl relative overflow-hidden min-h-[420px] flex flex-col items-center justify-center">
                    {/* Custom Vector Empty Orders Illustration */}
                    <EmptyOrdersIllustration />

                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                        No incoming orders yet
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                        When buyers purchase your listed crops, their orders will appear here in real time.
                      </p>
                    </div>

                    {/* Decorative wave accent */}
                    <div className="flex justify-center pt-1" aria-hidden="true">
                      <svg
                        width="70"
                        height="9"
                        viewBox="0 0 70 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 4.5 C 7 1.5, 12 7.5, 17 4.5 C 22 1.5, 27 7.5, 32 4.5 C 37 1.5, 42 7.5, 47 4.5 C 52 1.5, 57 7.5, 62 4.5 C 65 2.5, 67 4.5, 68 4.5"
                          stroke="#2D6A4F"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {farmerOrders.map((order) => {
                      const isPending = order.status === 'PENDING_APPROVAL'

                      return (
                        <div
                          key={order.id}
                          className={`rounded-3xl border p-6 bg-[#0c1a14]/90 backdrop-blur-md shadow-xl transition-all space-y-4 ${
                            isPending
                              ? 'border-amber-400/50 shadow-amber-950/10 ring-1 ring-amber-400/20'
                              : 'border-[#1b3b2b]/80'
                          }`}
                        >
                          {/* Order Header Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1b3b2b]/60 pb-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-amber-400">#{order.id}</span>
                                <h3 className="font-serif text-lg font-bold text-white">
                                  {order.cropName}{' '}
                                  {order.variety ? (
                                    <span className="font-sans text-xs font-normal text-slate-400">
                                      ({order.variety})
                                    </span>
                                  ) : null}
                                </h3>
                                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-[#13281e] border border-[#214734] text-slate-300">
                                  Buyer: <strong className="text-white font-medium">{order.buyerId}</strong>
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1">
                                Quantity: <strong className="text-white">{order.quantityKg} kg</strong> @ ₹{order.pricePerKg}/kg
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <span className="text-[11px] text-slate-400 block">Direct Farmgate Payout</span>
                              <span className="text-xl font-bold text-emerald-400">
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
                          <div className="pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#1b3b2b]/60">
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <Clock size={13} />
                              <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div>
                              {isPending ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAccept(order.id, order.cropName)}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2f6f45] hover:bg-[#255b38] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
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
                                <span className="text-xs text-amber-300 font-medium bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl inline-block">
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
                className="space-y-4"
              >
                {/* View Header */}
                <div className="bg-[#0c1a14]/85 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package size={20} className="text-emerald-400" />
                      <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                        Active Harvest Listings ({open.length})
                      </h1>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Manage your listed crops, available stock, and check mandi price recommendations.
                    </p>
                  </div>
                  <Link
                    to="/farmer/add"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2f6f45] hover:bg-[#255b38] text-white text-xs font-semibold transition-all shadow-md self-start sm:self-auto cursor-pointer"
                  >
                    <PlusCircle size={15} />
                    <span>Add New Listing</span>
                  </Link>
                </div>

                {open.length === 0 ? (
                  <div className="rounded-3xl border border-[#1b3b2b]/80 bg-[#0c1a14]/90 backdrop-blur-md p-12 text-center space-y-3 shadow-2xl">
                    <Package size={36} className="mx-auto text-slate-500" />
                    <h3 className="text-base font-semibold text-white">No active listings found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      List your current crops to start receiving orders from direct buyers.
                    </p>
                    <Link
                      to="/farmer/add"
                      className="inline-block mt-2 px-4 py-2 rounded-xl bg-[#2f6f45] text-white text-xs font-semibold"
                    >
                      List Harvest Now
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {open.map((l) => (
                      <div
                        key={l.id}
                        className="rounded-3xl border border-[#1b3b2b]/80 bg-[#0c1a14]/90 backdrop-blur-md p-5 space-y-4 hover:border-emerald-500/40 transition-colors shadow-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-serif text-lg font-bold text-white">
                              {l.cropName}{' '}
                              {l.variety ? (
                                <span className="font-sans text-xs font-normal text-slate-400">
                                  ({l.variety})
                                </span>
                              ) : null}
                            </h3>
                            <div className="text-xs text-slate-300 mt-1 space-x-2">
                              <span>
                                Available: <strong className="text-white">{l.quantityKg} kg</strong>
                              </span>
                              <span>·</span>
                              <span>
                                Asking:{' '}
                                <strong className="text-emerald-400 font-bold">
                                  ₹{l.askingPrice}/kg
                                </strong>
                              </span>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#13281e] px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-[#214734]">
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
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#214734] px-3 py-2 text-xs font-medium hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer bg-[#11241b]"
                          >
                            <BarChart3 size={14} className="text-emerald-400" />
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
                className="space-y-4"
              >
                {/* View Header */}
                <div className="bg-[#0c1a14]/85 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={20} className="text-amber-400" />
                      <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                        Market Trends & Live Settlements
                      </h1>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Official APMC mandi benchmarks, grade spreads, and recent bank transfers.
                    </p>
                  </div>
                  <Link
                    to="/farmer/prices"
                    className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>All Crops Mandi Rates</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Mandi Benchmark Chart */}
                  <div className="lg:col-span-7 bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                          Official Mandi Benchmark
                        </span>
                        <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                          {topCrop.name} Price Trajectory
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5">
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
                  <div className="lg:col-span-5 bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                          Live Settlement
                        </span>
                        <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                          Recent Harvest Payout
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Batch ORD-2026-8801 · FreshRoots Organics
                        </p>
                      </div>
                      <span className="text-xs text-emerald-300 font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40">
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
                className="space-y-4"
              >
                {/* View Header */}
                <div className="bg-[#0c1a14]/85 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 sm:p-6 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <Activity size={20} className="text-emerald-400" />
                    <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      Farm Performance & Realization
                    </h1>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Summary metrics of harvest volume, active farmgate lots, and revenue potential.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Card 1: Active Listings */}
                  <div className="p-6 rounded-3xl bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 space-y-2 shadow-xl">
                    <div className="flex items-center justify-between text-slate-300 text-xs uppercase tracking-wider font-semibold">
                      <span>Active Listings</span>
                      <div className="w-8 h-8 rounded-lg bg-[#14281f] border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-4xl font-semibold text-white tracking-tight">
                      <AnimatedNumber value={activeListingsCount} />
                    </p>
                    <p className="text-xs text-slate-400">Available for direct buyer bids & orders</p>
                  </div>

                  {/* Card 2: Total Quantity Listed */}
                  <div className="p-6 rounded-3xl bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 space-y-2 shadow-xl">
                    <div className="flex items-center justify-between text-slate-300 text-xs uppercase tracking-wider font-semibold">
                      <span>Total Harvest Listed</span>
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-4xl font-semibold text-white tracking-tight">
                      <AnimatedNumber value={totalQuantity} />{' '}
                      <span className="text-lg font-normal text-slate-400">kg</span>
                    </p>
                    <p className="text-xs text-slate-400">Across grade-inspected crop batches</p>
                  </div>

                  {/* Card 3: Estimated Floor Value */}
                  <div className="p-6 rounded-3xl bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 space-y-2 shadow-xl">
                    <div className="flex items-center justify-between text-slate-300 text-xs uppercase tracking-wider font-semibold">
                      <span>Estimated Floor Value</span>
                      <div className="w-8 h-8 rounded-lg bg-[#14281f] border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                        ₹
                      </div>
                    </div>
                    <p className="text-4xl font-semibold text-emerald-400 tracking-tight">
                      ₹<AnimatedNumber value={totalEstimatedEarnings} />
                    </p>
                    <p className="text-xs text-slate-400">
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