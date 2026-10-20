// MyProduce.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, Edit3, Trash2, Check, X, Calendar, MapPin, Tag } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import type { CropListing } from '@/types'

export default function MyProduce() {
  const { currentFarmerListings, crops, updateListing, removeListing } = useAppStore()

  // Inline Price Editing State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPriceValue, setEditPriceValue] = useState<string>('')

  // Delete Confirmation Modal State
  const [listingToDelete, setListingToDelete] = useState<CropListing | null>(null)

  const handleStartEdit = (listing: CropListing) => {
    setEditingId(listing.id)
    setEditPriceValue(String(listing.pricePerUnit))
  }

  const handleSaveEdit = (listingId: string) => {
    const parsed = parseFloat(editPriceValue)
    if (parsed && parsed > 0) {
      updateListing(listingId, { pricePerUnit: parsed })
    }
    setEditingId(null)
  }

  const handleConfirmDelete = () => {
    if (listingToDelete) {
      removeListing(listingToDelete.id)
      setListingToDelete(null)
    }
  }

  const getCrop = (cropId: string) => {
    return crops.find((c) => c.id === cropId) || crops[0]
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-farmer">
            Active Inventory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text font-normal mt-1">
            My Produce Listings
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage your harvest inventory, adjust floor prices in real-time, and monitor buyer reservation statuses.
          </p>
        </div>

        <Link
          to="/farmer/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-farmer text-text text-sm font-medium hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-farmer/20 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Listing
        </Link>
      </div>

      {/* Produce Grid or Empty State */}
      {currentFarmerListings.length === 0 ? (
        <motion.div
          className="p-12 sm:p-16 rounded-3xl bg-surface border border-border text-center max-w-xl mx-auto my-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-text-muted block mb-2">
            Inventory Empty
          </span>
          <h2 className="font-serif text-2xl text-text font-normal">
            No produce listed yet.
          </h2>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            You currently have no active harvest batches published to the direct market. Add a listing to connect directly with bulk buyers, verified stores, and food processors with zero middleman deductions.
          </p>
          <div className="mt-6">
            <Link
              to="/farmer/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-farmer text-text text-sm font-medium hover:brightness-110 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Listing
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence>
            {currentFarmerListings.map((listing) => {
              const crop = getCrop(listing.cropId)
              const isEditing = editingId === listing.id
              const status = listing.status || 'Available'

              const statusColors = {
                Available: 'bg-farmer/15 text-farmer border-farmer/40',
                Reserved: 'bg-gold/15 text-gold border-gold/40',
                Sold: 'bg-surface-2 text-text-muted border-border',
              }

              return (
                <motion.div
                  key={listing.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="rounded-3xl bg-surface border border-border overflow-hidden flex flex-col justify-between group hover:border-border/80 transition-shadow"
                >
                  {/* Top Card Image & Tags */}
                  <div className="relative h-44 bg-surface-2/60 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={crop.image}
                      alt={crop.name}
                      className="w-28 h-28 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Quality & Status Tags */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface/90 border border-border text-text backdrop-blur-sm">
                        Grade {listing.qualityGrade}
                      </span>
                      {listing.isOrganic && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-farmer/20 text-farmer border border-farmer/40">
                          Organic
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3.5 right-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                          statusColors[status] || statusColors.Available
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-serif text-xl text-text font-normal">
                          {crop.name}
                        </h3>
                        <span className="text-xs text-text-muted">{crop.hindiName}</span>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/70 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-farmer shrink-0" />
                          <span>
                            Batch: <strong className="text-text font-medium">{listing.quantity} {crop.unit}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span>
                            Harvest: <strong className="text-text font-medium">{listing.harvestDate}</strong>
                          </span>
                        </div>
                        {listing.district && (
                          <div className="col-span-2 flex items-center gap-1.5 text-text-muted">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{listing.district} Farmgate</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Actions Row */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase text-text-muted block font-semibold">
                          Floor Rate
                        </span>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-sm font-semibold text-gold">₹</span>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={editPriceValue}
                              onChange={(e) => setEditPriceValue(e.target.value)}
                              className="w-20 bg-surface-2 border border-farmer rounded-lg px-2 py-1 text-sm text-text tabular-nums focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(listing.id)}
                              className="p-1 rounded-lg bg-farmer text-bg hover:brightness-110"
                              title="Save Price"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-lg bg-surface-2 text-text-muted hover:text-text"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-lg font-serif font-bold text-text">
                              ₹{listing.pricePerUnit}
                            </span>
                            <span className="text-xs text-text-muted">/{crop.unit}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(listing)}
                            className="p-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text-muted hover:text-text border border-border text-xs flex items-center gap-1 transition-colors"
                            title="Edit floor price"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setListingToDelete(listing)}
                            className="p-2 rounded-xl bg-surface-2 hover:bg-rose-500/10 text-text-muted hover:text-rose-400 border border-border text-xs transition-colors"
                            title="Remove listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {listingToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-surface border border-border rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <h3 className="font-serif text-xl text-text font-normal">
                Remove Harvest Listing?
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Are you sure you want to remove your listing for{' '}
                <strong className="text-text">{getCrop(listingToDelete.cropId).name}</strong>{' '}
                ({listingToDelete.quantity} {getCrop(listingToDelete.cropId).unit} at ₹{listingToDelete.pricePerUnit}/{getCrop(listingToDelete.cropId).unit})? This will immediately delist it from the buyer marketplace.
              </p>
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setListingToDelete(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors shadow-lg shadow-rose-600/20"
                >
                  Confirm Removal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
