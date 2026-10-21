import React from 'react'
import {
  User,
  CalendarDays,
  Check,
  Store,
  FileText,
  Clock,
  XCircle,
} from 'lucide-react'
import type { MarketplaceOrder, OrderStatus } from '@/types/order'
import { getFarmerDisplayName } from '@/lib/recommendationUtils'

interface OrderTrackingCardProps {
  order: MarketplaceOrder
  className?: string
}

// Crop icon / emoji helper
const CROP_EMOJI: Record<string, string> = {
  potato: '🥔',
  tomato: '🍅',
  mango: '🥭',
  banana: '🍌',
  carrot: '🥕',
  onion: '🧅',
  chilli: '🌶️',
  brinjal: '🍆',
  rice: '🌾',
  coconut: '🥥',
}

export default function OrderTrackingCard({ order, className = '' }: OrderTrackingCardProps) {
  const cropKey = (order.cropName || '').trim().toLowerCase()
  const cropEmoji = CROP_EMOJI[cropKey] || '🌱'
  const farmerInfo = getFarmerDisplayName(order.farmerId)

  // Step active calculation: 0 = Order Placed, 1 = Farmer Accepted, 2 = Delivered to Store, 3 = Collected by Buyer
  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 0
      case 'ACCEPTED':
        return 1
      case 'DELIVERED_TO_STORE':
        return 2
      case 'COLLECTED_BY_BUYER':
        return 3
      case 'REJECTED':
        return -1
      default:
        return 0
    }
  }

  const activeIndex = getStepIndex(order.status)
  const isRejected = order.status === 'REJECTED'

  // Contextual status notification message
  const getStatusNotification = (): string => {
    switch (order.status) {
      case 'PENDING_APPROVAL':
        return 'Waiting for farmer to accept your order. You will receive a notification as soon as they respond.'
      case 'ACCEPTED':
        return 'Farmer has accepted your order! Produce is being prepared for transport to the community store.'
      case 'DELIVERED_TO_STORE':
        return 'Produce delivered to community store. Ready for collection by buyer.'
      case 'COLLECTED_BY_BUYER':
        return 'Order fulfilled! Produce has been collected by buyer.'
      case 'REJECTED':
        return order.rejectionReason
          ? `Order declined by farmer: ${order.rejectionReason}`
          : 'Order was declined by the farmer. Listing stock remains intact.'
      default:
        return 'Waiting for farmer to accept your order. You will receive a notification as soon as they respond.'
    }
  }

  // Formatted date (MM/DD/YYYY to match design)
  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : '10/21/2026'

  // Steps definition
  const steps = [
    {
      num: '01',
      title: 'Order Placed',
      type: 'placed',
    },
    {
      num: '02',
      title: 'Farmer Accepted',
      type: 'farmer',
    },
    {
      num: '03',
      title: 'Delivered to Store',
      type: 'store',
    },
    {
      num: '04',
      title: 'Collected by Buyer',
      type: 'buyer',
    },
  ]

  return (
    <div
      className={`relative rounded-[28px] border border-[#1b3f2f] bg-[#071912] p-6 sm:p-7 shadow-2xl overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Background scenic element on the right (matching the user's reference) */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[46%] bg-cover bg-right pointer-events-none opacity-30 mix-blend-screen rounded-r-[28px]"
        style={{ backgroundImage: `url('/images/portals/buyer-back.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#071912] via-[#071912]/92 to-[#071912]/40 pointer-events-none rounded-[28px]" />

      <div className="relative z-10 space-y-6">
        {/* ─── 1. HEADER ROW ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Order Info & Farmer */}
          <div className="space-y-2.5">
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Basket Icon */}
              <div className="text-white shrink-0">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10h16l-1.5 10.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 10z" />
                  <path d="M9 10V6a3 3 0 0 1 6 0v4" />
                  <circle cx="8" cy="8.5" r="1.2" />
                  <circle cx="12" cy="7.5" r="1.4" />
                  <circle cx="16" cy="8.5" r="1.2" />
                </svg>
              </div>

              {/* Order ID */}
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Order <span className="font-bold">#{order.id.startsWith('ORD-') ? order.id : `ORD-${order.id}`}</span>
              </h3>

              {/* Crop Pill Badge */}
              <div className="px-3 py-1 rounded-full bg-[#873a26] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <span>{cropEmoji}</span>
                <span>
                  {order.cropName} {order.variety ? `(${order.variety})` : ''}
                </span>
              </div>
            </div>

            {/* Farmer Subtitle */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User size={15} className="text-slate-300 shrink-0" />
              <span>
                Farmer: <strong className="text-white font-bold ml-0.5">{farmerInfo.name}</strong>
              </span>
            </div>
          </div>

          {/* Right: Order Total & Quantity Rate */}
          <div className="sm:border-l sm:border-[#1f4a36] sm:pl-6 sm:text-left flex flex-col justify-center">
            <span className="text-xs text-slate-400 font-medium block">Order Total</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400 font-medium block mt-0.5">
              {order.quantityKg} kg @ ₹{order.pricePerKg}/kg
            </span>
          </div>
        </div>

        {/* ─── 2. TRACKING STEPS ROW ─── */}
        {isRejected ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs">
            <XCircle size={18} className="text-red-400 shrink-0" />
            <span>{getStatusNotification()}</span>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2">
            {steps.map((step, idx) => {
              const isCurrent = idx === activeIndex
              const isDone = idx < activeIndex

              return (
                <React.Fragment key={step.num}>
                  {/* Step Card */}
                  <div
                    className={`flex-1 relative rounded-2xl overflow-hidden p-3.5 transition-all duration-300 flex items-center gap-3 ${
                      isCurrent
                        ? 'bg-gradient-to-b from-[#143e30] via-[#0d2a20] to-[#091e17] border-2 border-[#2ceaa3] shadow-[0_0_22px_rgba(44,234,163,0.3)]'
                        : isDone
                        ? 'bg-[#0f291f] border border-[#2ceaa3]/60 shadow-md'
                        : 'bg-[#0c2018]/80 border border-[#1b3b2c] backdrop-blur-sm'
                    }`}
                  >
                    {/* Active sparkle rays on top-left of the current card */}
                    {isCurrent && (
                      <div className="absolute -top-3.5 -left-3 text-[#2ceaa3] pointer-events-none select-none">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M4 14 L1 12" />
                          <path d="M8 7 L5 3" />
                          <path d="M14 4 L14 1" />
                        </svg>
                      </div>
                    )}

                    {/* Top-right orange check badge on active/completed card */}
                    {isCurrent && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#f15b38] border-2 border-[#091e17] flex items-center justify-center text-white shadow-lg z-20">
                        <Check size={12} strokeWidth={3.5} />
                      </div>
                    )}
                    {isDone && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#2ceaa3] border-2 border-[#091e17] flex items-center justify-center text-[#091e17] shadow-lg z-20">
                        <Check size={11} strokeWidth={3.5} />
                      </div>
                    )}

                    {/* Fluid wave layer at the bottom of the card */}
                    <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none overflow-hidden">
                      <svg
                        viewBox="0 0 100 20"
                        preserveAspectRatio="none"
                        className={`w-full h-full ${
                          isCurrent ? 'text-[#2ceaa3] opacity-45' : 'text-[#1b4332] opacity-25'
                        }`}
                      >
                        <path d="M0 12 Q 25 5, 50 12 T 100 12 L 100 20 L 0 20 Z" fill="currentColor" />
                      </svg>
                    </div>

                    {/* Icon container */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 relative transition-transform ${
                        isCurrent
                          ? 'bg-white text-[#0a2318] shadow-md ring-2 ring-[#2ceaa3]/40'
                          : isDone
                          ? 'bg-[#184534] text-[#2ceaa3] border border-[#2ceaa3]/40'
                          : 'bg-[#081711] text-slate-400 border border-[#214a38]'
                      }`}
                    >
                      {step.type === 'placed' && (
                        <>
                          <FileText size={18} strokeWidth={2.2} />
                          {isCurrent && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#f15b38] text-white flex items-center justify-center">
                              <Check size={9} strokeWidth={3} />
                            </div>
                          )}
                        </>
                      )}

                      {step.type === 'farmer' && (
                        /* Farmer with wide hat icon */
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 13 C5 11, 19 11, 22 13" />
                          <path d="M6 12 C6 7.5, 18 7.5, 18 12" />
                          <circle cx="12" cy="15" r="2.5" />
                          <path d="M7 21 C7 18.5, 17 18.5, 17 21" />
                        </svg>
                      )}

                      {step.type === 'store' && <Store size={18} strokeWidth={2} />}

                      {step.type === 'buyer' && <User size={18} strokeWidth={2} />}
                    </div>

                    {/* Number and Step Title */}
                    <div className="relative z-10 flex flex-col justify-center">
                      <span
                        className={`text-xs font-bold leading-none ${
                          isCurrent
                            ? 'text-[#2ceaa3]'
                            : isDone
                            ? 'text-[#2ceaa3]'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.num}
                      </span>
                      <span
                        className={`text-xs font-semibold mt-1 leading-tight ${
                          isCurrent
                            ? 'text-white'
                            : isDone
                            ? 'text-slate-100'
                            : 'text-slate-300'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  </div>

                  {/* Connector between cards */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center shrink-0 w-8 text-[#2ceaa3]/80">
                      <svg width="34" height="18" viewBox="0 0 34 18" fill="none">
                        <path
                          d="M0 9 Q 8.5 2, 17 9 T 34 9"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeDasharray="2 3"
                          opacity="0.5"
                        />
                        <path
                          d="M11 7 C 13 5, 15 9, 17 7 C 19 5, 21 9, 23 7"
                          stroke="#2ceaa3"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                        <path
                          d="M11 11 C 13 9, 15 13, 17 11 C 19 9, 21 13, 23 11"
                          stroke="#2ceaa3"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* ─── 3. BOTTOM NOTIFICATION BAR ─── */}
        <div className="rounded-2xl bg-[#081a13]/90 border border-[#1a3c2c] px-4 py-3 flex items-center justify-between gap-3 text-xs shadow-inner">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Triple wave icon */}
            <div className="shrink-0 text-[#2ceaa3]">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <path
                  d="M2 4 C 5 1.5, 8 6.5, 11 4 C 14 1.5, 17 6.5, 20 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M2 8 C 5 5.5, 8 10.5, 11 8 C 14 5.5, 17 10.5, 20 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M2 12 C 5 9.5, 8 14.5, 11 12 C 14 9.5, 17 14.5, 20 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Vertical separator */}
            <div className="border-r border-[#1f4a36] h-4 shrink-0" />

            {/* Notification message */}
            <p className="text-slate-300 text-xs truncate sm:whitespace-normal font-normal">
              {getStatusNotification()}
            </p>
          </div>

          {/* Date pill on the right */}
          <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0 pl-2">
            <CalendarDays size={14} className="text-slate-400" />
            <span className="font-mono">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
