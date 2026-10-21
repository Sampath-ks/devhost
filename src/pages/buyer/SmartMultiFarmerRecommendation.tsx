import { useState, useMemo } from 'react'
import {
  Sparkles,
  ShoppingBag,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Truck,
  RotateCcw,
  X,
} from 'lucide-react'
import type { ProduceListing, QualityGrade } from '@/lib/produceTypes'
import type { MarketplaceOrder } from '@/types/order'
import {
  UNIT_CONFIGS,
  gradeStyles,
  getFarmerDisplayName,
  formatUnitAmount,
  type WeightUnit,
  type RecommendationStrategy,
  type RecommendedFarmerItem,
  type RecommendationResult,
} from '@/lib/recommendationUtils'
import { getSession } from '@/lib/session'

interface SmartMultiFarmerRecommendationProps {
  listings: ProduceListing[]
  selectedCrop: string
  quantity: number
  unit: WeightUnit
  strategy?: RecommendationStrategy
  onStrategyChange?: (strategy: RecommendationStrategy) => void
  onClear?: () => void
  onAdjustQuantity?: (quantity: number) => void
  onBatchOrderPlaced?: (orders: MarketplaceOrder[]) => void
  onNavigateToOrders?: () => void
  onFarmerClick?: (listing: ProduceListing) => void
  placeBatchOrders: (orders: Array<{ listingId: string; quantityKg: number }>) => {
    ok: boolean
    sales?: any[]
    error?: string
  }
  createBatchOrders: (
    items: Array<{
      listingId: string
      cropName: string
      variety: string
      farmerId: string
      quantityKg: number
      pricePerKg: number
    }>
  ) => MarketplaceOrder[]
}

