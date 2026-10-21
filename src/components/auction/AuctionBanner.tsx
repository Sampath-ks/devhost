// AuctionBanner.tsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Radio,
  Zap,
  Volume2,
  VolumeX,
  Settings2,
  Calendar,
  X,
  RotateCcw,
  PlayCircle,
  StopCircle,
  Sunrise,
  Anchor,
} from 'lucide-react'
import type { AuctionSession } from './types'
import { auctionStorage } from './auctionStorage'
import { soundEffects } from './soundEffects'

interface AuctionBannerProps {
  session: AuctionSession
  onSessionUpdated: (session: AuctionSession) => void
  userRole: 'farmer' | 'user'
}

export default function AuctionBanner({ session, onSessionUpdated, userRole }: AuctionBannerProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('00:00')
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundEffects.isEnabled())
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)

  // Custom schedule inputs
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')

  // Format human time: e.g. "06:00 AM"
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return isoString
    }
  }

  // Update countdown clock every second
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now()
      const start = new Date(session.startTime).getTime()
      const end = new Date(session.endTime).getTime()

      if (now < start) {
        // Upcoming countdown
        const diff = Math.max(0, Math.floor((start - now) / 1000))
        const mins = Math.floor(diff / 60)
        const secs = diff % 60
        setTimeLeftStr(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
      } else if (now >= start && now < end) {
        // Live countdown
        const diff = Math.max(0, Math.floor((end - now) / 1000))
        const mins = Math.floor(diff / 60)
        const secs = diff % 60
        setTimeLeftStr(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
      } else {
        // Closed
        setTimeLeftStr('00:00')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [session.startTime, session.endTime])

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    soundEffects.setEnabled(next)
    if (next) soundEffects.playBidChime()
  }

  const handleApplyCustomSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customStart || !customEnd) return
    const startIso = new Date(customStart).toISOString()
    const endIso = new Date(customEnd).toISOString()
    const updated = auctionStorage.setSessionSchedule(startIso, endIso)
    onSessionUpdated(updated)
    setIsSettingsOpen(false)
  }

  const handleStartDemoTwoMin = () => {
    const updated = auctionStorage.startDemoTwoMinuteLive()
    onSessionUpdated(updated)
    setIsSettingsOpen(false)
  }

  const handleStart15Min = () => {
    const updated = auctionStorage.startLiveSessionNow(15)
    onSessionUpdated(updated)
    setIsSettingsOpen(false)
  }

  const handleSetUpcoming5Min = () => {
    const updated = auctionStorage.setUpcomingSession(5, 30)
    onSessionUpdated(updated)
    setIsSettingsOpen(false)
  }

  const handleCloseNow = () => {
    const updated = auctionStorage.closeSessionNow()
    onSessionUpdated(updated)
    setIsSettingsOpen(false)
  }

  const handleResetDemo = () => {
    const { session: newSession } = auctionStorage.resetAll()
    onSessionUpdated(newSession)
    setIsSettingsOpen(false)
  }

  const isLive = session.status === 'live'
  const isUpcoming = session.status === 'upcoming'
  const isClosed = session.status === 'closed'

  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border border-border shadow-2xl bg-gradient-to-r from-[#17120e] via-[#1a1510] to-[#121815]">
      {/* Decorative coastal dawn ambient glow */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: isLive
            ? 'radial-gradient(circle, #A8442F 0%, transparent 70%)'
            : isUpcoming
            ? 'radial-gradient(circle, #D9A441 0%, transparent 70%)'
            : 'radial-gradient(circle, #3E7C8C 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{
          background: isLive
            ? 'radial-gradient(circle, #D98A2B 0%, transparent 70%)'
            : 'radial-gradient(circle, #3F8F4A 0%, transparent 70%)',
        }}
      />

      {/* Top Thin Status Bar */}
      <div
        className="h-[3px] w-full transition-all duration-500"
        style={{
          backgroundColor: isLive
            ? '#A8442F'
            : isUpcoming
            ? '#D9A441'
            : '#4A5568',
        }}
      />

      <div className="p-4 sm:p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Announcement & Schedule */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Status Badge */}
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                LIVE AUCTION
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Clock className="w-3.5 h-3.5" />
                UPCOMING
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-500/20 text-gray-300 border border-gray-500/40">
                <StopCircle className="w-3.5 h-3.5" />
                SESSION CONCLUDED
              </span>
            )}

            {/* Coastal Wharf / Pier Tag */}
            <span className="inline-flex items-center gap-1 text-xs text-text-muted px-2.5 py-0.5 rounded-md bg-surface-2/60 border border-border">
              <Anchor className="w-3 h-3 text-gold" />
              Coastal Mandi Pier 4
            </span>

            {/* Anti-Sniping Indicator */}
            {session.antiSnipingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Zap className="w-3 h-3 text-amber-400" />
                Anti-Sniping Active (+{session.antiSnipingCount * 30}s)
              </span>
            )}
          </div>

          {/* Headline Announcement */}
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-text font-normal tracking-tight flex items-center gap-2">
            <Sunrise className="w-6 h-6 text-gold hidden sm:inline-block" />
            {session.title}
          </h1>

          {/* Time Window Details */}
          <p className="text-xs sm:text-sm text-text-muted flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Schedule: <strong className="text-text font-medium">{formatTime(session.startTime)} – {formatTime(session.endTime)} IST</strong>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="italic opacity-90">{session.subtitle}</span>
          </p>
        </div>

        {/* Right: Timer & Interactive Controls */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
          {/* Countdown Clock */}
          <div className="text-left md:text-right">
            <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase block">
              {isLive ? 'Bidding Window Closes In' : isUpcoming ? 'Bidding Opens In' : 'Session Status'}
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl sm:text-3xl font-bold tracking-wider ${
                  isLive ? 'text-rose-400' : isUpcoming ? 'text-amber-400' : 'text-text-muted'
                }`}
              >
                {isClosed ? 'CLOSED' : timeLeftStr}
              </span>
              {!isClosed && (
                <span className="text-xs text-text-muted font-sans font-medium">MM:SS</span>
              )}
            </div>
          </div>

          {/* Controls: Sound & Schedule Manager */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute auction chimes' : 'Unmute auction chimes'}
              className="p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-text transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-gold" />
              ) : (
                <VolumeX className="w-4 h-4 text-text-muted" />
              )}
            </button>

            {/* Schedule Control Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-2 border border-border text-xs font-medium text-text hover:border-gold/50 transition-colors shadow-sm"
              title="Adjust auction schedule or test anti-sniping"
            >
              <Settings2 className="w-3.5 h-3.5 text-gold" />
              <span>Schedule / Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bidding Notice Strip if Not Live */}
      {!isLive && (
        <div
          className={`px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium border-t flex items-center justify-between gap-3 ${
            isUpcoming
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              : 'bg-surface-2 border-border text-text-muted'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-gold" />
            <span>
              {isUpcoming
                ? 'Bidding is currently locked. The room will open automatically at the scheduled start time.'
                : 'This morning auction has concluded. Winners are finalized below. New listings will open for tomorrow’s dawn tide.'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleStartDemoTwoMin}
            className="shrink-0 text-xs text-gold underline underline-offset-2 hover:text-text transition-colors font-semibold"
          >
            Start 2-min live test now →
          </button>
        </div>
      )}

      {/* Settings / Test Schedule Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6 relative text-text"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gold/10 text-gold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-text">
                      Auction Schedule & Live Testing
                    </h3>
                    <p className="text-xs text-text-muted">
                      Set official auction window or run quick live simulations
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="my-5 space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
                  Quick Simulation Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleStartDemoTwoMin}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-2 hover:bg-gold/10 border border-border hover:border-gold/40 text-left transition-colors"
                  >
                    <PlayCircle className="w-4 h-4 text-gold shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block text-text">
                        2-Minute Live Demo
                      </span>
                      <span className="text-[11px] text-text-muted block">
                        Ideal for testing live bids & anti-sniping (&lt;30s)
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleStart15Min}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-2 hover:bg-gold/10 border border-border hover:border-gold/40 text-left transition-colors"
                  >
                    <Radio className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block text-text">
                        15-Minute Live Session
                      </span>
                      <span className="text-[11px] text-text-muted block">
                        Standard daytime harvest auction
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleSetUpcoming5Min}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-2 hover:bg-gold/10 border border-border hover:border-gold/40 text-left transition-colors"
                  >
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block text-text">
                        Upcoming (Starts in 5m)
                      </span>
                      <span className="text-[11px] text-text-muted block">
                        Test item editing/deletion before live
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseNow}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-2 hover:bg-rose-500/10 border border-border hover:border-rose-500/40 text-left transition-colors"
                  >
                    <StopCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold block text-text">
                        Close Session Immediately
                      </span>
                      <span className="text-[11px] text-text-muted block">
                        Lock bids, declare winners & unsold lots
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Custom Time Form */}
              <form onSubmit={handleApplyCustomSchedule} className="pt-4 border-t border-border space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
                  Custom Start & End Timestamps
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-text-muted block mb-1">Session Start</span>
                    <input
                      type="datetime-local"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-text-muted block mb-1">Session End</span>
                    <input
                      type="datetime-local"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-surface-2 border border-border text-text focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-gold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset all demo lots & data
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text bg-surface-2 hover:bg-surface border border-border"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!customStart || !customEnd}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold hover:bg-gold/90 text-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save Schedule
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
