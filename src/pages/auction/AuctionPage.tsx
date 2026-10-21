// AuctionPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Anchor,
  Sparkles,
  HelpCircle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getSession, type SessionRole } from '@/lib/session'
import type { AuctionSession, AuctionItem, AuctionToast } from '@/components/auction/types'
import { auctionStorage } from '@/components/auction/auctionStorage'
import AuctionBanner from '@/components/auction/AuctionBanner'
import FarmerView from '@/components/auction/FarmerView'
import BuyerView from '@/components/auction/BuyerView'
import AuctionToasts from '@/components/auction/AuctionToasts'

export default function AuctionPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read authenticated session from local storage session
  const initialSession = getSession()
  const realRole: SessionRole = initialSession?.role === 'user' ? 'user' : 'farmer'

  // Query parameter role override: ?role=buyer or ?role=farmer
  const queryRole = searchParams.get('role')
  const initialPov: 'farmer' | 'user' =
    queryRole === 'buyer' || queryRole === 'user'
      ? 'user'
      : queryRole === 'farmer'
      ? 'farmer'
      : realRole

  // Allow switching POV locally for instant review & pair testing
  const [activePov, setActivePov] = useState<'farmer' | 'user'>(initialPov)

  // Keep state in sync if query param changes
  useEffect(() => {
    if (queryRole === 'buyer' || queryRole === 'user') {
      setActivePov('user')
    } else if (queryRole === 'farmer') {
      setActivePov('farmer')
    }
  }, [queryRole])

  const handleSwitchPov = (newPov: 'farmer' | 'user') => {
    setActivePov(newPov)
    setSearchParams({ role: newPov === 'user' ? 'buyer' : 'farmer' }, { replace: true })
  }

  // Farmer identity
  const farmerId = 'farmer-1'
  const farmerName = 'Ramesh Patil'
  const farmerDistrict = 'Ratnagiri / Konkan Coast'

  // Buyer identity (derived from session or mock buyer)
  const buyerId = initialSession?.email ? `buyer-${initialSession.email.replace(/[@.]/g, '-')}` : 'buyer-coastal-retail'
  const buyerName = initialSession?.email ? initialSession.email.split('@')[0] : 'Malabar Wholesalers'

  // State
  const [session, setSession] = useState<AuctionSession>(() => auctionStorage.getSession())
  const [items, setItems] = useState<AuctionItem[]>(() => auctionStorage.getItems())
  const [toasts, setToasts] = useState<AuctionToast[]>([])

  // Toast helper
  const addToast = useCallback(
    (toast: {
      type: 'bid' | 'outbid' | 'session' | 'antisnipe' | 'error' | 'success'
      title: string
      message: string
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      const newToast: AuctionToast = {
        ...toast,
        id,
        timestamp: Date.now(),
      }
      setToasts((prev) => [newToast, ...prev].slice(0, 5))

      // Auto dismiss after 5s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Refresh data from storage
  const handleRefresh = useCallback(() => {
    const s = auctionStorage.getSession()
    const i = auctionStorage.getItems()
    setSession(s)
    setItems(i)
  }, [])

  // Subscribe to real-time events (cross-tab sync)
  useEffect(() => {
    const unsubscribe = auctionStorage.subscribe((event) => {
      handleRefresh()

      // Show toast if someone placed a bid in another tab
      if (event.type === 'NEW_BID') {
        const payload = event as {
          itemId: string
          itemName: string
          bid: { buyerId: string; buyerName: string; amount: number }
          previousHighestBidderId?: string
          antiSnipingTriggered?: boolean
        }

        if (payload.previousHighestBidderId === buyerId && payload.bid.buyerId !== buyerId) {
          addToast({
            type: 'outbid',
            title: '⚠️ Outbid Alert!',
            message: `Someone just placed a higher bid of ₹${payload.bid.amount.toLocaleString('en-IN')} on ${payload.itemName}!`,
          })
        }
      }
    })

    // Advance clock & check expiration every second
    const interval = setInterval(() => {
      const s = auctionStorage.getSession()
      setSession(s)
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [handleRefresh, buyerId, addToast])

  return (
    <div className="relative pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Bar: POV Switcher & Real-time Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 p-3 rounded-xl bg-surface-2/70 border border-border">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-gold" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Live Produce Auction
          </span>
          <span className="text-xs text-text-muted">•</span>
          <span className="text-xs text-text-muted hidden md:inline">
            Coastal Wharf Dawn Exchange
          </span>
        </div>

        {/* Quick POV Switcher for testing both roles */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-text-muted hidden sm:inline">Role View:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-surface border border-border text-xs">
            <button
              type="button"
              onClick={() => handleSwitchPov('farmer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors font-medium ${
                activePov === 'farmer'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <span>👨‍🌾 Farmer POV</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPov('user')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors font-medium ${
                activePov === 'user'
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <span>🛒 Buyer POV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh floor data"
            className="p-1.5 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-text transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Shared Auction Announcement & Schedule Banner */}
      <AuctionBanner
        session={session}
        onSessionUpdated={(updated) => {
          setSession(updated)
          handleRefresh()
          addToast({
            type: 'session',
            title: 'Schedule Updated',
            message: `Auction window set to ${session.status.toUpperCase()} mode.`,
          })
        }}
        userRole={activePov}
      />

      {/* Dynamic View switching by active POV */}
      {activePov === 'farmer' ? (
        <FarmerView
          farmerId={farmerId}
          farmerName={farmerName}
          farmerDistrict={farmerDistrict}
          session={session}
          items={items}
          onRefresh={handleRefresh}
          onToast={addToast}
        />
      ) : (
        <BuyerView
          buyerId={buyerId}
          buyerName={buyerName}
          session={session}
          items={items}
          onRefresh={handleRefresh}
          onToast={addToast}
        />
      )}

      {/* Toast notifications container */}
      <AuctionToasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
