// AuctionToasts.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, Zap, Bell, X, ShieldAlert } from 'lucide-react'
import type { AuctionToast } from './types'

interface AuctionToastsProps {
  toasts: AuctionToast[]
  onDismiss: (id: string) => void
}

export default function AuctionToasts({ toasts, onDismiss }: AuctionToastsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error' || toast.type === 'outbid'
          const isAntiSnipe = toast.type === 'antisnipe'
          const isSuccess = toast.type === 'success' || toast.type === 'bid'

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl relative overflow-hidden ${
                isAntiSnipe
                  ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/50'
                  : isError
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-950/50'
                  : isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
                  : 'bg-surface-2/95 border-border text-text shadow-black/60'
              }`}
            >
              {/* Left icon */}
              <div className="shrink-0 mt-0.5">
                {isAntiSnipe ? (
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                    <Zap className="w-4 h-4 animate-pulse" />
                  </div>
                ) : toast.type === 'outbid' ? (
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                    <ShieldAlert className="w-4 h-4 animate-bounce" />
                  </div>
                ) : isError ? (
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : isSuccess ? (
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-surface text-gold">
                    <Bell className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message body */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {toast.title}
                </p>
                <p className="text-xs sm:text-sm font-normal mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-text-muted hover:text-text p-1 rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
