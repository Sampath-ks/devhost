import { Sparkles, ShoppingBag, MapPin, CalendarDays, User, ArrowRight, TrendingDown } from 'lucide-react'
import type { ProduceListing, QualityGrade } from '@/lib/produceTypes'
import { getPriceSuggestion } from '@/lib/priceService'
import { MARKETS } from '@/data/mandiPrices'

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

const gradeStyles: Record<QualityGrade, { badge: string; text: string }> = {
  A: { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', text: 'Grade A' },
  B: { badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30', text: 'Grade B' },
  C: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', text: 'Grade C' },
}

interface BulkRecommendationProps {
  listings: ProduceListing[]
  onOrderClick: (listing: ProduceListing) => void
  onFarmerClick: (listing: ProduceListing) => void
}

export default function BulkRecommendation({
  listings,
  onOrderClick,
  onFarmerClick,
}: BulkRecommendationProps) {
  // Filter active listings and sort by newest first (farmer's newest listings)
  const recommended = listings
    .filter((l) => l.status === 'Active' && l.quantityKg > 0)
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0
      const timeB = new Date(b.createdAt || 0).getTime() || 0
      return timeB - timeA
    })
    .slice(0, 4) // Top 4 freshest recommendations

  if (recommended.length === 0) return null

  return (
    <div className="rounded-2xl border border-gold/40 bg-gradient-to-b from-surface-2/90 via-surface to-surface p-5 sm:p-6 shadow-xl shadow-gold/5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gold/15 text-gold border border-gold/30">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-text">
                Fresh Farmer Recommendations
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/20 text-gold border border-gold/30 tracking-wider uppercase">
                New Arrivals
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Freshly listed produce directly from local farmers, recommended for immediate bulk & wholesale order.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Produce Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommended.map((listing) => {
          const cropKey = (listing.cropName || '').trim().toLowerCase()
          const imageSrc = CROP_IMAGES[cropKey]
          const priceBenchmark = getPriceSuggestion({
            crop: listing.cropName,
            market: MARKETS[0] || 'Mangaluru',
            askingPrice: listing.askingPrice,
            grade: listing.qualityGrade,
          })

          return (
            <div
              key={listing.id}
              className="group bg-surface-2 border border-border hover:border-gold/60 rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-gold/10"
            >
              <div>
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                    Recommended
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      gradeStyles[listing.qualityGrade]?.badge || 'bg-surface text-text border-border'
                    }`}
                  >
                    {gradeStyles[listing.qualityGrade]?.text || `Grade ${listing.qualityGrade}`}
                  </span>
                </div>

                {/* Crop & Thumbnail */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-surface p-1 border border-border shrink-0 flex items-center justify-center overflow-hidden">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={listing.cropName}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Sparkles size={20} className="text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base font-bold text-text truncate capitalize">
                      {listing.cropName}
                    </h3>
                    <p className="text-xs text-muted truncate">
                      {listing.variety ? `Variety: ${listing.variety}` : 'Fresh Harvest'}
                    </p>
                  </div>
                </div>

                {/* Farmer attribution */}
                <button
                  type="button"
                  onClick={() => onFarmerClick(listing)}
                  className="flex items-center gap-1 text-[11px] text-muted hover:text-gold truncate max-w-full mb-3 cursor-pointer"
                >
                  <User size={11} className="shrink-0 text-farmer" />
                  <span className="truncate">Farmer: {listing.farmerId || 'Verified Farmer'}</span>
                </button>

                {/* Pricing & Stock */}
                <div className="bg-surface rounded-lg p-2.5 border border-border/80 flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-muted block">Asking Price</span>
                    <span className="text-sm font-bold text-gold">
                      ₹{listing.askingPrice} <span className="text-[10px] font-normal text-muted">/kg</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted block">In Stock</span>
                    <span className="text-xs font-semibold text-text">
                      {listing.quantityKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted truncate mb-3">
                  <MapPin size={11} className="shrink-0 text-muted" />
                  <span className="truncate">{listing.location || 'Local Farm'}</span>
                </div>
              </div>

              {/* Order Button */}
              <button
                type="button"
                onClick={() => onOrderClick(listing)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gold text-bg text-xs font-bold hover:opacity-90 shadow-sm transition-all cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span>Order Recommendation</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
