// FarmerView.tsx
import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusCircle,
  Package,
  Gavel,
  Trash2,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Radio,
  X,
  User,
  ShieldCheck,
  Phone,
} from 'lucide-react'
import type { AuctionItem, AuctionSession, UnitType } from './types'
import { auctionStorage } from './auctionStorage'

const PRESET_CROPS = [
  { name: 'Ratnagiri Alphonso Mangoes', category: 'Fruits', unit: 'crates' as UnitType, price: 1800, img: '/assets/images/crops/mango.png' },
  { name: 'Coastal Red Shallots / Onions', category: 'Vegetables', unit: 'kg' as UnitType, price: 28, img: '/assets/images/crops/onion.png' },
  { name: 'Malabar Nendran Bananas', category: 'Fruits', unit: 'kg' as UnitType, price: 32, img: '/assets/images/crops/banana.png' },
  { name: 'Stemless Guntur S17 Chillies', category: 'Spices', unit: 'kg' as UnitType, price: 140, img: '/assets/images/crops/chilli.png' },
  { name: 'Konkan Sweet Tender Coconuts', category: 'Plantation', unit: 'pieces' as UnitType, price: 38, img: '/assets/images/crops/coconut.png' },
  { name: 'Dawn Vine Red Tomatoes', category: 'Vegetables', unit: 'kg' as UnitType, price: 22, img: '/assets/images/crops/tomato.png' },
  { name: 'Coastal Red Rice (Paddy)', category: 'Grains', unit: 'quintal' as UnitType, price: 3200, img: '/assets/images/crops/rice.png' },
  { name: 'Deep Purple Coastal Brinjals', category: 'Vegetables', unit: 'kg' as UnitType, price: 25, img: '/assets/images/crops/brinjal.png' },
]

interface FarmerViewProps {
  farmerId: string
  farmerName: string
  farmerDistrict: string
  session: AuctionSession
  items: AuctionItem[]
  onRefresh: () => void
  onToast: (toast: { type: 'success' | 'error' | 'session'; title: string; message: string }) => void
}

