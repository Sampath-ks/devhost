// BuyerView.tsx
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Gavel,
  Clock,
  Sparkles,
  ShieldAlert,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  Filter,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react'
import type { AuctionItem, AuctionSession } from './types'
import { auctionStorage } from './auctionStorage'

interface BuyerViewProps {
  buyerId: string
  buyerName: string
  session: AuctionSession
  items: AuctionItem[]
  onRefresh: () => void
  onToast: (toast: {
    type: 'bid' | 'outbid' | 'session' | 'antisnipe' | 'error' | 'success'
    title: string
    message: string
  }) => void
}

export default function BuyerView({
  buyerId,
  buyerName,
  session,
  items,
  onRefresh,
  onToast,
}: BuyerViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'my-bids'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [myBidsFilter, setMyBidsFilter] = useState<'all' | 'winning' | 'outbid' | 'won' | 'lost'>('all')

  // Bid input state per item: itemId -> string amount
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({})
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  const isLive = session.status === 'live'

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => {
      if (i.category) set.add(i.category)
    })
    return ['All', ...Array.from(set)]
  }, [items])

  // Filtered Items for Browse
  const browseItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerDistrict.toLowerCase().includes(searchQuery.toLowerCase())

      const matchCategory =
        selectedCategory === 'All' || item.category === selectedCategory

      return matchSearch && matchCategory
    })
  }, [items, searchQuery, selectedCategory])

  // My Bids: items where current buyer has placed at least 1 bid
  const myBiddedItems = useMemo(() => {
    return items.filter((item) => {
      return item.bids.some((b) => b.buyerId === buyerId || b.buyerName === buyerName)
    })
  }, [items, buyerId, buyerName])

  // Filtered My Bids
  const filteredMyBids = useMemo(() => {
    return myBiddedItems.filter((item) => {
      const isHighest = item.highestBidderId === buyerId
      const isSold = item.status === 'sold'
      const isClosed = session.status === 'closed' || isSold || item.status === 'unsold'

      if (myBidsFilter === 'winning') return isHighest && !isClosed
      if (myBidsFilter === 'outbid') return !isHighest && !isClosed
      if (myBidsFilter === 'won') return isSold && isHighest
      if (myBidsFilter === 'lost') return isClosed && !isHighest
      return true
    })
  }, [myBiddedItems, myBidsFilter, buyerId, session.status])

  // Quick increment handler
  const handleQuickIncrement = (itemId: string, increment: number) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const currentBase = item.bids.length > 0 ? item.currentHighestBid : item.startingPrice
    const currentInputVal = parseFloat(bidInputs[itemId]) || currentBase
    const nextVal = Math.max(currentBase + 10, currentInputVal + increment)

    setBidInputs((prev) => ({
      ...prev,
      [itemId]: String(nextVal),
    }))

    // Clear inline error when user types or bumps
    if (itemErrors[itemId]) {
      setItemErrors((prev) => {
        const next = { ...prev }
        delete next[itemId]
        return next
      })
    }
  }

  // Handle placing bid
  const handlePlaceBid = (item: AuctionItem) => {
    setItemErrors((prev) => {
      const next = { ...prev }
      delete next[item.id]
      return next
    })

    if (!isLive) {
      const err =
        session.status === 'upcoming'
          ? 'Auction has not started yet. Bidding opens at the scheduled time.'
          : 'Auction session is closed. Bidding is disabled.'
      setItemErrors((prev) => ({ ...prev, [item.id]: err }))
      onToast({ type: 'error', title: 'Bidding Disabled', message: err })
      return
    }

    const inputVal = bidInputs[item.id]
    const minRequired =
      item.bids.length === 0 ? item.startingPrice : item.currentHighestBid + 10

    const amount = parseFloat(inputVal)
    if (isNaN(amount) || amount < minRequired) {
      const err = `Minimum bid required is ₹${minRequired.toLocaleString('en-IN')} (+₹10 increment)`
      setItemErrors((prev) => ({ ...prev, [item.id]: err }))
      onToast({ type: 'error', title: 'Invalid Bid Amount', message: err })
      return
    }

    setSubmittingId(item.id)

    setTimeout(() => {
      const res = auctionStorage.placeBid({
        itemId: item.id,
        buyerId,
        buyerName,
        amount,
      })

      setSubmittingId(null)

      if (res.success && res.newBid) {
        onRefresh()

        // Clear input
        setBidInputs((prev) => ({
          ...prev,
          [item.id]: String(res.newBid!.amount + 20),
        }))

        onToast({
          type: 'bid',
          title: 'Bid Placed Successfully! 🎯',
          message: `Placed ₹${res.newBid.amount.toLocaleString('en-IN')} on ${item.name}. You are currently the highest bidder!`,
        })

        if (res.antiSnipingTriggered) {
          onToast({
            type: 'antisnipe',
            title: '⚡ Anti-Sniping Activated!',
            message: 'Bid placed in last 30s! Auction timer extended by +30 seconds.',
          })
        }
      } else {
        setItemErrors((prev) => ({ ...prev, [item.id]: res.error || 'Failed to place bid' }))
        onToast({
          type: 'error',
          title: 'Bid Rejected',
          message: res.error || 'Could not place bid.',
        })
      }
    }, 150)
  }

  return (
    <div className="space-y-6">
      {/* Top Buyer Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-medium text-text">
              Wholesale Bidding Floor
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Buyer Desk
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Bidding as <strong className="text-text font-normal">{buyerName}</strong> • Live morning coastal produce lots
          </p>
        </div>

        {/* View Tabs: All Lots vs My Bids */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-surface text-gold border border-border shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Lots ({items.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-bids')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'my-bids'
                ? 'bg-surface text-gold border border-border shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>My Bids ({myBiddedItems.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ALL LOTS BROWSE */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search produce, farmer, or coastal district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:border-gold"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                    selectedCategory === cat
                      ? 'bg-gold/15 text-gold border-gold/40 font-semibold'
                      : 'bg-surface text-text-muted border-border hover:text-text'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {browseItems.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-2xl bg-surface border border-border border-dashed space-y-2">
              <Package className="w-10 h-10 text-text-muted mx-auto opacity-40" />
              <h4 className="font-serif text-base text-text">No lots match your search</h4>
              <p className="text-xs text-text-muted">Try clearing your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {browseItems.map((item) => {
                const isHighestBidder = item.highestBidderId === buyerId
                const hasBidOnItem = item.bids.some((b) => b.buyerId === buyerId)
                const isOutbid = hasBidOnItem && !isHighestBidder

                const minRequired =
                  item.bids.length === 0
                    ? item.startingPrice
                    : item.currentHighestBid + 10

                const currentInput = bidInputs[item.id] || String(minRequired)
                const itemError = itemErrors[item.id]
                const isSubmitting = submittingId === item.id

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl bg-surface border overflow-hidden flex flex-col justify-between shadow-lg transition-all duration-300 relative group ${
                      isHighestBidder
                        ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : isOutbid
                        ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'border-border hover:border-gold/40'
                    }`}
                  >
                    {/* Top Image & Header */}
                    <div>
                      <div className="relative h-48 w-full bg-surface-2 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/images/crops/tomato.png'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />

                        {/* Status Badges on Image */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {isHighestBidder && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-stone-950 shadow-md">
                              <Sparkles className="w-3.5 h-3.5" />
                              Highest Bidder
                            </span>
                          )}
                          {isOutbid && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-md animate-pulse">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              You Were Outbid!
                            </span>
                          )}
                          {item.status === 'live' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/80 text-white backdrop-blur-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Live Lot
                            </span>
                          )}
                        </div>

                        {/* Quantity Tag */}
                        <div className="absolute bottom-3 right-3">
                          <span className="px-3 py-1 rounded-lg bg-surface/90 backdrop-blur-sm border border-border text-xs font-semibold text-text shadow-sm">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {item.bids.length} bids placed
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-medium text-text mt-0.5 line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gold shrink-0" />
                            <span>
                              {item.farmerName} • {item.farmerDistrict}
                            </span>
                          </p>
                        </div>

                        {/* Price Details */}
                        <div className="p-3 rounded-xl bg-surface-2 border border-border/70 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-text-muted uppercase tracking-wider block">
                              Base Starting
                            </span>
                            <span className="text-xs text-text-muted font-medium">
                              ₹{item.startingPrice.toLocaleString('en-IN')}/{item.unit}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider block">
                              {item.status === 'sold' ? 'Sold At' : 'Current Highest Bid'}
                            </span>
                            <span
                              className={`font-mono text-base sm:text-lg font-bold ${
                                isHighestBidder
                                  ? 'text-emerald-400'
                                  : isOutbid
                                  ? 'text-rose-400'
                                  : 'text-gold'
                              }`}
                            >
                              ₹{item.currentHighestBid.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Error Message if any */}
                        {itemError && (
                          <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                            <span>{itemError}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Bid Placement Area */}
                    <div className="p-4 pt-0 border-t border-border/40 mt-3">
                      {item.status === 'live' ? (
                        <div className="space-y-2 pt-3">
                          {/* Quick Increment Bumps */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">
                              Quick:
                            </span>
                            {[10, 50, 100].map((inc) => (
                              <button
                                key={inc}
                                type="button"
                                onClick={() => handleQuickIncrement(item.id, inc)}
                                className="px-2 py-0.5 rounded-md text-[11px] bg-surface-2 hover:bg-gold/20 hover:text-gold border border-border text-text-muted transition-colors font-mono"
                              >
                                +₹{inc}
                              </button>
                            ))}
                          </div>

                          {/* Bid Input + Submit Button */}
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-2.5 text-xs text-text-muted font-mono">
                                ₹
                              </span>
                              <input
                                type="number"
                                min={minRequired}
                                step="1"
                                value={currentInput}
                                onChange={(e) =>
                                  setBidInputs((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                  }))
                                }
                                className="w-full text-xs sm:text-sm font-mono font-semibold pl-7 pr-3 py-2 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                              />
                            </div>

                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handlePlaceBid(item)}
                              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 ${
                                isHighestBidder
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-gold hover:bg-gold/90 text-bg'
                              }`}
                            >
                              <Gavel className="w-3.5 h-3.5" />
                              <span>{isSubmitting ? 'Bidding...' : 'Bid'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-3 text-center">
                          <span className="text-xs text-text-muted block py-2 px-3 rounded-xl bg-surface-2 border border-border">
                            {item.status === 'upcoming'
                              ? 'Bidding opens when session starts'
                              : item.status === 'sold'
                              ? `Sold to ${item.highestBidderName || 'Winning Buyer'}`
                              : 'Lot closed without bids'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BIDS */}
      {activeTab === 'my-bids' && (
        <div className="space-y-4">
          {/* Sub-filters for My Bids */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
            <h3 className="font-serif text-lg font-medium text-text">
              My Participated Lots
            </h3>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-border text-xs">
              {(['all', 'winning', 'outbid', 'won', 'lost'] as const).map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setMyBidsFilter(sub)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors font-medium ${
                    myBidsFilter === sub
                      ? 'bg-surface text-gold border border-border shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {filteredMyBids.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-2xl bg-surface border border-border border-dashed space-y-3">
              <Gavel className="w-10 h-10 text-text-muted mx-auto opacity-40 text-gold" />
              <h4 className="font-serif text-base text-text">No bids in this filter</h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Switch to the "All Lots" tab to explore morning coastal harvest lots and place your first wholesale bid!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-bg hover:bg-gold/90 transition-colors shadow-sm"
              >
                Browse Auction Lots →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMyBids.map((item) => {
                const isHighest = item.highestBidderId === buyerId
                const isSold = item.status === 'sold'
                const isClosed = session.status === 'closed' || isSold || item.status === 'unsold'
                const userBids = item.bids.filter((b) => b.buyerId === buyerId)
                const myHighestBid = userBids[0]?.amount || 0

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-surface border border-border shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover border border-border shrink-0 bg-surface-2"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-medium text-text truncate">
                            {item.name}
                          </h4>
                          {isHighest && !isClosed && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Winning
                            </span>
                          )}
                          {!isHighest && !isClosed && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                              Outbid
                            </span>
                          )}
                          {isSold && isHighest && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-stone-950">
                              Won
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-text-muted mt-0.5">
                          Farmer: {item.farmerName} ({item.farmerDistrict}) • {item.quantity} {item.unit}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <div>
                            <span className="text-text-muted block text-[10px]">Your Top Bid:</span>
                            <span className="font-mono font-bold text-text">
                              ₹{myHighestBid.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-muted block text-[10px]">Lot Top Bid:</span>
                            <span
                              className={`font-mono font-bold ${
                                isHighest ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              ₹{item.currentHighestBid.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Outbid Recovery if Live */}
                    {!isHighest && isLive && (
                      <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
                        <span className="text-xs text-rose-300">
                          Outbid by ₹{(item.currentHighestBid - myHighestBid).toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('all')
                            setSearchQuery(item.name)
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gold text-bg hover:bg-gold/90 transition-colors shadow-sm"
                        >
                          Rebid Now →
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
