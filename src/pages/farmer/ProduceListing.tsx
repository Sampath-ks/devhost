// ProduceListing.tsx
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCircle2, AlertCircle, Info, Sparkles, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getMandiPricesForCrop } from '@/data/mandiPrices'
import { formatINR } from '@/lib/utils'

const DISTRICTS = [
  'Nashik',
  'Pune',
  'Varanasi',
  'Mandya',
  'Guntur',
  'Ludhiana',
  'Kolar',
  'Sindhudurg',
  'Coimbatore',
  'Palakkad',
  'Jaipur',
  'Cuddalore',
]

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function ProduceListing() {
  const navigate = useNavigate()
  const { crops, addListing, currentFarmer } = useAppStore()

  // Form State
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || 'crop-tomato')
  const [quantity, setQuantity] = useState<string>('')
  const [pricePerUnit, setPricePerUnit] = useState<string>('')
  const [qualityGrade, setQualityGrade] = useState<'A' | 'B' | 'C'>('A')
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [district, setDistrict] = useState<string>(currentFarmer.district || 'Nashik')
  const [isOrganic, setIsOrganic] = useState<boolean>(false)

  // Success state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const selectedCrop = useMemo(() => {
    return crops.find((c) => c.id === selectedCropId) || crops[0]
  }, [crops, selectedCropId])

  // Live Mandi guidance
  const mandiInfo = useMemo(() => {
    return getMandiPricesForCrop(selectedCrop.id)
  }, [selectedCrop.id])

  const parsedPrice = parseFloat(pricePerUnit) || 0
  const parsedQty = parseFloat(quantity) || 0

  const priceStatus = useMemo(() => {
    if (!parsedPrice) return null
    if (parsedPrice < mandiInfo.minSuggestedPrice) {
      return {
        type: 'below',
        label: 'Below Range',
        color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        advice: `Priced below mandi floor (₹${mandiInfo.minSuggestedPrice}). Fast liquidation likely, but you could realize higher margins.`,
      }
    }
    if (parsedPrice > mandiInfo.maxSuggestedPrice) {
      return {
        type: 'above',
        label: 'Above Range',
        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        advice: `Priced above average mandi ceiling (₹${mandiInfo.maxSuggestedPrice}). Ensure Grade A sorting to justify premium quotes.`,
      }
    }
    return {
      type: 'fair',
      label: 'Fair Market Price',
      color: 'bg-farmer/15 text-farmer border-farmer/40',
      advice: `Optimal fair price aligned with current arrivals (₹${mandiInfo.minSuggestedPrice} – ₹${mandiInfo.maxSuggestedPrice}). High buyer interest expected.`,
    }
  }, [parsedPrice, mandiInfo])

  // Visual marker position (0% to 100%)
  const markerPercent = useMemo(() => {
    const maxScale = mandiInfo.maxSuggestedPrice * 1.45
    if (!parsedPrice) return 0
    return Math.min(100, Math.max(0, (parsedPrice / maxScale) * 100))
  }, [parsedPrice, mandiInfo.maxSuggestedPrice])

  const rangeStartPercent = useMemo(() => {
    const maxScale = mandiInfo.maxSuggestedPrice * 1.45
    return (mandiInfo.minSuggestedPrice / maxScale) * 100
  }, [mandiInfo])

  const rangeEndPercent = useMemo(() => {
    const maxScale = mandiInfo.maxSuggestedPrice * 1.45
    return (mandiInfo.maxSuggestedPrice / maxScale) * 100
  }, [mandiInfo])

  // Validation
  const errors = useMemo(() => {
    const errs: Record<string, string> = {}
    if (!selectedCropId) errs.crop = 'Select a crop'
    if (!parsedQty || parsedQty <= 0) errs.quantity = 'Enter a valid quantity greater than 0'
    if (!parsedPrice || parsedPrice <= 0) errs.price = 'Enter a valid price greater than ₹0'
    if (!harvestDate) errs.harvestDate = 'Select harvest date'
    if (!district) errs.district = 'Select farm district'
    return errs
  }, [selectedCropId, parsedQty, parsedPrice, harvestDate, district])

  const isValid = Object.keys(errors).length === 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitted) return

    addListing({
      cropId: selectedCropId,
      quantity: parsedQty,
      pricePerUnit: parsedPrice,
      qualityGrade,
      harvestDate,
      district,
      isOrganic,
      status: 'Available',
    })

    setIsSubmitted(true)

    // Route to My Produce after short success animation
    setTimeout(() => {
      navigate('/farmer/produce')
    }, 1300)
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Page Header */}
      <div className="border-b border-border pb-5 mb-8">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-farmer">
          Direct Market Access
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-text font-normal mt-1">
          List New Harvest Produce
        </h1>
        <p className="text-sm text-text-muted mt-1.5">
          Enter harvest volume, quality grade, and set your floor price with live mandi price intelligence.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success-card"
            className="p-10 rounded-3xl bg-surface border border-farmer/50 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl shadow-farmer/20"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            <div className="w-16 h-16 rounded-full bg-farmer/20 border-2 border-farmer flex items-center justify-center text-farmer">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-text font-normal">
              Listing Created Successfully!
            </h2>
            <p className="text-sm text-text-muted max-w-md">
              Your {qualityGrade}-Grade {selectedCrop.name} batch ({quantity} {selectedCrop.unit} at ₹{pricePerUnit}/{selectedCrop.unit}) is now visible to verified bulk buyers.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs text-farmer font-mono">
              Redirecting to My Produce... <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            </span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Field 1: Visual Crop Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text uppercase tracking-wider">
                  1. Select Crop <span className="text-farmer">*</span>
                </label>
                <span className="text-xs text-text-muted">
                  Chosen: <strong className="text-text">{selectedCrop.name}</strong> ({selectedCrop.hindiName})
                </span>
              </div>

              {/* Crop Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {crops.map((crop) => {
                  const isSelected = crop.id === selectedCropId

                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => setSelectedCropId(crop.id)}
                      className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-farmer ${
                        isSelected
                          ? 'bg-farmer/15 border-farmer shadow-lg shadow-farmer/15 scale-[1.02]'
                          : 'bg-surface border-border hover:border-border/80 hover:bg-surface-2/60'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-farmer text-bg flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      <img
                        src={crop.image}
                        alt={crop.name}
                        className="w-14 h-14 object-contain mb-2 drop-shadow-md"
                        loading="lazy"
                      />
                      <span className="text-xs font-semibold text-text truncate w-full">
                        {crop.name}
                      </span>
                      <span className="text-[10px] text-text-muted truncate w-full">
                        {crop.unit}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Field 2 & 3: Quantity & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface/60 border border-border rounded-3xl p-6 sm:p-7">
              {/* Quantity */}
              <div className="space-y-2">
                <label htmlFor="harvest-qty" className="text-xs font-semibold text-text uppercase tracking-wider">
                  2. Harvest Quantity ({selectedCrop.unit}) <span className="text-farmer">*</span>
                </label>
                <div className="relative">
                  <input
                    id="harvest-qty"
                    type="number"
                    min="1"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={`e.g. 500`}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-farmer focus:ring-1 focus:ring-farmer text-lg tabular-nums"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-text-muted uppercase font-medium">
                    {selectedCrop.unit}
                  </span>
                </div>
                {errors.quantity && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Price Per Unit */}
              <div className="space-y-2">
                <label htmlFor="unit-price" className="text-xs font-semibold text-text uppercase tracking-wider">
                  3. Floor Price (₹ per {selectedCrop.unit}) <span className="text-farmer">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-semibold text-gold">₹</span>
                  <input
                    id="unit-price"
                    type="number"
                    min="1"
                    step="any"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder={`Mandi modal: ₹${mandiInfo.currentModalPrice}`}
                    className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-4 py-3 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-farmer focus:ring-1 focus:ring-farmer text-lg tabular-nums"
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* LIVE PRICE GUIDANCE WIDGET */}
              <div className="sm:col-span-2 pt-2 border-t border-border/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="text-xs font-semibold text-text uppercase tracking-wider">
                      Live Mandi Price Guidance ({selectedCrop.name})
                    </span>
                  </div>
                  {priceStatus && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${priceStatus.color}`}
                    >
                      {priceStatus.label}
                    </span>
                  )}
                </div>

                {/* Animated Horizontal Price Spectrum */}
                <div className="space-y-1.5">
                  <div className="relative h-4 bg-surface-2 rounded-full overflow-hidden border border-border">
                    {/* Mandi Suggested Fair Window */}
                    <div
                      className="absolute top-0 bottom-0 bg-farmer/35 border-x border-farmer/60"
                      style={{
                        left: `${rangeStartPercent}%`,
                        width: `${rangeEndPercent - rangeStartPercent}%`,
                      }}
                      title={`Mandi Range: ₹${mandiInfo.minSuggestedPrice} – ₹${mandiInfo.maxSuggestedPrice}`}
                    />
                    {/* Your Price Marker */}
                    {parsedPrice > 0 && (
                      <motion.div
                        className="absolute top-0 bottom-0 w-2.5 bg-gold rounded-full -translate-x-1/2 shadow-md shadow-gold/50"
                        style={{ left: `${markerPercent}%` }}
                        layout
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                  </div>

                  <div className="flex justify-between text-[11px] text-text-muted tabular-nums">
                    <span>₹0</span>
                    <span className="text-farmer font-medium">
                      Fair Range: ₹{mandiInfo.minSuggestedPrice} – ₹{mandiInfo.maxSuggestedPrice}/{selectedCrop.unit}
                    </span>
                    <span>₹{Math.round(mandiInfo.maxSuggestedPrice * 1.45)}+</span>
                  </div>
                </div>

                {/* Price Advice Note */}
                {priceStatus ? (
                  <p className="text-xs text-text-muted leading-relaxed">
                    💡 <strong className="text-text">{priceStatus.label}:</strong> {priceStatus.advice}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                    Type a floor price to see how it benchmarks against today's local mandi arrivals.
                  </p>
                )}
              </div>
            </div>

            {/* Field 4, 5, 6: Quality, Harvest Date, District */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-surface/60 border border-border rounded-3xl p-6 sm:p-7">
              {/* Quality Grade Segmented Control */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text uppercase tracking-wider block">
                  4. Quality Grade <span className="text-farmer">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-xl border border-border">
                  {(['A', 'B', 'C'] as const).map((grade) => {
                    const isSelected = qualityGrade === grade
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setQualityGrade(grade)}
                        className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                          isSelected
                            ? 'bg-farmer text-text shadow-sm'
                            : 'text-text-muted hover:text-text hover:bg-surface'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-text-muted">
                  {qualityGrade === 'A' && 'Grade A: Premium, sorted, optimal sizing & moisture'}
                  {qualityGrade === 'B' && 'Grade B: Standard retail, minor cosmetic blemishes'}
                  {qualityGrade === 'C' && 'Grade C: Bulk processing, puree, or milling grade'}
                </p>
              </div>

              {/* Harvest Date */}
              <div className="space-y-2">
                <label htmlFor="harvest-date" className="text-xs font-semibold text-text uppercase tracking-wider block">
                  5. Harvest Date <span className="text-farmer">*</span>
                </label>
                <input
                  id="harvest-date"
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-text text-sm focus:outline-none focus:border-farmer"
                />
              </div>

              {/* Location (District) */}
              <div className="space-y-2">
                <label htmlFor="farm-district" className="text-xs font-semibold text-text uppercase tracking-wider block">
                  6. Farm District <span className="text-farmer">*</span>
                </label>
                <select
                  id="farm-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-text text-sm focus:outline-none focus:border-farmer"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organic Certification Switch */}
              <div className="sm:col-span-3 pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-text block">Organic / Chemical-Free Harvest</span>
                  <span className="text-xs text-text-muted">
                    Check if grown with certified organic manure or natural zbnf methods.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={(e) => setIsOrganic(e.target.checked)}
                  className="w-5 h-5 accent-farmer rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Estimated Total Bar & Submit Button */}
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase text-text-muted font-semibold tracking-wider">
                  Total Projected Value
                </span>
                <p className="text-2xl font-serif text-text font-normal">
                  {parsedQty > 0 && parsedPrice > 0 ? (
                    formatINR(parsedQty * parsedPrice)
                  ) : (
                    <span className="text-text-muted font-sans text-base">Fill quantity & price</span>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={!isValid || isSubmitted}
                className={`px-8 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  isValid && !isSubmitted
                    ? 'bg-farmer text-text hover:brightness-110 active:scale-95 shadow-lg shadow-farmer/20 cursor-pointer'
                    : 'bg-surface-2 text-text-muted/50 border border-border cursor-not-allowed'
                }`}
              >
                Publish Harvest Listing
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  )
}