export default function SmartMultiFarmerRecommendation({
  listings,
  selectedCrop,
  quantity,
  unit,
  strategy = 'cheapest',
  onStrategyChange,
  onClear,
  onAdjustQuantity,
  onBatchOrderPlaced,
  onNavigateToOrders,
  onFarmerClick,
  placeBatchOrders,
  createBatchOrders,
}: SmartMultiFarmerRecommendationProps) {
  // Ordering & modal feedback states
  const [isOrdering, setIsOrdering] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [successOrders, setSuccessOrders] = useState<MarketplaceOrder[] | null>(null)

  // Recommendation engine: computes combination of farmers selling the same selected crop
  const recommendation = useMemo<RecommendationResult>(() => {
    const cropKey = (selectedCrop || '').trim().toLowerCase()
    const targetKg = (quantity || 0) * UNIT_CONFIGS[unit].toKg

    if (!cropKey || quantity <= 0 || targetKg <= 0) {
      return {
        status: 'invalid_input',
        cropName: selectedCrop,
        targetKg: 0,
        totalAvailableKg: 0,
        totalAllocatedKg: 0,
        totalPrice: 0,
        effectiveAvgPricePerKg: 0,
        shortfallKg: 0,
        items: [],
        farmerCount: 0,
      }
    }

    // STRICT: Only active listings selling the EXACT same selected crop
    const matchingListings = listings.filter(
      (l) =>
        l.status === 'Active' &&
        l.quantityKg > 0 &&
        l.cropName.trim().toLowerCase() === cropKey
    )

    const totalAvailableKg = matchingListings.reduce((sum, l) => sum + l.quantityKg, 0)

    if (matchingListings.length === 0 || totalAvailableKg <= 0) {
      return {
        status: 'no_stock',
        cropName: selectedCrop,
        targetKg,
        totalAvailableKg: 0,
        totalAllocatedKg: 0,
        totalPrice: 0,
        effectiveAvgPricePerKg: 0,
        shortfallKg: targetKg,
        items: [],
        farmerCount: 0,
      }
    }

    // 1. Group listings so each unique farmer is recommended individually (no duplicate farmers)
    const farmerMap = new Map<string, ProduceListing>()
    matchingListings.forEach((listing) => {
      const fId = (listing.farmerId || '').toLowerCase().trim()
      const existing = farmerMap.get(fId)
      if (!existing || listing.askingPrice < existing.askingPrice) {
        farmerMap.set(fId, listing)
      }
    })
    const uniqueFarmerListings = Array.from(farmerMap.values())

    // 2. Sort matching farmers: Prioritize logged-in farmer if they produce this crop, then apply strategy
    const session = getSession()
    const activeFarmerEmail = (session?.role === 'farmer' ? session.email : '').toLowerCase().trim()

    const sorted = [...uniqueFarmerListings].sort((a, b) => {
      const aIsCurrent = Boolean(activeFarmerEmail && a.farmerId.toLowerCase().trim() === activeFarmerEmail)
      const bIsCurrent = Boolean(activeFarmerEmail && b.farmerId.toLowerCase().trim() === activeFarmerEmail)
      if (aIsCurrent && !bIsCurrent) return -1
      if (!aIsCurrent && bIsCurrent) return 1

      if (strategy === 'cheapest') {
        if (a.askingPrice !== b.askingPrice) return a.askingPrice - b.askingPrice
        return b.quantityKg - a.quantityKg
      }
      if (strategy === 'highest_grade') {
        const gradeRank: Record<QualityGrade, number> = { A: 3, B: 2, C: 1 }
        const rA = gradeRank[a.qualityGrade] || 0
        const rB = gradeRank[b.qualityGrade] || 0
        if (rA !== rB) return rB - rA
        return a.askingPrice - b.askingPrice
      }
      // 'fewest_farmers'
      if (b.quantityKg !== a.quantityKg) return b.quantityKg - a.quantityKg
      return a.askingPrice - b.askingPrice
    })

    // Greedy allocation: allocate required amount without exceeding requested total or farmer stock
    let remainingNeededKg = Math.round(targetKg * 1000) / 1000
    const allocations: RecommendedFarmerItem[] = []

    for (const listing of sorted) {
      if (remainingNeededKg <= 0.0001) break

      const takeKg = Math.min(listing.quantityKg, remainingNeededKg)
      const roundedTakeKg = Math.round(takeKg * 1000) / 1000

      if (roundedTakeKg > 0) {
        const itemTotal = Math.round(roundedTakeKg * listing.askingPrice * 100) / 100
        const farmerInfo = getFarmerDisplayName(listing.farmerId)
        const allocatedInUnit = Number((roundedTakeKg / UNIT_CONFIGS[unit].toKg).toFixed(2))

        allocations.push({
          listing,
          farmerId: listing.farmerId,
          farmerName: farmerInfo.name,
          farmName: farmerInfo.farm,
          availableKg: listing.quantityKg,
          allocatedKg: roundedTakeKg,
          allocatedInUnit,
          pricePerKg: listing.askingPrice,
          itemTotal,
          percentOfTotal: 0,
        })

        remainingNeededKg = Math.max(0, Math.round((remainingNeededKg - roundedTakeKg) * 1000) / 1000)
      }
    }

    const totalAllocatedKg = allocations.reduce((sum, item) => sum + item.allocatedKg, 0)
    const totalPrice = allocations.reduce((sum, item) => sum + item.itemTotal, 0)
    const effectiveAvgPricePerKg =
      totalAllocatedKg > 0 ? Math.round((totalPrice / totalAllocatedKg) * 100) / 100 : 0

    // Compute each farmer's share percentage
    allocations.forEach((item) => {
      item.percentOfTotal =
        totalAllocatedKg > 0 ? Math.round((item.allocatedKg / totalAllocatedKg) * 100) : 0
    })

    const isExact = remainingNeededKg <= 0.0001

    return {
      status: isExact ? 'exact_match' : 'partial_alternative',
      cropName: matchingListings[0]?.cropName || selectedCrop,
      targetKg,
      totalAvailableKg,
      totalAllocatedKg,
      totalPrice: Math.round(totalPrice * 100) / 100,
      effectiveAvgPricePerKg,
      shortfallKg: remainingNeededKg,
      items: allocations,
      farmerCount: allocations.length,
    }
  }, [selectedCrop, quantity, unit, strategy, listings])

  // Handle batch ordering from all recommended farmers
  const handlePlaceOrdersFromAllFarmers = () => {
    if (!recommendation.items || recommendation.items.length === 0) return
    setIsOrdering(true)
    setOrderError(null)

    try {
      // 1. Deduct stock from listings atomically (safe for mock or real farmers)
      const listingOrders = recommendation.items.map((item) => ({
        listingId: item.listing.id,
        quantityKg: item.allocatedKg,
      }))

      try {
        const batchResult = placeBatchOrders(listingOrders)
        if (!batchResult.ok) {
          console.warn('Batch stock reservation note:', batchResult.error)
        }
      } catch (stockErr) {
        console.warn('Listing stock update non-fatal note:', stockErr)
      }

      // 2. Create individual orders in orders state & dispatch notifications to each farmer
      const ordersPayload = recommendation.items.map((item) => ({
        listingId: item.listing.id,
        cropName: item.listing.cropName,
        variety: item.listing.variety || 'Standard',
        farmerId: item.listing.farmerId,
        quantityKg: item.allocatedKg,
        pricePerKg: item.listing.askingPrice,
      }))

      const createdOrders = createBatchOrders(ordersPayload)

      setSuccessOrders(createdOrders)
      setIsOrdering(false)
      onBatchOrderPlaced?.(createdOrders)
    } catch (err: any) {
      setOrderError(err?.message || 'An unexpected error occurred while placing orders.')
      setIsOrdering(false)
    }
  }

  // Adjust to maximum available stock helper
  const handleAdjustToMaxAvailable = () => {
    if (recommendation.totalAvailableKg > 0) {
      const config = UNIT_CONFIGS[unit]
      const converted = Number((recommendation.totalAvailableKg / config.toKg).toFixed(2))
      onAdjustQuantity?.(converted)
    }
  }

  // Return null if no valid quantity or crop specified
  if (!quantity || quantity <= 0 || !selectedCrop || selectedCrop === 'ALL') {
    return null
  }

  return (
    <div className="rounded-2xl border-2 border-buyer bg-gradient-to-b from-surface-2 via-surface to-surface p-5 sm:p-6 shadow-xl shadow-buyer/10 space-y-5 animate-in fade-in duration-300">
      {/* Header with Title, Strategy, and Close button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-buyer/20 text-buyer border border-buyer/35 shadow-inner">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-text capitalize">
                {recommendation.farmerCount === 1
                  ? `Order Recommendation: ${quantity} ${unit} of ${selectedCrop}`
                  : `Multi-Farmer Recommendation: ${quantity} ${unit} of ${selectedCrop}`}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-buyer/20 text-buyer border border-buyer/35 uppercase">
                {recommendation.farmerCount === 1
                  ? '1 Farmer Fulfills 100%'
                  : `${recommendation.farmerCount} Farmers Combined`}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {recommendation.farmerCount === 1 ? (
                <>Single farmer meeting your exact requirement of <strong>{selectedCrop}</strong> at optimal pricing.</>
              ) : (
                <>Automated combination fulfilling your exact requirement of <strong>{selectedCrop}</strong> from multiple local farmers.</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Strategy selector */}
          <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl px-2.5 py-1.5 text-xs text-muted">
            <Layers size={13} className="text-buyer shrink-0" />
            <select
              value={strategy}
              onChange={(e) => onStrategyChange?.(e.target.value as RecommendationStrategy)}
              className="bg-transparent text-text font-semibold outline-none cursor-pointer text-xs"
            >
              <option value="cheapest">Cheapest First</option>
              <option value="highest_grade">Highest Quality Grade</option>
              <option value="fewest_farmers">Fewest Farmers</option>
            </select>
          </div>

          {/* Dismiss / Clear button */}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              title="Close recommendation and view all products"
              className="p-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-border text-muted hover:text-text cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* No Stock Warning */}
      {recommendation.status === 'no_stock' && (
        <div className="bg-surface-2/60 border border-dashed border-amber-500/40 rounded-xl p-5 text-center space-y-2">
          <AlertCircle size={26} className="mx-auto text-amber-400" />
          <h3 className="text-sm font-bold text-text">No Available Stock for {selectedCrop}</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            None of the farmers currently have active stock for this crop. Please select another crop or clear the quantity.
          </p>
        </div>
      )}

      {/* Fulfillment Banner */}
      {recommendation.status === 'exact_match' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl px-4 py-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-emerald-300">
                {recommendation.farmerCount === 1
                  ? 'Farmer Match Found (100% Fulfilled)'
                  : 'Exact Multi-Farmer Match Found (100% Fulfilled)'}
              </span>
              <p className="text-emerald-400/80 text-[11px] mt-0.5">
                {recommendation.farmerCount === 1 ? (
                  <>
                    Stock from <strong>1 farmer</strong> fulfills your exact requirement of{' '}
                    <strong>{formatUnitAmount(recommendation.targetKg, unit)}</strong> of <strong className="capitalize">{recommendation.cropName}</strong>.
                  </>
                ) : (
                  <>
                    Collective stock from <strong>{recommendation.farmerCount} farmers</strong> fulfills your exact requirement of{' '}
                    <strong>{formatUnitAmount(recommendation.targetKg, unit)}</strong> of <strong className="capitalize">{recommendation.cropName}</strong> without exceeding your requested amount.
                  </>
                )}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-300 shrink-0">
            100% {recommendation.cropName} (Zero Crop Mixing)
          </span>
        </div>
      )}

      {recommendation.status === 'partial_alternative' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-950/40 border border-amber-500/50 rounded-xl px-4 py-3.5 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">
                Closest Valid Alternative (Requested quantity exceeds total market stock)
              </span>
              <p className="text-amber-300/80 text-[11px] mt-0.5">
                You requested <strong>{formatUnitAmount(recommendation.targetKg, unit)}</strong>, but total marketplace stock across all farmers is{' '}
                <strong>{formatUnitAmount(recommendation.totalAvailableKg, unit)}</strong> (short by {formatUnitAmount(recommendation.shortfallKg, unit)}). Below is the closest valid combination from all active farmers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdjustToMaxAvailable}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-bg text-xs font-bold hover:opacity-90 transition-all shrink-0 cursor-pointer"
          >
            Adjust to Max ({formatUnitAmount(recommendation.totalAvailableKg, unit)})
          </button>
        </div>
      )}

      {/* Contribution breakdown bar */}
      {recommendation.items.length > 0 && (
        <div className="space-y-1.5 bg-surface-2/40 border border-border rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-medium text-text flex items-center gap-1.5">
              <Layers size={13} className="text-buyer" /> Multi-Farmer Contribution Share
            </span>
            <span>{recommendation.farmerCount} Farmers Combined</span>
          </div>
          <div className="h-3 w-full bg-surface rounded-full overflow-hidden flex border border-border/80">
            {recommendation.items.map((item, idx) => {
              const colors = ['bg-buyer', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-purple-500']
              return (
                <div
                  key={item.listing.id}
                  style={{ width: `${item.percentOfTotal}%` }}
                  className={`${colors[idx % colors.length]} h-full transition-all duration-300`}
                  title={`${item.farmerName}: ${formatUnitAmount(item.allocatedKg, unit)} (${item.percentOfTotal}%)`}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted pt-1">
            {recommendation.items.map((item, idx) => {
              const dotColors = ['bg-buyer', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-purple-500']
              return (
                <div key={item.listing.id} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                  <span className="font-semibold text-text">{item.farmerName}</span>
                  <span>
                    ({formatUnitAmount(item.allocatedKg, unit)} • {item.percentOfTotal}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recommended Farmers Cards Grid */}
      {recommendation.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {recommendation.items.map((item, idx) => (
            <div
              key={item.listing.id}
              className="relative bg-surface border-2 border-border hover:border-buyer/60 rounded-xl p-4 flex flex-col justify-between transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-buyer/15 text-buyer border border-buyer/30">
                    Farmer #{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      gradeStyles[item.listing.qualityGrade]?.badge || 'bg-surface text-text'
                    }`}
                  >
                    {gradeStyles[item.listing.qualityGrade]?.text || `Grade ${item.listing.qualityGrade}`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onFarmerClick?.(item.listing)}
                  className="text-left w-full group cursor-pointer"
                >
                  <h4 className="font-bold text-sm text-text group-hover:text-buyer transition-colors flex items-center gap-1.5">
                    <User size={13} className="text-farmer shrink-0" />
                    <span className="truncate">{item.farmerName}</span>
                  </h4>
                  <p className="text-[11px] text-muted truncate">{item.farmName}</p>
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-muted mt-1">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{item.listing.location || 'Local Farm'}</span>
                </div>

                <div className="mt-2 text-xs text-muted flex items-center justify-between py-1 border-t border-border/50">
                  <span>Variety:</span>
                  <span className="font-semibold text-text truncate max-w-[150px]">
                    {item.listing.variety || 'Harvest Standard'}
                  </span>
                </div>

                <div className="mt-2 bg-surface-2 rounded-lg p-2.5 space-y-1 border border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Farmer Stock:</span>
                    <span className="font-medium text-text">{item.availableKg.toLocaleString()} kg available</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Price Rate:</span>
                    <span className="font-semibold text-gold">₹{item.pricePerKg} /kg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/70 font-semibold">
                    <span className="text-buyer">Recommended Order:</span>
                    <span className="text-buyer font-bold">{formatUnitAmount(item.allocatedKg, unit)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text font-bold">
                    <span>Farmer Subtotal:</span>
                    <span className="text-sm font-serif">₹{item.itemTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer & One-Click Batch Order Button */}
      {recommendation.items.length > 0 && (
        <div className="bg-surface-2 border-2 border-buyer/50 rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-lg shadow-buyer/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Crop</span>
              <span className="text-base font-bold text-text capitalize">{recommendation.cropName}</span>
              <span className="text-[10px] text-emerald-400 block font-medium">100% Same Crop</span>
            </div>

            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Total Quantity</span>
              <span className="text-base font-bold text-text">
                {formatUnitAmount(recommendation.totalAllocatedKg, unit)}
              </span>
              <span className="text-[10px] text-muted block font-medium">
                ({Number(recommendation.totalAllocatedKg.toFixed(2))} kg)
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Farmers</span>
              <span className="text-base font-bold text-text">
                {recommendation.farmerCount} {recommendation.farmerCount === 1 ? 'Farmer' : 'Farmers'}
              </span>
              <span className="text-[10px] text-muted block font-medium">
                Avg ₹{recommendation.effectiveAvgPricePerKg}/kg
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted uppercase tracking-wider block font-semibold">Total Price</span>
              <span className="text-xl font-serif font-bold text-buyer">
                ₹{recommendation.totalPrice.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted block font-medium">
                {recommendation.farmerCount === 1 ? 'Single farmer fulfillment' : 'All orders combined'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handlePlaceOrdersFromAllFarmers()
              }}
              disabled={isOrdering || recommendation.items.length === 0}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-buyer text-text font-bold text-sm hover:opacity-95 shadow-md shadow-buyer/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOrdering ? (
                <>
                  <RotateCcw size={16} className="animate-spin" />
                  <span>
                    {recommendation.farmerCount === 1
                      ? 'Placing Order...'
                      : `Placing ${recommendation.farmerCount} Orders...`}
                  </span>
                </>
              ) : (
                <>
                  <ShoppingBag size={17} />
                  <span>
                    {recommendation.farmerCount === 1
                      ? `Place Order (₹${recommendation.totalPrice.toLocaleString()})`
                      : `Place Orders from All Farmers (${recommendation.farmerCount} Farmers • ₹${recommendation.totalPrice.toLocaleString()})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {orderError && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-400" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Success Modal */}
      {successOrders && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-buyer rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-text">
                  {successOrders.length === 1 ? 'Order Successfully Placed!' : 'Orders Successfully Placed!'}
                </h3>
                <p className="text-xs text-muted">
                  {successOrders.length === 1
                    ? 'Created your order with the recommended farmer.'
                    : `Created ${successOrders.length} separate orders for each recommended farmer.`}
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {successOrders.map((ord) => {
                const farmerName = getFarmerDisplayName(ord.farmerId).name
                return (
                  <div
                    key={ord.id}
                    className="bg-surface-2 border border-border rounded-xl p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-buyer">#{ord.id}</span>
                        <span className="font-bold text-text">{farmerName}</span>
                      </div>
                      <span className="text-[11px] text-muted">
                        {ord.cropName} ({ord.variety}) • {ord.farmerId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-text">₹{ord.totalAmount.toLocaleString()}</span>
                      <span className="text-[10px] text-muted block">
                        {formatUnitAmount(ord.quantityKg, unit)} @ ₹{ord.pricePerKg}/kg
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-3 bg-buyer/10 border border-buyer/30 rounded-xl text-xs text-text flex items-center gap-2">
              <Truck size={16} className="text-buyer shrink-0" />
              <span>
                {successOrders.length === 1
                  ? 'The farmer has been notified and will prepare shipment to the Central Store.'
                  : 'Each farmer has been notified and will prepare their shipment to the Central Store.'}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSuccessOrders(null)}
                className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-xs font-semibold text-text hover:bg-surface transition-all cursor-pointer"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessOrders(null)
                  onNavigateToOrders?.()
                }}
                className="px-4 py-2 rounded-xl bg-buyer text-text text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Track Live Orders</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
