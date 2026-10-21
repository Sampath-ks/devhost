import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
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
  Home,
  LogOut,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrders } from '@/hooks/useOrders'
import { useNotifications } from '@/hooks/useNotifications'
import OrderStepper from '@/components/ui/Stepper'
import { clearSession } from '@/lib/session'

/* ── Status colour helpers matching website theme ── */
const statusBadgeStyle: Record<string, string> = {
  PENDING_APPROVAL: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
  ACCEPTED: 'bg-[#143e30] text-[#2ceaa3] border-[#2ceaa3]/50',
  REJECTED: 'bg-red-950/60 text-red-300 border-red-500/40',
  DELIVERED_TO_STORE: 'bg-sky-950/60 text-sky-300 border-sky-500/40',
  COLLECTED_BY_BUYER: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
}

const statusLabel: Record<string, string> = {
  PENDING_APPROVAL: 'Pending Farmer',
  ACCEPTED: 'Accepted – Deliver to Store',
  REJECTED: 'Rejected',
  DELIVERED_TO_STORE: 'At Central Store',
  COLLECTED_BY_BUYER: 'Completed',
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'success') return <CheckCircle2 size={16} className="text-[#2ceaa3] mt-0.5 shrink-0" />
  if (type === 'warning' || type === 'alert') return <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
  return <Info size={16} className="text-sky-400 mt-0.5 shrink-0" />
}

type AdminSection = 'orders' | 'metrics' | 'notifications' | 'lifecycle'

