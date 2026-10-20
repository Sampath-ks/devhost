import { Check, Clock, Truck, PackageCheck, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/types/order'

interface OrderStepperProps {
  status: OrderStatus
  className?: string
  farmerDeliveredAt?: string
  buyerCollectedAt?: string
}

const STEPS = [
  { id: 'placed', label: 'Order Placed', icon: Clock },
  { id: 'accepted', label: 'Farmer Accepted', icon: Check },
  { id: 'store', label: 'Delivered to Store', icon: Truck },
  { id: 'collected', label: 'Collected by Buyer', icon: PackageCheck },
]

export default function OrderStepper({
  status,
  className = '',
  farmerDeliveredAt,
  buyerCollectedAt,
}: OrderStepperProps) {
  if (status === 'REJECTED') {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs ${className}`}>
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

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-border -z-0" />

        {/* Filled active track line */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gold transition-all duration-500 -z-0"
          style={{
            width: `${(activeIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const Icon = step.icon
          const isDone = idx < activeIndex
          const isCurrent = idx === activeIndex

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-500/30'
                    : isCurrent
                      ? 'bg-gold text-bg font-bold shadow-lg shadow-gold/30 ring-4 ring-gold/20 animate-pulse'
                      : 'bg-surface-2 border border-border text-muted/60'
                }`}
              >
                {isDone ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium text-center whitespace-nowrap ${
                  isDone
                    ? 'text-emerald-400'
                    : isCurrent
                      ? 'text-gold font-semibold'
                      : 'text-muted/60'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Helpful timestamps */}
      <div className="mt-3 flex justify-between text-[10px] text-muted/70 px-1">
        <span>Awaiting Farmer</span>
        {farmerDeliveredAt && <span>Delivered: {new Date(farmerDeliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        {buyerCollectedAt && <span>Collected: {new Date(buyerCollectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    </div>
  )
}