export default function FarmerView({
  farmerId,
  farmerName,
  farmerDistrict,
  session,
  items,
  onRefresh,
  onToast,
}: FarmerViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AuctionItem | null>(null)
  const [filterTab, setFilterTab] = useState<'all' | 'live' | 'upcoming' | 'sold'>('all')

  // Form State
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('Vegetables')
  const [formQuantity, setFormQuantity] = useState('')
  const [formUnit, setFormUnit] = useState<UnitType>('kg')
  const [formStartingPrice, setFormStartingPrice] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('/assets/images/crops/tomato.png')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter items belonging to this farmer
  const farmerItems = useMemo(() => {
    return items.filter((item) => item.farmerId === farmerId || item.farmerName === farmerName)
  }, [items, farmerId, farmerName])

  // Filtered by tab
  const displayedItems = useMemo(() => {
    if (filterTab === 'all') return farmerItems
    return farmerItems.filter((i) => i.status === filterTab)
  }, [farmerItems, filterTab])

  // Real-time bids feed on farmer's lots
  const liveBidsFeed = useMemo(() => {
    const allFarmerBids: Array<{
      bidId: string
      itemId: string
      itemName: string
      amount: number
      buyerName: string
      createdAt: string
    }> = []

    farmerItems.forEach((item) => {
      item.bids.forEach((bid) => {
        allFarmerBids.push({
          bidId: bid.id,
          itemId: item.id,
          itemName: item.name,
          amount: bid.amount,
          buyerName: bid.buyerName,
          createdAt: bid.createdAt,
        })
      })
    })

    return allFarmerBids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [farmerItems])

  // Aggregate stats
  const stats = useMemo(() => {
    const totalLots = farmerItems.length
    const liveLots = farmerItems.filter((i) => i.status === 'live').length
    const soldLots = farmerItems.filter((i) => i.status === 'sold').length
    const totalBidsReceived = farmerItems.reduce((acc, i) => acc + i.bids.length, 0)
    const totalPotentialRevenue = farmerItems.reduce((acc, i) => {
      const price = i.currentHighestBid || i.startingPrice
      return acc + price * (i.quantity || 1)
    }, 0)

    return { totalLots, liveLots, soldLots, totalBidsReceived, totalPotentialRevenue }
  }, [farmerItems])

  // Open creation modal with clean form
  const handleOpenCreateModal = () => {
    setFormName('')
    setFormCategory('Vegetables')
    setFormQuantity('')
    setFormUnit('kg')
    setFormStartingPrice('')
    setFormDescription('')
    setFormImageUrl('/assets/images/crops/tomato.png')
    setImagePreview(null)
    setFormError(null)
    setIsCreateModalOpen(true)
  }

  // Handle Preset selection
  const handleSelectPreset = (preset: (typeof PRESET_CROPS)[0]) => {
    setFormName(preset.name)
    setFormCategory(preset.category)
    setFormUnit(preset.unit)
    setFormStartingPrice(String(preset.price))
    setFormImageUrl(preset.img)
    setImagePreview(preset.img)
  }

  // Handle Custom Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, WEBP)')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImagePreview(result)
      setFormImageUrl(result)
    }
    reader.readAsDataURL(file)
  }

  // Handle submit create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmedName = formName.trim()
    const parsedQty = parseFloat(formQuantity)
    const parsedPrice = parseFloat(formStartingPrice)

    if (!trimmedName) {
      setFormError('Please enter produce name or choose a preset lot')
      return
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setFormError('Please enter a valid positive quantity')
      return
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please enter a valid starting price in INR')
      return
    }

    const res = auctionStorage.createItem({
      farmerId,
      farmerName,
      farmerDistrict,
      name: trimmedName,
      category: formCategory,
      imageUrl: formImageUrl || '/assets/images/crops/tomato.png',
      quantity: parsedQty,
      unit: formUnit,
      startingPrice: parsedPrice,
      sessionId: session.id,
      description: formDescription.trim() || undefined,
    })

    if (res.success && res.item) {
      setIsCreateModalOpen(false)
      onRefresh()
      onToast({
        type: 'success',
        title: 'Produce Lot Listed!',
        message: `${res.item.name} (${res.item.quantity} ${res.item.unit}) added to ${session.title}.`,
      })
    } else {
      setFormError(res.error || 'Failed to list item')
    }
  }

  // Handle edit item (ONLY allowed when status is 'upcoming')
  const handleOpenEdit = (item: AuctionItem) => {
    if (item.status !== 'upcoming') {
      onToast({
        type: 'error',
        title: 'Action Restricted',
        message: 'Lots can only be modified BEFORE the auction goes live.',
      })
      return
    }
    setEditingItem(item)
    setFormName(item.name)
    setFormQuantity(String(item.quantity))
    setFormUnit(item.unit)
    setFormStartingPrice(String(item.startingPrice))
    setFormDescription(item.description || '')
    setFormImageUrl(item.imageUrl)
    setImagePreview(item.imageUrl)
    setFormError(null)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const parsedQty = parseFloat(formQuantity)
    const parsedPrice = parseFloat(formStartingPrice)

    if (!formName.trim() || isNaN(parsedQty) || isNaN(parsedPrice) || parsedQty <= 0 || parsedPrice <= 0) {
      setFormError('Please enter valid produce name, quantity, and starting price')
      return
    }

    const res = auctionStorage.updateItem(editingItem.id, {
      name: formName.trim(),
      quantity: parsedQty,
      unit: formUnit,
      startingPrice: parsedPrice,
      description: formDescription.trim() || undefined,
      imageUrl: formImageUrl,
    })

    if (res.success) {
      setEditingItem(null)
      onRefresh()
      onToast({
        type: 'success',
        title: 'Lot Updated',
        message: `${formName} listing has been updated.`,
      })
    } else {
      setFormError(res.error || 'Failed to update item')
    }
  }

  // Handle delete item (ONLY allowed when status is 'upcoming')
  const handleDeleteItem = (item: AuctionItem) => {
    if (item.status !== 'upcoming') {
      onToast({
        type: 'error',
        title: 'Cannot Delete',
        message: 'This lot is already live or concluded. Deletion is locked during active bidding.',
      })
      return
    }

    if (window.confirm(`Are you sure you want to remove "${item.name}" from the auction lot?`)) {
      const res = auctionStorage.deleteItem(item.id)
      if (res.success) {
        onRefresh()
        onToast({
          type: 'success',
          title: 'Lot Removed',
          message: `"${item.name}" was removed from the auction.`,
        })
      } else {
        onToast({
          type: 'error',
          title: 'Error',
          message: res.error || 'Failed to delete lot',
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Farmer Identity & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0 bg-surface-2 flex items-center justify-center">
            <img
              src="/assets/images/portraits/farmer_portrait.jpg"
              alt={farmerName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-medium text-text">
                {farmerName}’s Harvest Lots
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Farmer Desk
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Region: <strong className="text-text font-normal">{farmerDistrict}</strong> • Coastal Dawn Auction Lot Desk
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-bg text-sm font-semibold transition-all shadow-md shadow-gold/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List New Harvest Lot</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">My Total Lots</span>
            <Package className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-bold font-serif text-text">{stats.totalLots}</div>
          <span className="text-[11px] text-text-muted">{stats.liveLots} active on floor</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Bidding Lots</span>
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-serif text-rose-400">{stats.liveLots}</div>
          <span className="text-[11px] text-text-muted">Currently receiving bids</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bids</span>
            <Gavel className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl font-bold font-serif text-text">{stats.totalBidsReceived}</div>
          <span className="text-[11px] text-text-muted">Across all your listings</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Lots Sold</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-400">{stats.soldLots}</div>
          <span className="text-[11px] text-text-muted">Hammer struck & finalized</span>
        </div>
      </div>

      {/* Main Grid: Listings + Live Feed Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): My Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-medium text-text">
                Registered Produce Lots
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border">
                {displayedItems.length}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-2 border border-border text-xs">
              {(['all', 'live', 'upcoming', 'sold'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors font-medium ${
                    filterTab === tab
                      ? 'bg-surface text-gold border border-border shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Listings List */}
          {displayedItems.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-surface border border-border border-dashed space-y-3">
              <Package className="w-10 h-10 text-text-muted mx-auto opacity-50" />
              <h4 className="font-serif text-base text-text">No produce lots in this view</h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Ready to bring your morning harvest to the pier? List an item to start receiving bids from wholesale buyers.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-bg hover:bg-gold/90 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                List First Lot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedItems.map((item) => {
                const isUpcoming = item.status === 'upcoming'
                const isLive = item.status === 'live'
                const isSold = item.status === 'sold'
                const isUnsold = item.status === 'unsold'

                return (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-2xl bg-surface border border-border overflow-hidden shadow-lg hover:border-gold/40 transition-all duration-300 relative group"
                  >
                    {/* Item Image with Badges */}
                    <div className="relative h-44 w-full bg-surface-2 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/crops/tomato.png'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />

                      {/* Status Pill */}
                      <div className="absolute top-3 left-3">
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/90 text-white shadow-md">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Live on Floor
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/90 text-stone-950 shadow-md">
                            <Clock className="w-3 h-3" />
                            Upcoming Lot
                          </span>
                        )}
                        {isSold && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-500 text-stone-950 shadow-md">
                            <CheckCircle2 className="w-3 h-3" />
                            Sold at Gavel
                          </span>
                        )}
                        {isUnsold && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-stone-700 text-stone-200 shadow-md">
                            <XCircle className="w-3 h-3" />
                            Unsold Lot
                          </span>
                        )}
                      </div>

                      {/* Edit / Delete action overlay (Only before live) */}
                      {isUpcoming ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Lot (Available before live)"
                            className="p-1.5 rounded-lg bg-surface/90 hover:bg-gold hover:text-bg text-text border border-border backdrop-blur-xs transition-colors shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            title="Delete Lot (Available before live)"
                            className="p-1.5 rounded-lg bg-surface/90 hover:bg-rose-600 hover:text-white text-rose-300 border border-border backdrop-blur-xs transition-colors shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3">
                          <span
                            title="Modifications locked once live or closed"
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-text-muted border border-border/50 backdrop-blur-xs"
                          >
                            Locked
                          </span>
                        </div>
                      )}

                      {/* Lot Quantity Banner at bottom of image */}
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-text">
                        <span className="px-2 py-0.5 rounded-md bg-surface/85 backdrop-blur-xs border border-border font-medium">
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-[11px] text-text-muted bg-surface/85 px-2 py-0.5 rounded-md border border-border">
                          {item.bids.length} {item.bids.length === 1 ? 'bid' : 'bids'}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-serif text-base font-medium text-text line-clamp-1">
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Price Matrix */}
                      <div className="p-3 rounded-xl bg-surface-2 border border-border/60 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted">Starting Base:</span>
                          <span className="font-medium text-text">
                            ₹{item.startingPrice.toLocaleString('en-IN')}/{item.unit}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/40">
                          <span className="text-text-muted font-medium flex items-center gap-1">
                            {isSold ? 'Final Hammer Price:' : 'Current Highest Bid:'}
                          </span>
                          <span
                            className={`font-mono text-sm font-bold ${
                              isSold
                                ? 'text-emerald-400'
                                : item.currentHighestBid > item.startingPrice
                                ? 'text-gold'
                                : 'text-text'
                            }`}
                          >
                            ₹{item.currentHighestBid.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Winning Buyer Declaration after End */}
                        {isSold && item.highestBidderName && (
                          <div className="mt-2 pt-2 border-t border-emerald-500/20 text-xs bg-emerald-950/30 -mx-3 -mb-3 p-2.5 rounded-b-xl flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-emerald-300">
                              <Award className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-medium truncate max-w-[140px]">
                                Winner: {item.highestBidderName}
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-400 font-bold">
                              ₹{(item.currentHighestBid * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Live Bid Feed for Farmer's Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-medium text-text">
                Live Lot Floor Feed
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            </div>
            <span className="text-xs text-text-muted">Real-time</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border min-h-[380px] max-h-[580px] overflow-y-auto space-y-3">
            {liveBidsFeed.length === 0 ? (
              <div className="text-center py-14 px-3 text-text-muted space-y-2">
                <Gavel className="w-8 h-8 mx-auto opacity-40 text-gold" />
                <p className="text-xs">No bids recorded on your lots yet.</p>
                <p className="text-[11px] opacity-75">
                  When wholesale buyers place bids on your produce, they will stream here instantly without refreshing.
                </p>
              </div>
            ) : (
              liveBidsFeed.map((bid, idx) => (
                <div
                  key={bid.bidId || idx}
                  className="p-3 rounded-xl bg-surface-2 border border-border/70 text-xs space-y-1.5 hover:border-gold/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text truncate max-w-[140px]">
                      {bid.buyerName}
                    </span>
                    <span className="font-mono font-bold text-gold text-sm">
                      ₹{bid.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span className="truncate max-w-[160px] text-text/80">
                      {bid.itemName}
                    </span>
                    <span>
                      {new Date(bid.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: List New Item */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl p-6 relative my-8 text-text"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gold/10 text-gold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-text">
                      List New Harvest Lot
                    </h3>
                    <p className="text-xs text-text-muted">
                      Assigning to session: <strong className="text-text">{session.title}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Quick Preset Selector */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                  Quick Select Common Coastal Produce
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-surface-2/60 rounded-xl border border-border">
                  {PRESET_CROPS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-surface hover:bg-gold/20 hover:text-gold border border-border/70 transition-colors flex items-center gap-1.5"
                    >
                      <img src={preset.img} alt="" className="w-3.5 h-3.5 object-cover rounded" />
                      <span>{preset.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Produce Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ratnagiri Alphonso Mangoes Grade A"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-text-muted block mb-1">Unit *</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value as UnitType)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="crates">Wooden Crates (crates)</option>
                      <option value="quintal">Quintals (100 kg)</option>
                      <option value="baskets">Coastal Baskets</option>
                      <option value="pieces">Pieces / Units</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Starting Base Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-text-muted">₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="any"
                        value={formStartingPrice}
                        onChange={(e) => setFormStartingPrice(e.target.value)}
                        placeholder="e.g. 1800"
                        className="w-full text-xs pl-7 pr-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-text-muted block mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Spices">Spices</option>
                      <option value="Plantation">Plantation</option>
                      <option value="Grains">Grains</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1">Optional Harvest Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Freshly plucked at 4:30 AM today from coastal orchards, zero chemical wash."
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-text placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Image Upload / Preview */}
                <div>
                  <label className="text-xs text-text-muted block mb-1">Lot Photograph</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-surface-2 border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-surface-2 hover:bg-surface border border-border text-text font-medium transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-gold" />
                        <span>Upload photo or keep selected</span>
                      </button>
                      <span className="text-[11px] text-text-muted block mt-0.5">
                        PNG, JPG, WEBP preview supported
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text bg-surface-2 border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gold text-bg hover:bg-gold/90 transition-colors shadow-sm"
                  >
                    Publish Lot to Auction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Item (Strictly for upcoming) */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6 relative my-8 text-text"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-gold" />
                  <h3 className="font-serif text-lg font-medium text-text">
                    Edit Upcoming Lot
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Produce Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Base Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={formStartingPrice}
                      onChange={(e) => setFormStartingPrice(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-text-muted block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text bg-surface-2 border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gold text-bg hover:bg-gold/90 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
