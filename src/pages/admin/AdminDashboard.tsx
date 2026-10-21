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
  FileText,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '@/hooks/useOrders'
import { useNotifications } from '@/hooks/useNotifications'
import OrderStepper from '@/components/ui/Stepper'

/* ── Status colour helpers ── */
const statusColor: Record<string, string> = {
  PENDING_APPROVAL: 'bg-amber-950/50 text-amber-300 border-amber-500/40',
  ACCEPTED: 'bg-gold/10 text-gold border-gold/40',
  REJECTED: 'bg-red-950/50 text-red-400 border-red-500/40',
  DELIVERED_TO_STORE: 'bg-sky-950/50 text-sky-300 border-sky-500/40',
  COLLECTED_BY_BUYER: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40',
}

const statusLabel: Record<string, string> = {
  PENDING_APPROVAL: 'Pending Farmer',
  ACCEPTED: 'Accepted – Deliver to Store',
  REJECTED: 'Rejected',
  DELIVERED_TO_STORE: 'At Central Store',
  COLLECTED_BY_BUYER: 'Completed',
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'success') return <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
  if (type === 'warning' || type === 'alert') return <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
  return <Info size={14} className="text-sky-400 mt-0.5 shrink-0" />
}

type AdminSection = 'orders' | 'metrics' | 'notifications' | 'lifecycle'