export default function AdminDashboard() {
  const navigate = useNavigate()
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

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
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
    <div
      className="min-h-screen relative text-slate-100 flex flex-col bg-cover bg-center bg-fixed select-none"
      style={{ backgroundImage: `url('/images/portals/warehouse.jpg')` }}
    >
      {/* Dark atmospheric overlay matching Buyer & Farmer portal aesthetic */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-brightness-[0.78] backdrop-blur-[1px] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ═══ TOPBAR (Signature KisanSetu Glassmorphism) ═══ */}
        <header className="relative bg-[#0b1a13]/90 backdrop-blur-md border-b border-[#183928]/80 select-none z-30 overflow-hidden">
          {/* Subtle decorative contour waves in topbar */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
            <svg viewBox="0 0 1000 60" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M0 30 Q 250 10, 500 35 T 1000 25"
                fill="none"
                stroke="#48bb78"
                strokeWidth="1.5"
              />
              <path
                d="M0 45 Q 300 25, 600 48 T 1000 40"
                fill="none"
                stroke="#38a169"
                strokeWidth="1"
              />
            </svg>
          </div>

          <div className="px-5 py-3 flex items-center justify-between relative z-10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                title="Return to Hub"
                className="p-1.5 rounded-lg text-emerald-400/80 hover:text-white hover:bg-[#132d20] transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </Link>

              <div className="h-4 w-[1px] bg-[#1d4430]" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#143725] border border-[#23583b] flex items-center justify-center text-emerald-400 shadow-sm">
                  <Shield size={16} />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-semibold text-white tracking-wide">
                    Central Store Admin
                  </h2>
                </div>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#13281e] text-emerald-300 border border-emerald-500/40 ml-1">
                  Fulfillment Node
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Toggle */}
              <button
                type="button"
                onClick={() => setActiveSection('notifications')}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  activeSection === 'notifications'
                    ? 'bg-[#2f6f45] text-white border-emerald-500/50 shadow-md'
                    : 'bg-[#10251a] border-[#1b3b2b] text-slate-300 hover:text-white hover:border-emerald-500/40'
                }`}
              >
                <Bell size={14} />
                <span className="hidden sm:inline">Alerts</span>
                {unreadNotifs > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#f15b38] text-white text-[10px] font-bold">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Admin profile pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#1d4430]">
                <div className="w-7 h-7 rounded-full bg-[#184831] border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-xs font-bold">
                  SA
                </div>
                <span className="text-xs font-semibold text-white hidden md:inline">
                  Store Admin
                </span>
              </div>

              {/* Exit Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-medium transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 w-full flex-1">
          {/* Toast Alert */}
          {toast && (
            <div
              className={`mb-6 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-auth-in shadow-2xl backdrop-blur-md ${
                toast.kind === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/80 border border-red-500/50 text-red-200'
              }`}
            >
              {toast.kind === 'success' ? (
                <CheckCircle2 size={18} className="text-[#2ceaa3] shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-400 shrink-0" />
              )}
              <span className="flex-1">{toast.msg}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ─── SIDE DASHBOARD NAVIGATION ─── */}
            <aside className="w-full lg:w-72 shrink-0 bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 space-y-6 shadow-2xl sticky top-20">
              {/* Store Badge Card */}
              <div className="border-b border-[#1b3b2b]/60 pb-5">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-1">
                  <Store size={14} />
                  <span>Central Hub Node</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-white leading-snug">
                  Fulfillment Desk
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Verify farmer lot deliveries, log warehouse intake, and confirm buyer collections.
                </p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Admin Views
                </div>
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2f6f45] text-white shadow-lg shadow-emerald-950/50 border border-emerald-500/40'
                          : 'text-slate-300 hover:text-white hover:bg-[#122c1f] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-white' : 'text-emerald-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-white text-[#091e17]'
                              : 'bg-[#143e30] text-[#2ceaa3] border border-[#2ceaa3]/40'
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
              <div className="border-t border-[#1b3b2b]/60 pt-5 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Action Required
                </div>
                <div className="bg-[#081711]/90 border border-[#1b3b2c] rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Awaiting Farmer:</span>
                    <span className="font-bold text-amber-400">{pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Deliver to Store:</span>
                    <span className="font-bold text-[#2ceaa3]">{accepted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">At Store / Ready:</span>
                    <span className="font-bold text-sky-400">{atStore}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#1b3b2b]/60 pt-1.5">
                    <span className="text-slate-400">Completed:</span>
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
                    <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-5 space-y-4 shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                            <Truck size={20} className="text-[#2ceaa3]" />
                            Live Store Order Pipeline ({filteredOrders.length})
                          </h2>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Manage farmer store drop-offs and mark orders collected by buyers.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          title="Force refresh"
                          className="self-start sm:self-auto p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#153424] border border-[#1f4733] transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                        >
                          <RefreshCw size={13} />
                          <span>Refresh</span>
                        </button>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#1b3b2b]/60 text-xs">
                        <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0 flex items-center gap-1">
                          <Filter size={12} /> Status:
                        </span>
                        {TABS.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              activeTab === tab.id
                                ? 'bg-[#2f6f45] text-white font-bold shadow-md shadow-emerald-950/40 border border-emerald-500/40'
                                : 'bg-[#0e2419] border border-[#1f4733] text-slate-300 hover:text-white hover:border-emerald-500/30'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                      <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-dashed border-[#1b3b2b] rounded-3xl p-16 text-center space-y-3 shadow-xl">
                        <Sprout size={36} className="mx-auto text-slate-500" />
                        <p className="text-slate-300 text-sm font-medium">No orders match this status filter.</p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('ALL')}
                          className="text-[#2ceaa3] text-xs underline cursor-pointer hover:opacity-90"
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
                              className={`bg-[#0c1a14]/90 backdrop-blur-md border rounded-3xl shadow-xl transition-all overflow-hidden ${
                                isAccepted
                                  ? 'border-[#2ceaa3]/40 shadow-[0_0_15px_rgba(44,234,163,0.1)]'
                                  : isAtStore
                                  ? 'border-sky-500/40'
                                  : isCompleted
                                  ? 'border-emerald-500/30'
                                  : isPending
                                  ? 'border-amber-500/30'
                                  : isRejected
                                  ? 'border-red-500/20 opacity-70'
                                  : 'border-[#1b3b2b]/80'
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
                                      <span className="font-mono text-xs font-bold text-amber-400">
                                        #{order.id}
                                      </span>
                                      <h3 className="font-serif text-lg font-bold text-white leading-tight">
                                        {order.cropName}
                                        <span className="font-sans text-xs font-normal text-slate-300 ml-1.5">
                                          ({order.variety})
                                        </span>
                                      </h3>
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                          statusBadgeStyle[order.status] ??
                                          'bg-[#13281e] text-slate-300 border-[#1f4733]'
                                        }`}
                                      >
                                        {statusLabel[order.status] ?? order.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-300 mt-1">
                                      {order.quantityKg} kg · ₹{order.pricePerKg}/kg ·{' '}
                                      <span className="font-bold text-[#2ceaa3]">
                                        ₹{order.totalAmount.toLocaleString()}
                                      </span>
                                      <span className="ml-2 text-slate-400">
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
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2f6f45] hover:bg-[#255b38] text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer whitespace-nowrap"
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
                                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 whitespace-nowrap">
                                      <CheckCircle2 size={14} /> Completed
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="text-xs text-amber-300 italic bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl whitespace-nowrap">
                                      Awaiting farmer acceptance
                                    </span>
                                  )}
                                  {isRejected && (
                                    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-xl whitespace-nowrap">
                                      <XCircle size={13} /> Rejected
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                                  >
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Detail */}
                              {isExpanded && (
                                <div className="border-t border-[#1b3b2b]/60 px-5 pb-5 pt-4 space-y-4 bg-[#081711]/60 animate-auth-in">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#091e17] border border-[#1b3b2c] text-xs">
                                      <User size={15} className="text-emerald-400 shrink-0" />
                                      <div>
                                        <span className="text-slate-400 block text-[11px]">Cultivator</span>
                                        <strong className="text-white break-all">{order.farmerId}</strong>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#091e17] border border-[#1b3b2c] text-xs">
                                      <ShoppingBag size={15} className="text-sky-400 shrink-0" />
                                      <div>
                                        <span className="text-slate-400 block text-[11px]">Buyer</span>
                                        <strong className="text-white break-all">{order.buyerId}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
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

                                  {/* Stepper with the newly upgraded 4-card design */}
                                  <div className="py-2">
                                    <OrderStepper
                                      status={order.status}
                                      farmerDeliveredAt={order.farmerDeliveredAt}
                                      buyerCollectedAt={order.buyerCollectedAt}
                                      createdAt={order.createdAt}
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
                    <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-6 shadow-xl">
                      <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                        <Layers size={20} className="text-[#2ceaa3]" />
                        Central Store Operations KPIs
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Overview of order status distribution across all farmers and buyers.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[
                        {
                          id: 'PENDING_APPROVAL',
                          label: 'Awaiting Farmer',
                          value: pending,
                          icon: <Clock size={20} />,
                          color: 'text-amber-400',
                          accent: 'border-amber-500/30 bg-[#122216]',
                        },
                        {
                          id: 'ACCEPTED',
                          label: 'Deliver to Store',
                          value: accepted,
                          icon: <Truck size={20} />,
                          color: 'text-[#2ceaa3]',
                          accent: 'border-[#2ceaa3]/30 bg-[#0d2a1f]',
                        },
                        {
                          id: 'DELIVERED_TO_STORE',
                          label: 'At Central Store',
                          value: atStore,
                          icon: <Store size={20} />,
                          color: 'text-sky-400',
                          accent: 'border-sky-500/30 bg-[#0c242e]',
                        },
                        {
                          id: 'COLLECTED_BY_BUYER',
                          label: 'Completed',
                          value: completed,
                          icon: <PackageCheck size={20} />,
                          color: 'text-emerald-400',
                          accent: 'border-emerald-500/30 bg-[#0b281b]',
                        },
                        {
                          id: 'ALL',
                          label: 'Total Orders',
                          value: allOrders.length,
                          icon: <Layers size={20} />,
                          color: 'text-slate-300',
                          accent: 'border-[#1b3b2b] bg-[#0c1a14]',
                        },
                      ].map((kpi) => (
                        <button
                          key={kpi.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(kpi.id)
                            setActiveSection('orders')
                          }}
                          className={`p-5 rounded-3xl border text-left transition-all cursor-pointer shadow-xl hover:scale-[1.02] ${kpi.accent}`}
                        >
                          <div className={`mb-3 ${kpi.color}`}>{kpi.icon}</div>
                          <div className="text-3xl font-extrabold text-white">{kpi.value}</div>
                          <div className="text-xs text-slate-300 mt-1 font-medium">{kpi.label}</div>
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
                    <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
                      <div>
                        <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                          <Bell size={20} className="text-[#2ceaa3]" />
                          System Notifications Log ({allNotifications.length})
                        </h2>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Real-time audit log of order events and state transitions.
                        </p>
                      </div>
                      {allNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#143e30] border border-[#2ceaa3]/40 text-xs text-emerald-300 hover:text-white cursor-pointer transition-colors self-start sm:self-auto font-semibold"
                        >
                          <CheckCheck size={14} />
                          <span>Mark all as read</span>
                        </button>
                      )}
                    </div>

                    <div className="rounded-3xl border border-[#1b3b2b]/80 bg-[#0c1a14]/90 backdrop-blur-md overflow-hidden divide-y divide-[#1b3b2b]/60 shadow-xl">
                      {allNotifications.length === 0 ? (
                        <div className="p-16 text-center text-xs text-slate-400">
                          No notifications logged yet.
                        </div>
                      ) : (
                        allNotifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-5 flex items-start gap-3.5 cursor-pointer transition-colors ${
                              n.read
                                ? 'opacity-65 hover:opacity-100'
                                : 'bg-[#0f281e]/60 hover:bg-[#123125]/80'
                            }`}
                          >
                            <NotifIcon type={n.type} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-sm font-semibold text-white truncate">
                                  {n.title}
                                </span>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-[#2ceaa3] shrink-0 animate-pulse" />
                                )}
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                                <Clock size={11} />
                                <span>{new Date(n.createdAt).toLocaleString()}</span>
                                {n.orderId && (
                                  <span className="font-mono text-amber-400">#{n.orderId}</span>
                                )}
                                <span className="px-2 py-0.5 rounded border border-[#1f4733] bg-[#091b13] text-slate-300 text-[10px] uppercase tracking-wide">
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
                    <div className="bg-[#0c1a14]/90 backdrop-blur-md border border-[#1b3b2b]/80 rounded-3xl p-6 shadow-xl">
                      <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                        <Activity size={20} className="text-[#2ceaa3]" />
                        Store SOP — Standard Operating Procedures
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Step-by-step responsibilities for store managers and intake verification.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          step: '1',
                          label: 'Buyer places order',
                          desc: 'Buyer selects produce from one or multiple farmers. The cultivator receives an immediate alert to Accept or Decline.',
                          colorClass: 'bg-[#152718]/90 border-amber-500/30 text-amber-300',
                        },
                        {
                          step: '2',
                          label: 'Farmer accepts & transports',
                          desc: 'Farmer accepts the order. Produce is harvested, packed, and transported to the Central Store.',
                          colorClass: 'bg-[#0f291f]/90 border-[#2ceaa3]/30 text-[#2ceaa3]',
                        },
                        {
                          step: '3',
                          label: 'Admin: Verify & Delivered to Store',
                          desc: 'Store manager inspects the batch quality against listing grade and clicks "Farmer Delivered to Store". Buyer is alerted for pickup.',
                          colorClass: 'bg-[#0d222b]/90 border-sky-500/30 text-sky-300',
                        },
                        {
                          step: '4',
                          label: 'Admin: Buyer Collected',
                          desc: 'Buyer arrives and picks up the produce. Admin clicks "Buyer Collected". Order transitions to Completed and escrow closes.',
                          colorClass: 'bg-[#0b2619]/90 border-emerald-500/30 text-emerald-300',
                        },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className={`rounded-3xl border p-5 space-y-2.5 shadow-xl backdrop-blur-md ${s.colorClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-xs font-bold text-white">
                              {s.step}
                            </span>
                            <p className="font-semibold text-sm text-white">{s.label}</p>
                          </div>
                          <p className="text-xs opacity-85 leading-relaxed text-slate-200">{s.desc}</p>
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
    </div>
  )
}
