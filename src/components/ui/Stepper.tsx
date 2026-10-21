import React from 'react'
import { Check, Store, FileText, User, XCircle, CalendarDays } from 'lucide-react'
import type { OrderStatus } from '@/types/order'

interface OrderStepperProps {
  status: OrderStatus
  className?: string
  farmerDeliveredAt?: string
  buyerCollectedAt?: string
  createdAt?: string
}

export default function OrderStepper({
  status,
  className = '',
  farmerDeliveredAt,
  buyerCollectedAt,
  createdAt,
}: OrderStepperProps) {
  if (status === 'REJECTED') {
    return (
      <div
        className={`flex items-center gap-2 p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs ${className}`}
      >
        <XCircle size={16} className="text-red-400 shrink-0" />
        <span>Order was declined by the farmer. Listing stock remains intact.</span>
      </div>
    )
  }

  const getStepIndex = () => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 0
      case 'ACCEPTED':
        return 1
      case 'DELIVERED_TO_STORE':
        return 2
      case 'COLLECTED_BY_BUYER':
        return 3
      default:
        return 0
    }
  }

  const activeIndex = getStepIndex()

  const getStatusNotification = (): string => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'Waiting for farmer to accept your order. You will receive a notification as soon as they respond.'
      case 'ACCEPTED':
        return 'Farmer has accepted your order! Produce is being prepared for transport to the store.'
      case 'DELIVERED_TO_STORE':
        return 'Produce delivered to community store. Ready for pickup!'
      case 'COLLECTED_BY_BUYER':
        return 'Produce collected by buyer. Order fulfilled.'
      default:
        return 'Waiting for farmer to accept your order. You will receive a notification as soon as they respond.'
    }
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })

  const steps = [
    { num: '01', title: 'Order Placed', type: 'placed' },
    { num: '02', title: 'Farmer Accepted', type: 'farmer' },
    { num: '03', title: 'Delivered to Store', type: 'store' },
    { num: '04', title: 'Collected by Buyer', type: 'buyer' },
  ]

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* 4 Cards Stepper */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {steps.map((step, idx) => {
          const isCurrent = idx === activeIndex
          const isDone = idx < activeIndex

          return (
            <React.Fragment key={step.num}>
              {/* Step Card */}
              <div
                className={`flex-1 relative rounded-2xl overflow-hidden p-3 transition-all duration-300 flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-gradient-to-b from-[#143e30] via-[#0d2a20] to-[#091e17] border-2 border-[#2ceaa3] shadow-[0_0_20px_rgba(44,234,163,0.3)]'
                    : isDone
                    ? 'bg-[#0f291f] border border-[#2ceaa3]/60 shadow-md'
                    : 'bg-[#0c2018]/80 border border-[#1b3b2c] backdrop-blur-sm'
                }`}
              >
                {/* Active sparkle rays */}
                {isCurrent && (
                  <div className="absolute -top-3.5 -left-3 text-[#2ceaa3] pointer-events-none select-none">
                    <svg
                      width="20"
                      height="20"
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

                {/* Top-right check badge */}
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#f15b38] border-2 border-[#091e17] flex items-center justify-center text-white shadow-lg z-20">
                    <Check size={11} strokeWidth={3.5} />
                  </div>
                )}
                {isDone && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#2ceaa3] border-2 border-[#091e17] flex items-center justify-center text-[#091e17] shadow-lg z-20">
                    <Check size={10} strokeWidth={3.5} />
                  </div>
                )}

                {/* Fluid wave layer */}
                <div className="absolute bottom-0 left-0 right-0 h-3.5 pointer-events-none overflow-hidden">
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

                {/* Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative transition-transform ${
                    isCurrent
                      ? 'bg-white text-[#0a2318] shadow-md ring-2 ring-[#2ceaa3]/40'
                      : isDone
                      ? 'bg-[#184534] text-[#2ceaa3] border border-[#2ceaa3]/40'
                      : 'bg-[#081711] text-slate-400 border border-[#214a38]'
                  }`}
                >
                  {step.type === 'placed' && (
                    <>
                      <FileText size={16} strokeWidth={2.2} />
                      {isCurrent && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#f15b38] text-white flex items-center justify-center">
                          <Check size={8} strokeWidth={3} />
                        </div>
                      )}
                    </>
                  )}

                  {step.type === 'farmer' && (
                    <svg
                      width="19"
                      height="19"
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

                  {step.type === 'store' && <Store size={16} strokeWidth={2} />}

                  {step.type === 'buyer' && <User size={16} strokeWidth={2} />}
                </div>

                {/* Number & Label */}
                <div className="relative z-10 flex flex-col justify-center min-w-0">
                  <span
                    className={`text-[11px] font-bold leading-none ${
                      isCurrent || isDone ? 'text-[#2ceaa3]' : 'text-slate-400'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span
                    className={`text-xs font-semibold mt-0.5 leading-tight truncate ${
                      isCurrent ? 'text-white' : isDone ? 'text-slate-100' : 'text-slate-300'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>

              {/* Connecting line between steps */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center shrink-0 w-6 text-[#2ceaa3]/80">
                  <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                    <path
                      d="M0 8 Q 7 2, 14 8 T 28 8"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="2 3"
                      opacity="0.5"
                    />
                    <path
                      d="M9 6 C 11 4, 12 8, 14 6 C 16 4, 17 8, 19 6"
                      stroke="#2ceaa3"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 10 C 11 8, 12 12, 14 10 C 16 8, 17 12, 19 10"
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

      {/* Helpful timestamps if available */}
      {(farmerDeliveredAt || buyerCollectedAt) && (
        <div className="flex justify-between text-[10px] text-slate-400 px-1">
          {farmerDeliveredAt && (
            <span>
              Delivered:{' '}
              {new Date(farmerDeliveredAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          {buyerCollectedAt && (
            <span>
              Collected:{' '}
              {new Date(buyerCollectedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
