import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  MapPin,
  CalendarDays,
  User,
  CheckCircle2,
  X,
  Sprout,
  Minus,
  Plus,
  Store,
  Clock,
  PackageCheck,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  LogOut,
  ListChecks,
  PlusCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clearSession } from '@/lib/session'
import { useAppStore } from '@/lib/store'
import { useAllListings, type OrderResult } from '@/hooks/useListings'
import { useOrders } from '@/hooks/useOrders'
import type { ProduceListing } from '@/lib/produceTypes'
import { getPriceSuggestion } from '@/lib/priceService'
import { MARKETS } from '@/data/mandiPrices'
import OrderTrackingCard from '@/components/orders/OrderTrackingCard'
import SmartMultiFarmerRecommendation from '@/pages/buyer/SmartMultiFarmerRecommendation'
import {
  type WeightUnit,
  type RecommendationStrategy,
} from '@/lib/recommendationUtils'

// Helper to find crop image if available
const CROP_IMAGES: Record<string, string> = {
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

type BuyerTab = 'marketplace' | 'orders'

export default function Marketplace() {
  const navigate = useNavigate()
  const { currentFarmer } = useAppStore()
  const { allListings, placeOrder, placeBatchOrders } = useAllListings()
  const { buyerOrders, createOrder, createBatchOrders } = useOrders()

  const [viewTab, setViewTab] = useState<BuyerTab>('marketplace')
  const [search, setSearch] = useState('')
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL')
  const [requestedQty, setRequestedQty] = useState<number>(0)
  const [requestedUnit, setRequestedUnit] = useState<WeightUnit>('kg')
  const [strategy, setStrategy] = useState<RecommendationStrategy>('cheapest')
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'qty_desc' | 'recent'>('recent')

  // Order modal state
  const [orderingListing, setOrderingListing] = useState<ProduceListing | null>(null)
  const [orderQty, setOrderQty] = useState<number>(10)
  const [orderFeedback, setOrderFeedback] = useState<OrderResult | null>(null)

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  // Compute stats across all farmers' listings
  const stats = useMemo(() => {
    const totalListings = allListings.length
    const activeListings = allListings.filter((l) => l.status === 'Active')
    const totalKg = activeListings.reduce((sum, l) => sum + l.quantityKg, 0)
    const uniqueFarmers = new Set(allListings.map((l) => l.farmerId)).size
    const lowestPrice =
      activeListings.length > 0
        ? Math.min(...activeListings.map((l) => l.askingPrice))
        : 0

    return { totalListings, activeCount: activeListings.length, totalKg, uniqueFarmers, lowestPrice }
  }, [allListings])

  // Discover active crops in the catalog for quick chips and recommendation targeting
  const availableCrops = useMemo(() => {
    const map = new Map<string, { displayName: string; farmerCount: number; totalKg: number }>()
    allListings.forEach((l) => {
      if (l.status === 'Active' && l.quantityKg > 0 && l.cropName) {
        const key = l.cropName.trim().toLowerCase()
        const existing = map.get(key)
        if (existing) {
          existing.farmerCount += 1
          existing.totalKg += l.quantityKg
        } else {
          map.set(key, { displayName: l.cropName.trim(), farmerCount: 1, totalKg: l.quantityKg })
        }
      }
    })
    return Array.from(map.entries()).map(([key, val]) => ({ key, ...val }))
  }, [allListings])

  // Crop to target for smart multi-farmer recommendation
  const effectiveCrop = useMemo(() => {
    if (selectedCrop !== 'ALL') return selectedCrop
    const query = search.trim().toLowerCase()
    if (!query) return availableCrops[0]?.displayName || 'Tomato'
    const match = availableCrops.find((c) => c.key === query || query.includes(c.key))
    return match ? match.displayName : availableCrops[0]?.displayName || 'Tomato'
  }, [selectedCrop, search, availableCrops])

  // Filter & sort
  const filteredListings = useMemo(() => {
    return allListings
      .filter((l) => {
        const query = search.trim().toLowerCase()
        const crop = (l.cropName || '').toLowerCase()
        const variety = (l.variety || '').toLowerCase()
        const farmer = (l.farmerId || '').toLowerCase()
        const loc = (l.location || '').toLowerCase()

        const matchesQuery =
          !query ||
          crop.includes(query) ||
          variety.includes(query) ||
          farmer.includes(query) ||
          loc.includes(query)

        const matchesCrop =
          selectedCrop === 'ALL' || l.cropName.trim().toLowerCase() === selectedCrop.trim().toLowerCase()

        const matchesGrade = selectedGrade === 'ALL' || l.qualityGrade === selectedGrade
        const matchesStatus =
          selectedStatus === 'ALL' ||
          l.status === selectedStatus ||
          (!l.status && selectedStatus === 'ALL')

        return matchesQuery && matchesCrop && matchesGrade && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.askingPrice - b.askingPrice
        if (sortBy === 'price_desc') return b.askingPrice - a.askingPrice
        if (sortBy === 'qty_desc') return b.quantityKg - a.quantityKg
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [allListings, search, selectedCrop, selectedGrade, selectedStatus, sortBy])

  const handleOpenOrder = (l: ProduceListing) => {
    setOrderingListing(l)
    setOrderQty(Math.min(50, l.quantityKg > 0 ? l.quantityKg : 1))
    setOrderFeedback(null)
  }

  const handleConfirmOrder = () => {
    if (!orderingListing) return
    placeOrder(orderingListing.id, orderQty)
    const newOrder = createOrder({
      listingId: orderingListing.id,
      cropName: orderingListing.cropName,
      variety: orderingListing.variety,
      farmerId: orderingListing.farmerId,
      quantityKg: orderQty,
      pricePerKg: orderingListing.askingPrice,
    })
    setOrderFeedback({ ok: true, orderId: newOrder.id })
    setTimeout(() => {
      setOrderingListing(null)
      setOrderFeedback(null)
      setViewTab('orders')
    }, 1200)
  }

  const NAV_ITEMS: { id: BuyerTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'marketplace',
      label: 'Produce Marketplace',
      icon: <Sprout size={17} />,
      badge: filteredListings.length,
    },
    {
      id: 'orders',
      label: 'My Orders & Tracking',
      icon: <PackageCheck size={17} />,
      badge: buyerOrders.length > 0 ? buyerOrders.length : undefined,
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

      {/* Main Layout with Side Dashboard */}
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

          {/* User / Farmer Profile Card */}
          <div className="border-b border-[#1b3b2b]/70 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold tracking-wider uppercase mb-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Verified Grower</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-white leading-snug">
                  {currentFarmer?.name || 'Ramesh Patil'}
                </h2>
                <div className="mt-2 text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-emerald-400 shrink-0" />
                    <span>
                      {currentFarmer?.village || 'Ozar'}, {currentFarmer?.district || 'Nashik'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Store size={13} className="text-emerald-400 shrink-0" />
                    <span>{currentFarmer?.distanceKm || '8.4'} km to Central Store</span>
                  </div>
                </div>
              </div>

              {/* Circular Avatar */}
              <div className="relative shrink-0 ml-3">
                <img
                  src="/assets/images/portraits/farmer_avatar.jpg"
                  alt={currentFarmer?.name || 'User'}
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
              const isActive = viewTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewTab(item.id)}
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
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#14281f] text-emerald-400 border border-[#214734]'
                        }`}
                      >
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

          {/* Sourcing Summary Snapshot */}
          <div className="border-t border-[#1b3b2b]/70 pt-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#5f9378] px-1">
              Market Snapshot
            </div>
            <div className="bg-[#102319]/80 border border-[#214734]/70 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Available:</span>
                <span className="font-bold text-white">{stats.totalKg.toLocaleString()} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Farmers:</span>
                <span className="font-semibold text-white">{stats.uniqueFarmers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Starting Rate:</span>
                <span className="font-bold text-emerald-400">₹{stats.lowestPrice || 0}/kg</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#1b3b2b]/80 pt-1.5">
                <span className="text-slate-400">Active Listings:</span>
                <span className="font-semibold text-white">{stats.activeCount} batches</span>
              </div>
            </div>
          </div>

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
            {/* VIEW 1: UNIFIED SINGLE PRODUCE MARKETPLACE */}
            {viewTab === 'marketplace' && (
              <motion.div
                key="marketplace"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Search, Quantity & Filters Bar */}
                <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-2xl">
                  <div className="flex flex-col lg:flex-row gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" size={16} />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value)
                          if (
                            selectedCrop !== 'ALL' &&
                            e.target.value &&
                            !e.target.value.toLowerCase().includes(selectedCrop.toLowerCase())
                          ) {
                            setSelectedCrop('ALL')
                          }
                        }}
                        placeholder="Search by crop..."
                        className="w-full pl-10 pr-8 py-2 bg-[#13281e]/90 border border-[#214734] rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 transition-all shadow-inner"
                      />
                      {search && (
                        <button
                          onClick={() => {
                            setSearch('')
                            setSelectedCrop('ALL')
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Quantity & Unit input for auto-split recommendation */}
                    <div className="flex items-center gap-1.5 bg-[#13281e]/90 border border-[#214734] rounded-2xl px-3 py-1.5 transition-all">
                      <Sparkles size={14} className="text-amber-400 shrink-0" />
                      <span className="text-xs text-slate-300 font-semibold whitespace-nowrap">Needed Qty:</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={requestedQty || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          setRequestedQty(isNaN(val) ? 0 : Math.max(0, val))
                          if (!search && selectedCrop === 'ALL') {
                            setSelectedCrop('Tomato')
                          }
                        }}
                        placeholder="e.g. 100"
                        className="w-20 bg-transparent text-sm font-bold text-white outline-none text-right placeholder:text-slate-400"
                      />
                      <select
                        value={requestedUnit}
                        onChange={(e) => setRequestedUnit(e.target.value as WeightUnit)}
                        className="bg-transparent text-xs font-semibold text-emerald-400 outline-none cursor-pointer border-l border-[#214734] pl-2"
                      >
                        <option value="g" className="bg-[#0c1a14] text-white">g</option>
                        <option value="kg" className="bg-[#0c1a14] text-white">kg</option>
                        <option value="quintal" className="bg-[#0c1a14] text-white">quintal</option>
                        <option value="tonne" className="bg-[#0c1a14] text-white">tonne</option>
                      </select>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="bg-[#13281e]/90 border border-[#214734] text-slate-200 text-xs font-semibold rounded-2xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="ALL" className="bg-[#0c1a14] text-white">All Grades</option>
                        <option value="A" className="bg-[#0c1a14] text-white">Grade A</option>
                        <option value="B" className="bg-[#0c1a14] text-white">Grade B</option>
                        <option value="C" className="bg-[#0c1a14] text-white">Grade C</option>
                      </select>

                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-[#13281e]/90 border border-[#214734] text-slate-200 text-xs font-semibold rounded-2xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="ALL" className="bg-[#0c1a14] text-white">All Statuses</option>
                        <option value="Active" className="bg-[#0c1a14] text-white">Active Only</option>
                        <option value="Supplied" className="bg-[#0c1a14] text-white">Supplied</option>
                        <option value="Sold Out" className="bg-[#0c1a14] text-white">Sold Out</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-[#13281e]/90 border border-[#214734] text-slate-200 text-xs font-semibold rounded-2xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="recent" className="bg-[#0c1a14] text-white">Newest Harvest</option>
                        <option value="price_asc" className="bg-[#0c1a14] text-white">Price: Low to High</option>
                        <option value="price_desc" className="bg-[#0c1a14] text-white">Price: High to Low</option>
                        <option value="qty_desc" className="bg-[#0c1a14] text-white">Quantity: High to Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Crop Filter Chips & Presets */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1b3b2b]/70 text-xs">
                    {/* Crop chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400 text-xs font-semibold mr-1">Crops:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCrop('ALL')
                          setSearch('')
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          selectedCrop === 'ALL' && !search
                            ? 'bg-[#2f6f45] text-white shadow-sm'
                            : 'bg-[#13281e]/80 text-slate-300 hover:text-white border border-[#214734]'
                        }`}
                      >
                        All Products
                      </button>
                      {availableCrops.map((c) => {
                        const isActive =
                          selectedCrop.toLowerCase() === c.key || search.trim().toLowerCase() === c.key
                        return (
                          <button
                            key={c.key}
                            type="button"
                            onClick={() => {
                              setSelectedCrop(c.displayName)
                              setSearch(c.displayName)
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer capitalize ${
                              isActive
                                ? 'bg-[#2f6f45] text-white shadow-sm'
                                : 'bg-[#13281e]/80 text-slate-300 hover:text-white border border-[#214734] hover:border-emerald-500/40'
                            }`}
                          >
                            {c.displayName}
                          </button>
                        )
                      })}
                    </div>

                    {/* Quantity shortcut presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400 text-xs font-semibold mr-1">Split Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestedQty(100)
                          setRequestedUnit('g')
                          if (!effectiveCrop) setSelectedCrop('Tomato')
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          requestedQty === 100 && requestedUnit === 'g'
                            ? 'bg-[#2f6f45] text-white font-bold shadow-sm'
                            : 'bg-[#13281e]/80 text-slate-300 hover:text-white border border-[#214734]'
                        }`}
                      >
                        100 g
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestedQty(500)
                          setRequestedUnit('g')
                          if (!effectiveCrop) setSelectedCrop('Tomato')
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          requestedQty === 500 && requestedUnit === 'g'
                            ? 'bg-[#2f6f45] text-white font-bold shadow-sm'
                            : 'bg-[#13281e]/80 text-slate-300 hover:text-white border border-[#214734]'
                        }`}
                      >
                        500 g
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestedQty(50)
                          setRequestedUnit('kg')
                          if (!effectiveCrop) setSelectedCrop('Tomato')
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          requestedQty === 50 && requestedUnit === 'kg'
                            ? 'bg-[#2f6f45] text-white font-bold shadow-sm'
                            : 'bg-[#13281e]/80 text-slate-300 hover:text-white border border-[#214734]'
                        }`}
                      >
                        50 kg
                      </button>
                      {requestedQty > 0 && (
                        <button
                          type="button"
                          onClick={() => setRequestedQty(0)}
                          className="text-slate-400 hover:text-white text-[11px] underline ml-1 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* AUTOMATIC SMART MULTI-FARMER RECOMMENDATION: Shown right here when a quantity is specified */}
                {requestedQty > 0 ? (
                  <SmartMultiFarmerRecommendation
                    listings={allListings}
                    selectedCrop={effectiveCrop}
                    quantity={requestedQty}
                    unit={requestedUnit}
                    strategy={strategy}
                    onStrategyChange={setStrategy}
                    onClear={() => setRequestedQty(0)}
                    onAdjustQuantity={(newQty) => setRequestedQty(newQty)}
                    placeBatchOrders={placeBatchOrders}
                    createBatchOrders={createBatchOrders}
                    onFarmerClick={(l) => setFarmerInfoListing(l)}
                    onNavigateToOrders={() => setViewTab('orders')}
                  />
                ) : (
                  /* Subtle informative bar matching design */
                  <div className="bg-[#0c1a14]/85 backdrop-blur-md border border-[#1b3b2b]/80 rounded-2xl px-4 py-2.5 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-lg">
                    <span className="flex items-center gap-2">
                      <Sprout size={16} className="text-emerald-400 shrink-0" />
                      <span>
                        <strong>All harvest produce is displayed below.</strong> Enter your needed quantity above (e.g. 100 g or 50 kg) to automatically combine stock across multiple farmers!
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRequestedQty(100)
                        setRequestedUnit('g')
                        setSelectedCrop('Tomato')
                        setSearch('Tomato')
                      }}
                      className="text-amber-300 hover:underline font-semibold shrink-0 cursor-pointer text-xs self-start sm:self-auto"
                    >
                      Try 100 g Tomato example &rarr;
                    </button>
                  </div>
                )}

                {/* Section Title */}
                <div className="flex items-center justify-between pt-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Sprout size={19} className="text-emerald-400" />
                    Available Harvest Produce ({filteredListings.length})
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <MapPin size={14} className="text-emerald-400" />
                    <span>Direct from local farms</span>
                  </div>
                </div>

                {/* Listings Grid (4 Columns) */}
                {filteredListings.length === 0 ? (
                  <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-12 text-center space-y-3 shadow-2xl">
                    <Sprout className="mx-auto text-slate-500" size={36} />
                    <h3 className="text-lg font-medium text-white">No produce matches your search</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Try adjusting your search filters or clearing search keywords.
                    </p>
                    <button
                      onClick={() => {
                        setSearch('')
                        setSelectedGrade('ALL')
                        setSelectedStatus('ALL')
                        setSelectedCrop('ALL')
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2f6f45] text-white text-xs font-semibold hover:opacity-90 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredListings.map((listing) => {
                      const cropKey = listing.cropName.trim().toLowerCase()
                      const imageSrc = CROP_IMAGES[cropKey]
                      const priceBenchmark = getPriceSuggestion({
                        crop: listing.cropName,
                        market: MARKETS[0] || 'Mangaluru',
                        askingPrice: listing.askingPrice,
                        grade: listing.qualityGrade,
                      })

                      const isSoldOut = listing.status === 'Sold Out' || listing.quantityKg <= 0

                      return (
                        <div
                          key={listing.id}
                          className="group bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 hover:border-emerald-500/50 rounded-3xl p-3.5 shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                        >
                          <div>
                            {/* Card Image Banner */}
                            <div className="relative h-28 sm:h-32 rounded-2xl overflow-hidden mb-3 bg-[#11241b] border border-[#214734]/60">
                              <div
                                className="absolute inset-0 bg-cover bg-center opacity-40"
                                style={{ backgroundImage: `url('/assets/images/portals/buyer.jpg')` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a14] via-transparent to-black/30" />

                              {imageSrc && (
                                <div className="absolute inset-0 flex items-center justify-center p-2">
                                  <img
                                    src={imageSrc}
                                    alt={listing.cropName}
                                    className="h-20 w-24 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}

                              {/* Badges Overlay */}
                              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#13281e]/90 text-emerald-300 border border-emerald-500/40 shadow-sm backdrop-blur-sm">
                                  Grade {listing.qualityGrade} ({listing.qualityGrade === 'A' ? 'Premium' : listing.qualityGrade === 'B' ? 'Standard' : 'Commercial'})
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-sm ${
                                    isSoldOut
                                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                  }`}
                                >
                                  {listing.status || 'Active'}
                                </span>
                              </div>
                            </div>

                            {/* Crop Info */}
                            <div className="space-y-1 mb-2.5">
                              <div className="flex items-center gap-1.5">
                                <Sprout size={14} className="text-emerald-400 shrink-0" />
                                <h3 className="font-serif text-base font-bold text-white truncate">
                                  {listing.cropName}
                                </h3>
                              </div>
                              <p className="text-xs text-slate-400 truncate">
                                Variety: {listing.variety}
                              </p>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                                <User size={11} className="text-emerald-400 shrink-0" />
                                <span className="truncate">Farmer: {listing.farmerId}</span>
                              </div>
                            </div>

                            {/* Available Stock & Asking Price */}
                            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[#13281e]/90 border border-[#214734]/70 mb-2">
                              <div>
                                <span className="block text-[10px] text-slate-400">Available Stock</span>
                                <strong className="text-sm font-bold text-white">
                                  {listing.quantityKg} kg
                                </strong>
                              </div>
                              <div className="text-right">
                                <span className="block text-[10px] text-slate-400">Asking Price</span>
                                <strong className="text-sm font-bold text-emerald-400">
                                  ₹{listing.askingPrice} <span className="text-xs font-normal text-slate-400">/kg</span>
                                </strong>
                              </div>
                            </div>

                            {/* Mandi Benchmark Price Comparison */}
                            {priceBenchmark ? (
                              <div className="p-1.5 rounded-xl bg-[#102319] border border-[#214734]/50 mb-2 text-[10px] text-slate-300 flex items-center justify-between">
                                <span className="truncate">
                                  Mandi avg ({MARKETS[0] || 'Mangaluru'}): ₹{priceBenchmark.benchmark}/kg
                                </span>
                                <span
                                  className={`font-semibold shrink-0 ml-1 ${
                                    priceBenchmark.comparison === 'above'
                                      ? 'text-amber-300'
                                      : priceBenchmark.comparison === 'below'
                                      ? 'text-emerald-300'
                                      : 'text-emerald-400'
                                  }`}
                                >
                                  {priceBenchmark.comparison === 'above'
                                    ? '↗ Premium'
                                    : priceBenchmark.comparison === 'below'
                                    ? 'Best Deal'
                                    : 'Fair Rate'}
                                </span>
                              </div>
                            ) : (
                              <div className="p-1.5 rounded-xl bg-[#102319]/50 border border-[#214734]/30 mb-2 text-[10px] text-slate-400 flex items-center justify-between">
                                <span className="truncate">Direct Farm Gate Rate</span>
                                <span className="text-emerald-400 font-medium text-[10px]">Verified</span>
                              </div>
                            )}

                            {/* Location & Harvest Date */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#1b3b2b]/60">
                              <span className="flex items-center gap-1 truncate">
                                <MapPin size={10} className="text-emerald-400 shrink-0" />
                                <span className="truncate">{listing.location || 'Nashik'}</span>
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <CalendarDays size={10} className="text-emerald-400" />
                                <span>{new Date(listing.createdAt).toISOString().split('T')[0]}</span>
                              </span>
                            </div>
                          </div>

                          {/* Purchase Action Button */}
                          <div className="mt-3 pt-2">
                            <button
                              type="button"
                              disabled={isSoldOut}
                              onClick={() => handleOpenOrder(listing)}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isSoldOut
                                  ? 'bg-[#15281e] text-slate-500 cursor-not-allowed border border-[#214734]'
                                  : 'bg-[#2f6f45] hover:bg-[#255b38] text-white shadow-md shadow-emerald-950/40'
                              }`}
                            >
                              <ShoppingBag size={13} />
                              <span>{isSoldOut ? 'Sold Out' : 'Direct Order'}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 2: BUYER ORDERS & TRACKING */}
            {viewTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="bg-[#0c1a14]/85 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                      <PackageCheck size={22} className="text-emerald-400" />
                      My Orders & Central Store Tracking
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Monitor farmgate shipments, quality grading at Central Store, and pick-up readiness.
                    </p>
                  </div>
                  <span className="text-xs text-slate-300 px-3 py-1.5 rounded-full bg-[#13281e] border border-[#214734] self-start sm:self-auto font-semibold">
                    {buyerOrders.length} Total Orders Placed
                  </span>
                </div>

                {buyerOrders.length === 0 ? (
                  <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-12 text-center space-y-3 shadow-2xl">
                    <ShoppingBag size={36} className="mx-auto text-slate-500" />
                    <h3 className="text-lg font-medium text-white">No orders placed yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Browse available produce from local farmers and place direct farmgate orders.
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewTab('marketplace')}
                      className="mt-2 px-4 py-2 rounded-xl bg-[#2f6f45] text-white text-xs font-semibold cursor-pointer"
                    >
                      Browse Produce Marketplace
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {buyerOrders.map((order) => (
                      <OrderTrackingCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ─── ORDER MODAL ─── */}
      {orderingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-auth-fade">
          <div className="w-full max-w-md bg-[#0c1a14] border border-[#214734] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b3b2b]/70 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-emerald-400" size={18} />
                <h3 className="font-serif text-lg font-bold text-white">
                  Place Direct Harvest Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderingListing(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {orderFeedback?.ok ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <h4 className="font-bold text-sm text-white">Order Successfully Placed!</h4>
                <p className="text-xs text-slate-300">
                  Order #{orderFeedback.orderId} sent to farmer. Redirecting to tracking...
                </p>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-[#13281e]/80 border border-[#214734] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{orderingListing.cropName}</span>
                    <span className="font-bold text-emerald-400">₹{orderingListing.askingPrice}/kg</span>
                  </div>
                  <p className="text-xs text-slate-400">Variety: {orderingListing.variety}</p>
                  <p className="text-xs text-slate-400">Available: {orderingListing.quantityKg} kg</p>
                </div>

                {/* Quantity selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Order Quantity (kg)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderQty(Math.max(1, orderQty - 5))}
                      className="w-9 h-9 rounded-xl bg-[#13281e] border border-[#214734] text-white flex items-center justify-center hover:bg-[#1a382a] cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={orderingListing.quantityKg}
                      value={orderQty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setOrderQty(Math.min(orderingListing.quantityKg, Math.max(1, val)))
                      }}
                      className="flex-1 text-center py-2 bg-[#13281e] border border-[#214734] rounded-xl text-white font-bold text-sm outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setOrderQty(Math.min(orderingListing.quantityKg, orderQty + 5))}
                      className="w-9 h-9 rounded-xl bg-[#13281e] border border-[#214734] text-white flex items-center justify-center hover:bg-[#1a382a] cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="p-3 rounded-2xl bg-[#13281e]/60 border border-[#214734]/60 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Farmgate Subtotal:</span>
                    <span className="font-semibold text-white">₹{orderQty * orderingListing.askingPrice}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Central Store Platform Fee:</span>
                    <span className="text-emerald-400 font-semibold">₹0 (Free direct)</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm border-t border-[#1b3b2b] pt-1.5 mt-1">
                    <span>Total Payment:</span>
                    <span className="text-emerald-400">₹{orderQty * orderingListing.askingPrice}</span>
                  </div>
                </div>

                {/* Confirm order button */}
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  className="w-full py-3 px-4 rounded-xl bg-[#2f6f45] hover:bg-[#255b38] text-white font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>Confirm Farmgate Order (₹{orderQty * orderingListing.askingPrice})</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