export default function AdminDashboard() {
  const { allOrders, markDeliveredToStore, markCollectedByBuyer } = useOrders()
  const { allNotifications, markAsRead, markAllAsRead } = useNotifications()

  const [activeSection, setActiveSection] = useState<AdminSection>('orders')
  const [activeTab, setActiveTab] = useState('ALL')
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  /* ── KPI counts ── */
  const pending = allOrders.filter((o) => o.status === 'PENDING_APPROVAL').length
  const accepted = allOrders.filter((o) => o.status === 'ACCEPTED').length
  const atStore = allOrders.filter((o) => o.status === 'DELIVERED_TO_STORE').length
  const completed = allOrders.filter((o) => o.status === 'COLLECTED_BY_BUYER').length
  const rejected = allOrders.filter((o) => o.status === 'REJECTED').length
  const unreadNotifs = allNotifications.filter((n) => !n.read).length
  const actionRequired = accepted + atStore

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
    { id: 'ALL', label: `All (${allOrders.length})` },
    { id: 'ACCEPTED', label: `Deliver to Store (${accepted})` },
    { id: 'DELIVERED_TO_STORE', label: `At Store / Ready (${atStore})` },
    { id: 'PENDING_APPROVAL', label: `Pending Farmer (${pending})` },
    { id: 'COLLECTED_BY_BUYER', label: `Completed (${completed})` },
    { id: 'REJECTED', label: `Rejected (${rejected})` },
  ]

  const SIDEBAR_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'orders',
      label: 'Order Dispatch & Intake',
      icon: <Truck size={17} />,
      badge: actionRequired > 0 ? actionRequired : undefined,
    },
    {
      id: 'metrics',
      label: 'Operations Metrics',
      icon: <Layers size={17} />,
    },
    {
      id: 'notifications',
      label: 'System Notification Log',
      icon: <Bell size={17} />,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
    {
      id: 'lifecycle',
      label: 'Store SOP & Lifecycle Guide',
      icon: <FileText size={17} />,
    },
  ]

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* ═══ TOPBAR ═══ */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-sm">
        <div className="h-[3px] w-full bg-gradient-to-r from-gold via-amber-400 to-gold" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gold/15 border border-gold/30 text-gold shadow">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-text leading-tight">
                Central Store Admin
              </h1>
              <p className="text-[11px] text-muted">Order intake & collection fulfillment portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSection('notifications')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                activeSection === 'notifications'
                  ? 'bg-gold text-bg font-bold border-gold'
                  : 'bg-surface-2 border-border text-muted hover:text-text hover:border-gold/40'
              }`}
            >
              <Bell size={15} />
              <span className="hidden sm:inline">Alerts</span>
              {unreadNotifs > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-gold text-bg text-[10px] font-bold">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-text border border-border px-3 py-1.5 rounded-xl bg-surface-2 hover:border-gold/40 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Exit Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ MAIN LAYOUT WITH SIDE DASHBOARD ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-7">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-auth-in shadow-lg ${
              toast.kind === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/60 border border-red-500/40 text-red-200'
            }`}
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-400 shrink-0" />
            )}
            <span className="flex-1">{toast.msg}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-muted hover:text-text cursor-pointer"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ─── SIDE DASHBOARD NAVIGATION ─── */}
          <aside className="w-full lg:w-72 shrink-0 bg-surface border border-border rounded-3xl p-5 space-y-6 shadow-sm sticky top-24">
            {/* Store Badge Card */}
            <div className="border-b border-border/60 pb-5">
              <div className="flex items-center gap-1.5 text-gold text-[11px] font-semibold tracking-wide uppercase mb-1">
                <Store size={14} />
                <span>Central Hub Node</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-text leading-snug">
                Fulfillment Desk
              </h2>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Verify farmer lot deliveries, log warehouse intake, and confirm buyer collections.
              </p>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted px-3 pb-1">
                Admin Views
              </div>
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gold text-bg font-bold shadow-md shadow-gold/20'
                        : 'text-muted hover:text-text hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-bg' : 'text-gold'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-bg text-gold'
                            : 'bg-gold/20 text-gold border border-gold/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Quick KPI Snapshot */}
            <div className="border-t border-border/60 pt-5 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted px-3">
                Action Required
              </div>
              <div className="bg-surface-2/60 border border-border rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Awaiting Farmer:</span>
                  <span className="font-bold text-amber-400">{pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Deliver to Store:</span>
                  <span className="font-bold text-gold">{accepted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">At Store / Ready:</span>
                  <span className="font-bold text-sky-400">{atStore}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-1.5">
                  <span className="text-muted">Completed:</span>
                  <span className="font-semibold text-emerald-400">{completed}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ─── MAIN CONTENT VIEW CANVAS ─── */}
          <main className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              {/* VIEW 1: ORDER DISPATCH & INTAKE */}
              {activeSection === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  {/* View Header with Filter Pills */}
                  <div className="bg-surface border border-border rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                          <Truck size={20} className="text-gold" />
                          Live Store Order Pipeline ({filteredOrders.length})
                        </h2>
                        <p className="text-xs text-muted mt-0.5">
                          Manage farmer store drop-offs and mark orders collected by buyers.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        title="Force refresh"
                        className="self-start sm:self-auto p-2 rounded-xl text-muted hover:text-gold hover:bg-gold/10 border border-border transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/60 text-xs">
                      <span className="text-muted text-[11px] font-medium mr-1 shrink-0 flex items-center gap-1">
                        <Filter size={12} /> Status:
                      </span>
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === tab.id
                              ? 'bg-gold text-bg font-bold shadow-sm'
                              : 'bg-surface-2 border border-border text-muted hover:text-text hover:border-gold/30'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders List */}
                  {filteredOrders.length === 0 ? (
                    <div className="bg-surface border border-dashed border-border rounded-3xl p-16 text-center space-y-3">
                      <Sprout size={36} className="mx-auto text-muted/40" />
                      <p className="text-muted text-sm font-medium">No orders match this status filter.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('ALL')}
                        className="text-gold text-xs underline cursor-pointer"
                      >
                        View all orders
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => {
                        const isAccepted = order.status === 'ACCEPTED'
                        const isAtStore = order.status === 'DELIVERED_TO_STORE'
                        const isCompleted = order.status === 'COLLECTED_BY_BUYER'
                        const isPending = order.status === 'PENDING_APPROVAL'
                        const isRejected = order.status === 'REJECTED'
                        const isExpanded = expandedId === order.id

                        return (
                          <div
                            key={order.id}
                            className={`bg-surface border rounded-3xl shadow-sm transition-all overflow-hidden ${
                              isAccepted
                                ? 'border-gold/40 shadow-gold/5'
                                : isAtStore
                                ? 'border-sky-500/40'
                                : isCompleted
                                ? 'border-emerald-500/30'
                                : isPending
                                ? 'border-amber-500/30'
                                : isRejected
                                ? 'border-red-500/20 opacity-70'
                                : 'border-border'
                            }`}
                          >
                            {/* Card Header */}
                            <div
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 cursor-pointer select-none"
                              onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-bold text-gold">
                                      #{order.id}
                                    </span>
                                    <h3 className="font-serif text-lg font-bold text-text leading-tight">
                                      {order.cropName}
                                      <span className="font-sans text-xs font-normal text-muted ml-1.5">
                                        ({order.variety})
                                      </span>
                                    </h3>
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                        statusColor[order.status] ??
                                        'bg-surface-2 text-muted border-border'
                                      }`}
                                    >
                                      {statusLabel[order.status] ?? order.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted mt-1">
                                    {order.quantityKg} kg · ₹{order.pricePerKg}/kg ·{' '}
                                    <span className="font-semibold text-text">
                                      ₹{order.totalAmount.toLocaleString()}
                                    </span>
                                    <span className="ml-2">
                                      · {order.farmerId} &rarr; {order.buyerId}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {/* Admin Action Buttons */}
                                {isAccepted && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkDelivered(order.id, order.cropName)
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-bg text-xs font-bold hover:opacity-90 shadow-md shadow-gold/20 transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    <Truck size={14} />
                                    <span>Farmer Delivered to Store</span>
                                  </button>
                                )}
                                {isAtStore && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkCollected(order.id, order.cropName)
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-900/20 transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    <PackageCheck size={14} />
                                    <span>Buyer Collected</span>
                                  </button>
                                )}
                                {isCompleted && (
                                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 whitespace-nowrap">
                                    <CheckCircle2 size={14} /> Completed
                                  </span>
                                )}
                                {isPending && (
                                  <span className="text-xs text-amber-400 italic bg-amber-950/30 border border-amber-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
                                    Awaiting farmer acceptance
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/30 border border-red-500/20 px-3 py-1.5 rounded-xl whitespace-nowrap">
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

                            {/* Expanded Detail */}
                            {isExpanded && (
                              <div className="border-t border-border/50 px-5 pb-5 pt-4 space-y-4 bg-surface-2/30 animate-auth-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-surface border border-border text-xs">
                                    <User size={15} className="text-farmer shrink-0" />
                                    <div>
                                      <span className="text-muted block text-[11px]">Cultivator</span>
                                      <strong className="text-text break-all">{order.farmerId}</strong>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-surface border border-border text-xs">
                                    <ShoppingBag size={15} className="text-buyer shrink-0" />
                                    <div>
                                      <span className="text-muted block text-[11px]">Buyer</span>
                                      <strong className="text-text break-all">{order.buyerId}</strong>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-4 text-[11px] text-muted">
                                  <span className="flex items-center gap-1">
                                    <Clock size={11} /> Placed: {new Date(order.createdAt).toLocaleString()}
                                  </span>
                                  {order.farmerDeliveredAt && (
                                    <span className="flex items-center gap-1 text-sky-400">
                                      <Truck size={11} /> Delivered to Store:{' '}
                                      {new Date(order.farmerDeliveredAt).toLocaleString()}
                                    </span>
                                  )}
                                  {order.buyerCollectedAt && (
                                    <span className="flex items-center gap-1 text-emerald-400">
                                      <PackageCheck size={11} /> Collected by Buyer:{' '}
                                      {new Date(order.buyerCollectedAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>

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
                </motion.div>
              )}

              {/* VIEW 2: OPERATIONS METRICS */}
              {activeSection === 'metrics' && (
                <motion.div
                  key="metrics"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="bg-surface border border-border rounded-3xl p-6">
                    <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                      <Layers size={20} className="text-gold" />
                      Central Store Operations KPIs
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      Overview of order status distribution across all farmers and buyers.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      {
                        id: 'PENDING_APPROVAL',
                        label: 'Awaiting Farmer',
                        value: pending,
                        icon: <Clock size={18} />,
                        color: 'text-amber-400',
                        accent: 'border-amber-500/30 bg-amber-950/20',
                      },
                      {
                        id: 'ACCEPTED',
                        label: 'Deliver to Store',
                        value: accepted,
                        icon: <Truck size={18} />,
                        color: 'text-gold',
                        accent: 'border-gold/30 bg-gold/10',
                      },
                      {
                        id: 'DELIVERED_TO_STORE',
                        label: 'At Central Store',
                        value: atStore,
                        icon: <Store size={18} />,
                        color: 'text-sky-400',
                        accent: 'border-sky-500/30 bg-sky-950/20',
                      },
                      {
                        id: 'COLLECTED_BY_BUYER',
                        label: 'Completed',
                        value: completed,
                        icon: <PackageCheck size={18} />,
                        color: 'text-emerald-400',
                        accent: 'border-emerald-500/30 bg-emerald-950/20',
                      },
                      {
                        id: 'ALL',
                        label: 'Total Orders',
                        value: allOrders.length,
                        icon: <Layers size={18} />,
                        color: 'text-muted',
                        accent: 'border-border bg-surface-2/50',
                      },
                    ].map((kpi) => (
                      <button
                        key={kpi.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(kpi.id)
                          setActiveSection('orders')
                        }}
                        className={`p-5 rounded-3xl border text-left transition-all cursor-pointer bg-surface hover:shadow-md ${kpi.accent}`}
                      >
                        <div className={`mb-3 ${kpi.color}`}>{kpi.icon}</div>
                        <div className="text-3xl font-bold text-text">{kpi.value}</div>
                        <div className="text-xs text-muted mt-1">{kpi.label}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* VIEW 3: SYSTEM NOTIFICATIONS LOG */}
              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                        <Bell size={20} className="text-gold" />
                        System Notifications Log ({allNotifications.length})
                      </h2>
                      <p className="text-xs text-muted mt-0.5">
                        Real-time audit log of order events and state transitions.
                      </p>
                    </div>
                    {allNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-muted hover:text-text cursor-pointer transition-colors self-start sm:self-auto"
                      >
                        <CheckCheck size={14} />
                        <span>Mark all as read</span>
                      </button>
                    )}
                  </div>

                  <div className="rounded-3xl border border-border bg-surface overflow-hidden divide-y divide-border/50">
                    {allNotifications.length === 0 ? (
                      <div className="p-16 text-center text-xs text-muted">
                        No notifications logged yet.
                      </div>
                    ) : (
                      allNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-5 flex items-start gap-3.5 cursor-pointer transition-colors ${
                            n.read ? 'opacity-60' : 'bg-surface-2/40 hover:bg-surface-2/70'
                          }`}
                        >
                          <NotifIcon type={n.type} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-sm font-semibold text-text truncate">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-gold shrink-0 animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-muted leading-relaxed">{n.message}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted/70">
                              <Clock size={11} />
                              <span>{new Date(n.createdAt).toLocaleString()}</span>
                              {n.orderId && (
                                <span className="font-mono text-gold/80">#{n.orderId}</span>
                              )}
                              <span className="px-2 py-0.5 rounded border border-border text-muted/60 text-[10px] uppercase tracking-wide">
                                &rarr; {n.recipientId}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIEW 4: STORE SOP & LIFECYCLE GUIDE */}
              {activeSection === 'lifecycle' && (
                <motion.div
                  key="lifecycle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="bg-surface border border-border rounded-3xl p-6">
                    <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                      <Activity size={20} className="text-gold" />
                      Store SOP — Standard Operating Procedures
                    </h2>
                    <p className="text-xs text-muted mt-0.5">
                      Step-by-step responsibilities for store managers and intake verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        step: '1',
                        label: 'Buyer places order',
                        desc: 'Buyer selects produce from one or multiple farmers. The cultivator receives an immediate alert to Accept or Decline.',
                        colorClass: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
                      },
                      {
                        step: '2',
                        label: 'Farmer accepts & transports',
                        desc: 'Farmer accepts the order. Produce is harvested, packed, and transported to the Central Store.',
                        colorClass: 'bg-gold/10 border-gold/30 text-gold',
                      },
                      {
                        step: '3',
                        label: 'Admin: Verify & Delivered to Store',
                        desc: 'Store manager inspects the batch quality against listing grade and clicks "Farmer Delivered to Store". Buyer is alerted for pickup.',
                        colorClass: 'bg-sky-950/40 border-sky-500/30 text-sky-300',
                      },
                      {
                        step: '4',
                        label: 'Admin: Buyer Collected',
                        desc: 'Buyer arrives and picks up the produce. Admin clicks "Buyer Collected". Order transitions to Completed and escrow closes.',
                        colorClass: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
                      },
                    ].map((s) => (
                      <div
                        key={s.step}
                        className={`rounded-3xl border p-5 space-y-2.5 ${s.colorClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-current/20 text-xs font-bold">
                            {s.step}
                          </span>
                          <p className="font-semibold text-sm">{s.label}</p>
                        </div>
                        <p className="text-xs opacity-85 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
