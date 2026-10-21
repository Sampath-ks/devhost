import { useState, useMemo } from 'react'
import {
  Search,
  ShoppingBag,
  MapPin,
  CalendarDays,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  Sprout,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Truck,
  Store,
  Clock,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import { useAllListings, type OrderResult } from '@/hooks/useListings'
import { useOrders } from '@/hooks/useOrders'
import type { ProduceListing, QualityGrade } from '@/lib/produceTypes'
import { getPriceSuggestion } from '@/lib/priceService'
import { MARKETS } from '@/data/mandiPrices'
import OrderStepper from '@/components/ui/Stepper'
import SmartMultiFarmerRecommendation from '@/pages/buyer/SmartMultiFarmerRecommendation'
import {
  getFarmerDisplayName,
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

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30',
  Supplied: 'bg-sky-950/60 text-sky-400 border border-sky-500/30',
  'Sold Out': 'bg-amber-950/60 text-amber-400 border border-amber-500/30',
  Closed: 'bg-gray-800 text-gray-400 border border-gray-700',
}

const gradeStyles: Record<QualityGrade, { badge: string; text: string }> = {
  A: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', text: 'Grade A (Premium)' },
  B: { badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', text: 'Grade B (Standard)' },
  C: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', text: 'Grade C (Commercial)' },
}

export default function Marketplace() {
  const { allListings, placeOrder, placeBatchOrders } = useAllListings()
  const { buyerOrders, createOrder, createBatchOrders } = useOrders()

  const [viewTab, setViewTab] = useState<'catalog' | 'orders'>('catalog')
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

  // Farmer info modal state
  const [farmerInfoListing, setFarmerInfoListing] = useState<ProduceListing | null>(null)

  // Compute stats across all farmers' listings
  const stats = useMemo(() => {
    const totalListings = allListings.length
    const activeListings = allListings.filter((l) => l.status === 'Active')
    const totalKg = activeListings.reduce((sum, l) => sum + l.quantityKg, 0)
    const uniqueFarmers = new Set(allListings.map((l) => l.farmerId)).size
    const lowestPrice = activeListings.length > 0
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
    if (!query) return ''
    const match = availableCrops.find((c) => c.key === query || query.includes(c.key))
    return match ? match.displayName : ''
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
    // Create unified tracked order which triggers farmer notification (even for mock farmers)
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

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-buyer/15 text-buyer border border-buyer/30">
              <ShoppingBag size={12} /> Buyer Marketplace
            </span>
            <span className="text-xs text-muted">Direct Farmer Sourcing</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-text mt-2">Fresh Produce Market</h1>
          <p className="text-sm text-muted mt-1">
            Browse crops from all farmers, place orders, and track store delivery to collection.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-xl bg-surface-2 p-1 border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewTab('catalog')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewTab === 'catalog'
                ? 'bg-buyer text-text font-bold shadow'
                : 'text-muted hover:text-text'
            }`}
          >
            Browse Harvest ({allListings.length})
          </button>
          <button
            type="button"
            onClick={() => setViewTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              viewTab === 'orders'
                ? 'bg-buyer text-text font-bold shadow'
                : 'text-muted hover:text-text'
            }`}
          >
            <span>My Orders & Tracking</span>
            {buyerOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-surface text-[10px] font-bold">
                {buyerOrders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {viewTab === 'orders' ? (
        /* Orders & Live Tracking View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                <PackageCheck size={20} className="text-buyer" />
                Your Live Orders & Pickup Tracking ({buyerOrders.length})
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Real-time lifecycle tracking from farmer acceptance to Central Store collection.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewTab('catalog')}
              className="text-xs text-buyer hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Place another order
            </button>
          </div>

          {buyerOrders.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
              <ShoppingBag className="mx-auto text-muted/60" size={32} />
              <h3 className="text-base font-semibold text-text">No orders placed yet</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Explore the harvest catalog to order fresh produce directly from farmers.
              </p>
              <button
                type="button"
                onClick={() => setViewTab('catalog')}
                className="mt-2 px-4 py-2 rounded-xl bg-buyer text-text text-xs font-semibold hover:opacity-90 cursor-pointer"
              >
                Browse Harvest
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {buyerOrders.map((order) => {
                const isPending = order.status === 'PENDING_APPROVAL'
                const isAccepted = order.status === 'ACCEPTED'
                const isAtStore = order.status === 'DELIVERED_TO_STORE'
                const isCompleted = order.status === 'COLLECTED_BY_BUYER'
                const isRejected = order.status === 'REJECTED'

                return (
                  <div
                    key={order.id}
                    className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-buyer/40 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-buyer">#{order.id}</span>
                          <h3 className="font-serif text-lg font-bold text-text">
                            {order.cropName} <span className="font-sans text-xs font-normal text-muted">({order.variety})</span>
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-buyer/15 text-buyer border border-buyer/30">
                            Order Placed
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Farmer: <strong className="text-text">{getFarmerDisplayName(order.farmerId).name}</strong>{' '}
                          <span className="text-[11px] text-muted">({order.farmerId})</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-muted block">Order Total</span>
                        <span className="text-base font-bold text-buyer">
                          ₹{order.totalAmount.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted block">
                          {order.quantityKg >= 1
                            ? `${order.quantityKg} kg`
                            : `${Math.round(order.quantityKg * 1000)} g (${order.quantityKg} kg)`}{' '}
                          @ ₹{order.pricePerKg}/kg
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

                    {/* Status Advice Card */}
                    <div className="p-3 rounded-xl bg-surface-2/60 border border-border text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <Clock size={15} className="text-gold shrink-0 animate-pulse" />
                            <span className="text-gold font-medium">
                              Waiting for farmer to accept your order. You will receive a notification as soon as they respond.
                            </span>
                          </>
                        )}
                        {isAccepted && (
                          <>
                            <Truck size={15} className="text-emerald-400 shrink-0" />
                            <span className="text-emerald-300 font-medium">
                              Farmer accepted! The farmer is transporting the produce to the Central Store.
                            </span>
                          </>
                        )}
                        {isAtStore && (
                          <>
                            <Store size={15} className="text-sky-400 shrink-0" />
                            <span className="text-sky-300 font-medium">
                              Produce arrived at Central Store! Verified and ready for your collection.
                            </span>
                          </>
                        )}
                        {isCompleted && (
                          <>
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                            <span className="text-emerald-300 font-medium">
                              Order collected from Central Store. Transaction complete!
                            </span>
                          </>
                        )}
                        {isRejected && (
                          <>
                            <AlertCircle size={15} className="text-red-400 shrink-0" />
                            <span className="text-red-300 font-medium">
                              Farmer was unable to fulfill this order: {order.rejectionReason || 'Declined'}
                            </span>
                          </>
                        )}
                      </div>

                      <span className="text-[10px] text-muted shrink-0 ml-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Catalog View */
        <>
          {/* Quick Overview KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-muted flex items-center justify-between">
                <span>Available Harvest</span>
                <Sprout size={16} className="text-buyer" />
              </div>
              <div className="text-2xl font-semibold mt-2 text-text">
                {stats.totalKg.toLocaleString()} <span className="text-sm font-normal text-muted">kg</span>
              </div>
              <div className="text-xs text-muted mt-1">{stats.activeCount} active listings</div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-muted flex items-center justify-between">
                <span>Participating Farmers</span>
                <User size={16} className="text-buyer" />
              </div>
              <div className="text-2xl font-semibold mt-2 text-text">{stats.uniqueFarmers}</div>
              <div className="text-xs text-muted mt-1">Verified farm accounts</div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-muted flex items-center justify-between">
                <span>Starting Price</span>
                <ShieldCheck size={16} className="text-buyer" />
              </div>
              <div className="text-2xl font-semibold mt-2 text-text">
                ₹{stats.lowestPrice || 0} <span className="text-sm font-normal text-muted">/kg</span>
              </div>
              <div className="text-xs text-muted mt-1">Direct mandi-linked pricing</div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="text-xs text-muted flex items-center justify-between">
                <span>Total Catalog</span>
                <ShoppingBag size={16} className="text-buyer" />
              </div>
              <div className="text-2xl font-semibold mt-2 text-text">{stats.totalListings}</div>
              <div className="text-xs text-muted mt-1">Listings from all farmers</div>
            </div>
          </div>

          {/* Unified Search, Multi-Farmer Order & Filters Toolbar */}
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Crop Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    if (selectedCrop !== 'ALL' && e.target.value && !e.target.value.toLowerCase().includes(selectedCrop.toLowerCase())) {
                      setSelectedCrop('ALL')
                    }
                  }}
                  placeholder="Search by crop (e.g. Tomato, Onion, Potato), variety, or farmer..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm text-text placeholder:text-muted/60 outline-none focus:border-buyer focus:ring-1 focus:ring-buyer/30 transition-all"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch('')
                      setSelectedCrop('ALL')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Multi-Farmer Quantity & Unit Inputs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl px-3 py-1.5 focus-within:border-buyer focus-within:ring-1 focus-within:ring-buyer/30 transition-all">
                  <Sparkles size={14} className="text-buyer shrink-0" />
                  <span className="text-xs text-muted font-medium whitespace-nowrap">Needed Qty:</span>
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
                    className="w-20 bg-transparent text-sm font-bold text-text outline-none text-right placeholder:text-muted/50"
                  />
                  <select
                    value={requestedUnit}
                    onChange={(e) => setRequestedUnit(e.target.value as WeightUnit)}
                    className="bg-transparent text-xs font-semibold text-buyer outline-none cursor-pointer border-l border-border/80 pl-2"
                  >
                    <option value="g">g (grams)</option>
                    <option value="kg">kg</option>
                    <option value="quintal">quintals</option>
                    <option value="tonne">tonnes</option>
                  </select>
                </div>

                {/* Grade filter */}
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-text outline-none focus:border-buyer cursor-pointer"
                >
                  <option value="ALL">All Grades</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-text outline-none focus:border-buyer cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Supplied">Supplied</option>
                  <option value="Sold Out">Sold Out</option>
                </select>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-muted">
                  <ArrowUpDown size={14} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-text outline-none cursor-pointer"
                  >
                    <option value="recent">Newest Harvest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="qty_desc">Quantity: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter & Shortcut Chips */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
              {/* Crop Shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted text-[11px] font-medium mr-1">Crops:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCrop('ALL')
                    setSearch('')
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCrop === 'ALL' && !search
                      ? 'bg-buyer text-text shadow-sm'
                      : 'bg-surface-2 text-muted hover:text-text border border-border'
                  }`}
                >
                  All Products
                </button>
                {availableCrops.slice(0, 6).map((c) => {
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                        isActive
                          ? 'bg-buyer text-text shadow-sm'
                          : 'bg-surface-2 text-muted hover:text-text border border-border hover:border-buyer/40'
                      }`}
                    >
                      {c.displayName}
                    </button>
                  )
                })}
              </div>

              {/* Quantity Shortcut chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted text-[11px] font-medium mr-1">Multi-Farmer Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setRequestedQty(100)
                    setRequestedUnit('g')
                    if (!effectiveCrop) setSelectedCrop('Tomato')
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    requestedQty === 100 && requestedUnit === 'g'
                      ? 'bg-buyer text-text font-bold shadow-sm'
                      : 'bg-surface-2 text-muted hover:text-text border border-border'
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
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    requestedQty === 500 && requestedUnit === 'g'
                      ? 'bg-buyer text-text font-bold shadow-sm'
                      : 'bg-surface-2 text-muted hover:text-text border border-border'
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
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    requestedQty === 50 && requestedUnit === 'kg'
                      ? 'bg-buyer text-text font-bold shadow-sm'
                      : 'bg-surface-2 text-muted hover:text-text border border-border'
                  }`}
                >
                  50 kg
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestedQty(100)
                    setRequestedUnit('kg')
                    if (!effectiveCrop) setSelectedCrop('Tomato')
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    requestedQty === 100 && requestedUnit === 'kg'
                      ? 'bg-buyer text-text font-bold shadow-sm'
                      : 'bg-surface-2 text-muted hover:text-text border border-border'
                  }`}
                >
                  100 kg
                </button>
                {requestedQty > 0 && (
                  <button
                    type="button"
                    onClick={() => setRequestedQty(0)}
                    className="text-muted hover:text-text text-[11px] underline ml-1 cursor-pointer"
                  >
                    Clear Qty
                  </button>
                )}
              </div>
            </div>

            {/* Filter status tags */}
            {(search || selectedGrade !== 'ALL' || selectedStatus !== 'ALL') && (
              <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted flex-wrap">
                <span>Active filters:</span>
                {search && <span className="bg-surface-2 px-2 py-0.5 rounded-md border border-border">"{search}"</span>}
                {selectedGrade !== 'ALL' && (
                  <span className="bg-surface-2 px-2 py-0.5 rounded-md border border-border">Grade: {selectedGrade}</span>
                )}
                {selectedStatus !== 'ALL' && (
                  <span className="bg-surface-2 px-2 py-0.5 rounded-md border border-border">Status: {selectedStatus}</span>
                )}
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCrop('ALL')
                    setSelectedGrade('ALL')
                    setSelectedStatus('ALL')
                  }}
                  className="text-buyer hover:underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Smart Multi-Farmer Recommendation: Automatically shown when a crop & quantity are searched */}
          {requestedQty > 0 && (effectiveCrop || availableCrops[0]?.displayName) ? (
            <SmartMultiFarmerRecommendation
              listings={allListings}
              selectedCrop={effectiveCrop || availableCrops[0]?.displayName || 'Tomato'}
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
            /* Helper bar showing that products are already displayed below */
            <div className="bg-surface-2/70 border border-border/80 rounded-xl px-4 py-2.5 text-xs text-muted flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
              <span className="flex items-center gap-2">
                <Sparkles size={15} className="text-buyer shrink-0" />
                <span>
                  <strong>All available harvest products are displayed below.</strong> To get an automated multi-farmer recommendation, enter your required quantity above (e.g. 100 g or 50 kg) or click "Multi-Farmer" on any crop.
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
                className="text-buyer hover:underline font-semibold shrink-0 cursor-pointer text-[11px] self-start sm:self-auto"
              >
                Try 100 g Tomato example &rarr;
              </button>
            </div>
          )}

          {/* Produce Grid */}
          {filteredListings.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center space-y-3">
              <Sprout className="mx-auto text-muted" size={36} />
              <h3 className="text-lg font-medium text-text">No produce matches your search</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try adjusting your search filters or clearing search keywords to view produce from all farmers.
              </p>
              <button
                onClick={() => {
                  setSearch('')
                  setSelectedGrade('ALL')
                  setSelectedStatus('ALL')
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-buyer text-text text-xs font-semibold hover:opacity-90"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    className="group bg-surface border border-border hover:border-buyer/50 rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Grade & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                            gradeStyles[listing.qualityGrade]?.badge || 'bg-surface-2 text-text border-border'
                          }`}
                        >
                          {gradeStyles[listing.qualityGrade]?.text || `Grade ${listing.qualityGrade}`}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            statusStyles[listing.status] || 'bg-surface-2 text-muted'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </div>

                      {/* Crop Header + Optional Thumbnail */}
                      <div className="flex items-start gap-3 mb-3">
                        {imageSrc ? (
                          <div className="w-14 h-14 rounded-xl bg-surface-2 p-1 border border-border shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={imageSrc}
                              alt={listing.cropName}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-surface-2 border border-border shrink-0 flex items-center justify-center text-buyer">
                            <Sprout size={24} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-xl font-bold text-text truncate">
                            {listing.cropName}
                          </h3>
                          <p className="text-xs text-muted truncate">Variety: {listing.variety}</p>
                          <button
                            type="button"
                            onClick={() => setFarmerInfoListing(listing)}
                            className="mt-1 flex items-center gap-1 text-[11px] text-buyer/90 hover:text-buyer hover:underline truncate max-w-full"
                          >
                            <User size={11} className="shrink-0" />
                            <span className="truncate">Farmer: {listing.farmerId}</span>
                          </button>
                        </div>
                      </div>

                      {/* Quantity and Price grid */}
                      <div className="bg-surface-2/60 border border-border rounded-xl p-3 grid grid-cols-2 gap-2 my-3">
                        <div>
                          <span className="text-[11px] text-muted block">Available Quantity</span>
                          <span className="text-base font-semibold text-text">
                            {listing.quantityKg.toLocaleString()} <span className="text-xs font-normal text-muted">kg</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted block">Asking Price</span>
                          <span className="text-base font-semibold text-buyer">
                            ₹{listing.askingPrice} <span className="text-xs font-normal text-muted">/kg</span>
                          </span>
                        </div>
                      </div>

                      {/* Market comparison badge */}
                      {priceBenchmark && (
                        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border/80 flex items-center justify-between text-xs">
                          <span className="text-muted text-[11px]">Mandi avg ({MARKETS[0]}):</span>
                          <div className="flex items-center gap-1 font-medium">
                            <span>₹{priceBenchmark.benchmark}/kg</span>
                            {priceBenchmark.comparison === 'below' && (
                              <span className="text-emerald-400 flex items-center text-[11px]">
                                <TrendingDown size={12} className="mr-0.5" /> Best Deal
                              </span>
                            )}
                            {priceBenchmark.comparison === 'within' && (
                              <span className="text-sky-300 text-[11px]">Fair Rate</span>
                            )}
                            {priceBenchmark.comparison === 'above' && (
                              <span className="text-amber-300 flex items-center text-[11px]">
                                <TrendingUp size={12} className="mr-0.5" /> Premium
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location & Harvest Metadata */}
                      <div className="space-y-1 text-xs text-muted mb-4">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin size={13} className="shrink-0 text-muted" />
                          <span className="truncate">{listing.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={13} className="shrink-0 text-muted" />
                          <span>Harvested {listing.harvestDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="pt-3 border-t border-border flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => handleOpenOrder(listing)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSoldOut
                            ? 'bg-surface-2 text-muted cursor-not-allowed border border-border'
                            : 'bg-buyer text-text hover:opacity-90 shadow-md shadow-buyer/10'
                        }`}
                      >
                        <ShoppingBag size={14} />
                        <span>{isSoldOut ? 'Sold Out' : 'Order Listing'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSoldOut}
                        onClick={() => {
                          setSelectedCrop(listing.cropName)
                          setSearch(listing.cropName)
                          setRequestedQty(100)
                          setRequestedUnit('g')
                          window.scrollTo({ top: 120, behavior: 'smooth' })
                        }}
                        className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-surface-2 hover:bg-buyer/15 text-buyer border border-buyer/30 transition-all cursor-pointer"
                        title={`Get smart multi-farmer recommendation for ${listing.cropName}`}
                      >
                        <Sparkles size={13} />
                        <span className="hidden sm:inline">Multi-Farmer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFarmerInfoListing(listing)}
                        className="p-2 rounded-xl border border-border bg-surface-2 text-muted hover:text-text hover:border-buyer/50 transition-colors cursor-pointer"
                        title="View Farmer & Farm Details"
                      >
                        <User size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Order Produce Modal */}
      {orderingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-auth-in">
            <button
              onClick={() => setOrderingListing(null)}
              className="absolute top-4 right-4 text-muted hover:text-text"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2 text-buyer text-xs font-semibold uppercase tracking-wider">
              <ShoppingBag size={14} /> Direct Produce Order
            </div>
            <h2 className="text-xl font-serif font-bold text-text">
              Order {orderingListing.cropName} ({orderingListing.variety})
            </h2>
            <p className="text-xs text-muted mt-1">
              Farmer: <span className="text-text">{orderingListing.farmerId}</span> · {orderingListing.location}
            </p>

            {orderFeedback?.ok ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <div className="text-sm font-semibold">Order Placed Successfully!</div>
                <div className="text-xs text-emerald-300">
                  Order ID: <span className="font-mono font-bold">{orderFeedback.orderId}</span>
                </div>
                <div className="text-xs text-muted mt-1">
                  The listing quantity has been updated automatically.
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {orderFeedback?.error && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 text-red-400" />
                    <span>{orderFeedback.error}</span>
                  </div>
                )}

                <div className="p-3 bg-surface-2 rounded-xl border border-border space-y-1">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Available stock:</span>
                    <span className="font-semibold text-text">{orderingListing.quantityKg} kg</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Unit price:</span>
                    <span className="font-semibold text-buyer">₹{orderingListing.askingPrice}/kg</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Quality grade:</span>
                    <span className="font-semibold text-text">Grade {orderingListing.qualityGrade}</span>
                  </div>
                </div>

                {/* Quantity picker */}
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">
                    Order Quantity (kg)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderQty((prev) => Math.max(1, prev - 10))}
                      className="p-2 rounded-lg bg-surface-2 border border-border text-text hover:border-buyer cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={orderingListing.quantityKg}
                      value={orderQty}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setOrderQty(Math.min(orderingListing.quantityKg, Math.max(1, val)))
                      }}
                      className="flex-1 text-center py-2 bg-surface-2 border border-border rounded-lg text-sm text-text font-semibold outline-none focus:border-buyer"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOrderQty((prev) => Math.min(orderingListing.quantityKg, prev + 10))
                      }
                      className="p-2 rounded-lg bg-surface-2 border border-border text-text hover:border-buyer cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Total Cost preview */}
                <div className="p-3 rounded-xl bg-surface-2 border border-buyer/30 flex items-center justify-between">
                  <span className="text-xs text-muted">Estimated Total Cost:</span>
                  <span className="text-xl font-bold text-buyer">
                    ₹{(orderQty * orderingListing.askingPrice).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-buyer text-text text-sm font-semibold hover:opacity-90 shadow-md transition-all cursor-pointer"
                  >
                    Confirm Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderingListing(null)}
                    className="py-2.5 px-4 rounded-xl border border-border bg-surface-2 text-sm text-muted hover:text-text cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Farmer Contact & Details Modal */}
      {farmerInfoListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-auth-in">
            <button
              onClick={() => setFarmerInfoListing(null)}
              className="absolute top-4 right-4 text-muted hover:text-text"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 text-farmer text-xs font-semibold uppercase tracking-wider">
              <User size={14} /> Verified Farmer Information
            </div>

            <h3 className="text-xl font-serif font-bold text-text">{farmerInfoListing.farmerId}</h3>
            <p className="text-xs text-muted mt-1">
              Registered farm supplier on AgriMarketplace
            </p>

            <div className="mt-4 space-y-3 bg-surface-2 border border-border rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted">Farmer Identifier / Email:</span>
                <span className="font-mono text-text">{farmerInfoListing.farmerId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Farm Location:</span>
                <span className="text-text">{farmerInfoListing.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Listed Crop:</span>
                <span className="text-text font-medium">{farmerInfoListing.cropName} ({farmerInfoListing.variety})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Harvest Date:</span>
                <span className="text-text">{farmerInfoListing.harvestDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Quality Rating:</span>
                <span className="text-emerald-400 font-semibold">Grade {farmerInfoListing.qualityGrade} Verified</span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetListing = farmerInfoListing
                  setFarmerInfoListing(null)
                  handleOpenOrder(targetListing)
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-buyer text-text text-xs font-semibold hover:opacity-90"
              >
                Place Order with Farmer
              </button>
              <button
                type="button"
                onClick={() => setFarmerInfoListing(null)}
                className="py-2.5 px-4 rounded-xl border border-border bg-surface-2 text-xs text-muted hover:text-text"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
