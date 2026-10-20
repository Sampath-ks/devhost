import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  ArrowLeft,
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  User,
  ShoppingBag,
  Store,
  Layers,
  Bell,
  CheckCheck,
  Info,
  ChevronDown,
  ChevronUp,
  XCircle,
  RefreshCw,
  Activity,
  Sprout,
} from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { useNotifications } from '@/hooks/useNotifications'
import OrderStepper from '@/components/ui/Stepper'

/* ── Status colour helpers ── */
const statusColor: Record<string, string> = {
  PENDING_APPROVAL:   'bg-amber-950/50 text-amber-300 border-amber-500/40',
  ACCEPTED:           'bg-gold/10 text-gold border-gold/40',
  REJECTED:           'bg-red-950/50 text-red-400 border-red-500/40',
  DELIVERED_TO_STORE: 'bg-sky-950/50 text-sky-300 border-sky-500/40',
  COLLECTED_BY_BUYER: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40',
}
const statusLabel: Record<string, string> = {
  PENDING_APPROVAL:   'Pending Farmer',
  ACCEPTED:           'Accepted – Deliver to Store',
  REJECTED:           'Rejected',
  DELIVERED_TO_STORE: 'At Central Store',
  COLLECTED_BY_BUYER: 'Completed',
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'success') return <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
  if (type === 'warning' || type === 'alert') return <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
  return <Info size={14} className="text-sky-400 mt-0.5 shrink-0" />
}

