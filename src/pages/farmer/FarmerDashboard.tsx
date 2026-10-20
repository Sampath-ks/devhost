import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Scale, ListChecks, BarChart3, ShoppingBag, Check, X, Clock, AlertCircle } from 'lucide-react'
import { useListings } from '@/hooks/useListings'
import { useOrders } from '@/hooks/useOrders'
import PriceCheckPanel from '@/components/shared/PriceCheckPanel'
import OrderStepper from '@/components/ui/Stepper'

export default function FarmerDashboard() {
  const { listings } = useListings()
  const { farmerOrders, acceptOrder, rejectOrder } = useOrders()
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [orderNotice, setOrderNotice] = useState<string | null>(null)

  const open = listings.filter((l) => l.status !== 'Closed')
  const active = listings.filter((l) => l.status === 'Active')
  const totalKg = active.reduce((sum, l) => sum + l.quantityKg, 0)

  const pendingOrders = farmerOrders.filter((o) => o.status === 'PENDING_APPROVAL')
  const activeOrders = farmerOrders.filter((o) => o.status !== 'PENDING_APPROVAL')

  const handleAccept = (orderId: string, cropName: string) => {
    acceptOrder(orderId)
    setOrderNotice(`Order for ${cropName} accepted! Buyer has been notified. Please deliver produce to the Central Store.`)
    setTimeout(() => setOrderNotice(null), 4000)
  }

  const handleReject = (orderId: string, cropName: string) => {
    rejectOrder(orderId, 'Quantity or delivery unavailable')
    setOrderNotice(`Order for ${cropName} declined. Buyer has been notified.`)
    setTimeout(() => setOrderNotice(null), 4000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Farmer Dashboard</h1>
          <p className="text-sm text-muted">Your produce, buyer orders, and market price guidance.</p>
        </div>
        <Link
          to="/farmer/listings"
          className="rounded-lg bg-farmer px-4 py-2 text-sm font-medium text-text hover:opacity-90"
        >
          Manage listings
        </Link>
      </div>

      {orderNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-farmer/40 text-emerald-200 text-xs sm:text-sm flex items-center gap-2 animate-auth-in">
          <Check size={16} className="text-farmer shrink-0" />
          <span>{orderNotice}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <ListChecks className="mb-2 text-farmer" size={20} />
          <div className="text-2xl font-semibold">{open.length}</div>
          <div className="text-xs text-muted">Open listings</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <Scale className="mb-2 text-farmer" size={20} />
          <div className="text-2xl font-semibold">{totalKg} kg</div>
          <div className="text-xs text-muted">Active quantity</div>
        </div>
      </div>

      {/* Incoming Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
              <ShoppingBag size={20} className="text-farmer" />
              Incoming Buyer Orders ({farmerOrders.length})
            </h2>
            <p className="text-xs text-muted">
              Accept orders to start delivery to the Central Store.
            </p>
          </div>
          {pendingOrders.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold animate-pulse">
              {pendingOrders.length} Pending Approval
            </span>
          )}
        </div>

        {farmerOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-6 text-center text-xs text-muted">
            No orders received from buyers yet. As soon as buyers place orders, they will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {farmerOrders.map((order) => {
              const isPending = order.status === 'PENDING_APPROVAL'

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border p-5 bg-surface transition-all ${
                    isPending ? 'border-gold/50 shadow-md shadow-gold/5' : 'border-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gold">#{order.id}</span>
                        <h3 className="font-semibold text-text">
                          {order.cropName} ({order.variety})
                        </h3>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Buyer: <strong className="text-text">{order.buyerId}</strong> · {order.quantityKg} kg @ ₹{order.pricePerKg}/kg
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-muted block">Total Payment</span>
                        <span className="text-base font-bold text-farmer">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Progress Stepper */}
                  <div className="py-3">
                    <OrderStepper
                      status={order.status}
                      farmerDeliveredAt={order.farmerDeliveredAt}
                      buyerCollectedAt={order.buyerCollectedAt}
                    />
                  </div>

                  {/* Actions or Next Step Guidance */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border/50">
                    <div className="text-[11px] text-muted flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div>
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(order.id, order.cropName)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-farmer text-text text-xs font-semibold hover:opacity-90 shadow-sm cursor-pointer"
                          >
                            <Check size={14} /> Accept Order
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(order.id, order.cropName)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-xs font-medium hover:bg-red-950/40 cursor-pointer"
                          >
                            <X size={14} /> Decline
                          </button>
                        </div>
                      ) : order.status === 'ACCEPTED' ? (
                        <span className="text-xs text-gold font-medium bg-gold/10 border border-gold/30 px-3 py-1 rounded-lg">
                          Produce accepted — Please deliver to Central Store
                        </span>
                      ) : order.status === 'DELIVERED_TO_STORE' ? (
                        <span className="text-xs text-sky-400 font-medium bg-sky-950/40 border border-sky-500/30 px-3 py-1 rounded-lg">
                          Delivered to Store — Awaiting Buyer Collection
                        </span>
                      ) : order.status === 'COLLECTED_BY_BUYER' ? (
                        <span className="text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
                          Completed & Paid
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Your Listings Section */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Your produce listings</h2>

        {open.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
            No open listings. <Link to="/farmer/listings" className="text-farmer hover:underline">Create one</Link>.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {open.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {l.cropName} <span className="font-normal text-muted">({l.variety})</span>
                    </h3>
                    <p className="text-xs text-muted">
                      {l.quantityKg} kg · ₹{l.askingPrice}/kg · Grade {l.qualityGrade}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
                    {l.status}
                  </span>
                </div>

                {checkingId === l.id ? (
                  <PriceCheckPanel listing={l} onClose={() => setCheckingId(null)} />
                ) : (
                  <button
                    onClick={() => setCheckingId(l.id)}
                    className="mt-4 flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-farmer cursor-pointer"
                  >
                    <BarChart3 size={14} /> Check market price
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}