export default function AdminDashboard() {
  const {
    allOrders,
    markDeliveredToStore,
    markCollectedByBuyer,
  } = useOrders()


  const { allNotifications, markAsRead, markAllAsRead } = useNotifications()

  const [activeTab, setActiveTab] = useState('ALL')
  const [notifOpen, setNotifOpen] = useState(false)
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /* ── KPI counts ── */
  const pending   = allOrders.filter((o) => o.status === 'PENDING_APPROVAL').length
  const accepted  = allOrders.filter((o) => o.status === 'ACCEPTED').length
  const atStore   = allOrders.filter((o) => o.status === 'DELIVERED_TO_STORE').length
  const completed = allOrders.filter((o) => o.status === 'COLLECTED_BY_BUYER').length
  const rejected  = allOrders.filter((o) => o.status === 'REJECTED').length
  const unreadNotifs = allNotifications.filter((n) => !n.read).length

  const filteredOrders =
    activeTab === 'ALL'
      ? allOrders
      : allOrders.filter((o) => o.status === activeTab)

  function showToast(msg: string, kind: 'success' | 'error' = 'success') {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 4500)
  }

  function handleMarkDelivered(orderId: string, cropName: string) {
    const ok = markDeliveredToStore(orderId)
    if (ok) showToast(`✓ Order #${orderId} (${cropName}) marked as Delivered to Store. Farmer & Buyer notified.`)
    else showToast('Could not update — order may already be moved.', 'error')
  }

  function handleMarkCollected(orderId: string, cropName: string) {
    const ok = markCollectedByBuyer(orderId)
    if (ok) showToast(`✓ Order #${orderId} (${cropName}) completed! Transaction closed & parties notified.`)
    else showToast('Could not update — order may already be completed.', 'error')
  }

  const TABS = [
    { id: 'ALL',                label: `All (${allOrders.length})` },
    { id: 'ACCEPTED',           label: `Deliver to Store (${accepted})` },
    { id: 'DELIVERED_TO_STORE', label: `At Store / Ready (${atStore})` },
    { id: 'PENDING_APPROVAL',   label: `Pending Farmer (${pending})` },
    { id: 'COLLECTED_BY_BUYER', label: `Completed (${completed})` },
    { id: 'REJECTED',           label: `Rejected (${rejected})` },
  ]

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* ═══ STICKY HEADER ═══ */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-sm">
        <div className="h-[3px] w-full bg-gradient-to-r from-gold via-amber-400 to-gold" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold/15 border border-gold/30 text-gold shadow">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-text leading-tight">
                Central Store Admin
              </h1>
              <p className="text-[11px] text-muted">Order lifecycle · Live cross-browser sync</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification toggle */}
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-border text-muted hover:text-text hover:border-gold/40 text-xs transition-colors cursor-pointer"
            >
              <Bell size={16} />
              <span className="hidden sm:inline">Notifications</span>
              {unreadNotifs > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] px-1 h-[18px] items-center justify-center rounded-full bg-gold text-[10px] font-bold text-bg animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-medium text-muted hover:text-text border border-border px-3 py-2 rounded-xl bg-surface-2 hover:border-gold/40 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Exit Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-7">

        {/* ═══ TOAST ═══ */}
        {toast && (
          <div
            className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-auth-in shadow-lg ${
              toast.kind === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/60 border border-red-500/40 text-red-200'
            }`}
          >
            {toast.kind === 'success'
              ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              : <AlertCircle size={18} className="text-red-400 shrink-0" />}
            <span className="flex-1">{toast.msg}</span>
            <button type="button" onClick={() => setToast(null)} className="text-muted hover:text-text cursor-pointer">
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* ═══ KPI CARDS ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 'PENDING_APPROVAL',   label: 'Awaiting Farmer',  value: pending,   icon: <Clock size={18} />,        color: 'text-amber-400',   accent: 'border-amber-500/30 bg-amber-950/20' },
            { id: 'ACCEPTED',           label: 'Deliver to Store',  value: accepted,  icon: <Truck size={18} />,        color: 'text-gold',        accent: 'border-gold/30 bg-gold/10' },
            { id: 'DELIVERED_TO_STORE', label: 'At Central Store',  value: atStore,   icon: <Store size={18} />,        color: 'text-sky-400',     accent: 'border-sky-500/30 bg-sky-950/20' },
            { id: 'COLLECTED_BY_BUYER', label: 'Completed',         value: completed, icon: <PackageCheck size={18} />, color: 'text-emerald-400', accent: 'border-emerald-500/30 bg-emerald-950/20' },
            { id: 'ALL',                label: 'Total Orders',      value: allOrders.length, icon: <Layers size={18} />, color: 'text-muted',   accent: 'border-border bg-surface-2/50' },
          ].map((kpi) => (
            <button
              key={kpi.id}
              type="button"
              onClick={() => setActiveTab(kpi.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer hover:shadow-md ${
                activeTab === kpi.id
                  ? kpi.accent + ' shadow-lg'
                  : 'bg-surface border-border hover:border-border/70'
              }`}
            >
              <div className={`mb-2 ${kpi.color}`}>{kpi.icon}</div>
              <div className="text-2xl font-bold text-text">{kpi.value}</div>
              <div className="text-[11px] text-muted mt-0.5">{kpi.label}</div>
            </button>
          ))}
        </div>

        {/* ═══ NOTIFICATION PANEL ═══ */}
        {notifOpen && (
          <div className="rounded-2xl border border-border bg-surface shadow-xl animate-auth-in overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-surface-2/60 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gold" />
                <span className="font-semibold text-sm text-text">System Notifications</span>
                {unreadNotifs > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold">
                    {unreadNotifs} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {allNotifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] text-muted hover:text-text cursor-pointer transition-colors"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
                <button type="button" onClick={() => setNotifOpen(false)} className="text-muted hover:text-text cursor-pointer">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {allNotifications.length === 0 ? (
                <div className="p-10 text-center text-xs text-muted">No notifications yet.</div>
              ) : (
                allNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`px-5 py-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      n.read ? 'opacity-55' : 'bg-surface-2/30 hover:bg-surface-2/60'
                    }`}
                  >
                    <NotifIcon type={n.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-text truncate">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />}
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted/60">
                        <Clock size={9} />
                        <span>{new Date(n.createdAt).toLocaleString()}</span>
                        {n.orderId && <span className="font-mono text-gold/70">#{n.orderId}</span>}
                        <span className="px-1.5 py-0.5 rounded border border-border text-muted/50 text-[9px] uppercase tracking-wide">
                          → {n.recipientId}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ═══ TAB FILTERS ═══ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-muted flex items-center gap-1 mr-2 shrink-0">
            <Filter size={13} /> Filter:
          </span>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gold text-bg font-bold shadow-md shadow-gold/20'
                  : 'bg-surface border border-border text-muted hover:text-text hover:border-gold/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => window.location.reload()}
            title="Force refresh"
            className="ml-auto shrink-0 p-1.5 rounded-lg text-muted hover:text-gold hover:bg-gold/10 border border-border transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* ═══ ORDER CARDS ═══ */}
        {filteredOrders.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-2xl p-16 text-center space-y-3">
            <Sprout size={36} className="mx-auto text-muted/40" />
            <p className="text-muted text-sm">No orders match this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isAccepted  = order.status === 'ACCEPTED'
              const isAtStore   = order.status === 'DELIVERED_TO_STORE'
              const isCompleted = order.status === 'COLLECTED_BY_BUYER'
              const isPending   = order.status === 'PENDING_APPROVAL'
              const isRejected  = order.status === 'REJECTED'
              const isExpanded  = expandedId === order.id

              return (
                <div
                  key={order.id}
                  className={`bg-surface border rounded-2xl shadow-sm transition-all ${
                    isAccepted  ? 'border-gold/40 shadow-gold/5' :
                    isAtStore   ? 'border-sky-500/30' :
                    isCompleted ? 'border-emerald-500/30' :
                    isPending   ? 'border-amber-500/30' :
                    isRejected  ? 'border-red-500/20 opacity-70' :
                    'border-border'
                  }`}
                >
                  {/* ── Card Header (clickable to expand) ── */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-gold">#{order.id}</span>
                          <h3 className="font-serif text-lg font-bold text-text leading-tight">
                            {order.cropName}
                            <span className="font-sans text-xs font-normal text-muted ml-1.5">({order.variety})</span>
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor[order.status] ?? 'bg-surface-2 text-muted border-border'}`}>
                            {statusLabel[order.status] ?? order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          {order.quantityKg} kg · ₹{order.pricePerKg}/kg ·{' '}
                          <span className="font-semibold text-text">₹{order.totalAmount.toLocaleString()}</span>
                          <span className="ml-2">· {order.farmerId} → {order.buyerId}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* ── Admin Action Buttons ── */}
                      {isAccepted && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMarkDelivered(order.id, order.cropName) }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-bg text-xs font-bold hover:opacity-90 shadow-md shadow-gold/20 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <Truck size={14} />
                          Farmer Delivered to Store
                        </button>
                      )}
                      {isAtStore && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMarkCollected(order.id, order.cropName) }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-900/20 transition-all cursor-pointer whitespace-nowrap"
                        >
                          <PackageCheck size={14} />
                          Buyer Collected
                        </button>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 whitespace-nowrap">
                          <CheckCircle2 size={14} /> Fully Completed
                        </span>
                      )}
                      {isPending && (
                        <span className="text-xs text-amber-400 italic bg-amber-950/30 border border-amber-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
                          Awaiting farmer acceptance
                        </span>
                      )}
                      {isRejected && (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/30 border border-red-500/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
                          <XCircle size={13} /> Rejected
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-text cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* ── Expanded Detail ── */}
                  {isExpanded && (
                    <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4 animate-auth-in">
                      {/* Farmer / Buyer info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-2/40 border border-border/60 text-xs">
                          <User size={14} className="text-farmer shrink-0" />
                          <div>
                            <span className="text-muted block">Farmer</span>
                            <strong className="text-text break-all">{order.farmerId}</strong>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-2/40 border border-border/60 text-xs">
                          <ShoppingBag size={14} className="text-buyer shrink-0" />
                          <div>
                            <span className="text-muted block">Buyer</span>
                            <strong className="text-text break-all">{order.buyerId}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex flex-wrap gap-4 text-[11px] text-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> Placed: {new Date(order.createdAt).toLocaleString()}
                        </span>
                        {order.farmerDeliveredAt && (
                          <span className="flex items-center gap-1 text-sky-400">
                            <Truck size={11} /> Delivered to Store: {new Date(order.farmerDeliveredAt).toLocaleString()}
                          </span>
                        )}
                        {order.buyerCollectedAt && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <PackageCheck size={11} /> Collected by Buyer: {new Date(order.buyerCollectedAt).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Order Progress Stepper */}
                      <div className="py-2">
                        <OrderStepper
                          status={order.status}
                          farmerDeliveredAt={order.farmerDeliveredAt}
                          buyerCollectedAt={order.buyerCollectedAt}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ═══ LIFECYCLE EXPLAINER ═══ */}
        <div className="rounded-2xl border border-border bg-surface-2/40 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <Activity size={16} className="text-gold" />
            Order Lifecycle — Admin Responsibilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { step: '1', label: 'Buyer places order', desc: 'Buyer selects produce → farmer receives notification to Accept / Reject.', colorClass: 'bg-amber-950/40 border-amber-500/30 text-amber-300' },
              { step: '2', label: 'Farmer accepts',     desc: 'Farmer clicks Accept → buyer notified → produce prepared for delivery to store.', colorClass: 'bg-gold/10 border-gold/30 text-gold' },
              { step: '3', label: 'Admin: Delivered to Store', desc: 'Farmer drops off at Central Store → admin clicks "Farmer Delivered to Store" → buyer notified.', colorClass: 'bg-sky-950/40 border-sky-500/30 text-sky-300' },
              { step: '4', label: 'Admin: Buyer Collected', desc: 'Buyer picks up produce → admin clicks "Buyer Collected" → both parties notified. Transaction closed.', colorClass: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' },
            ].map((s) => (
              <div key={s.step} className={`rounded-xl border p-3.5 space-y-1.5 ${s.colorClass}`}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-current/20 text-[10px] font-bold">{s.step}</span>
                <p className="font-semibold text-[12px]">{s.label}</p>
                <p className="text-[11px] opacity-80 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
