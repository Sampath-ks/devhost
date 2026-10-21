import { useLocation, Link } from 'react-router-dom'
import { useRoleTheme } from '@/hooks/useRoleTheme'
import type { Role } from '@/types'
import { Home, Sprout, ChevronDown } from 'lucide-react'
import NotificationBell from '@/components/shared/NotificationBell'

export default function Topbar() {
  const location = useLocation()

  let role: Role | null = null
  let sectionTitle = 'Overview'

  const isFarmerRoute = location.pathname.startsWith('/farmer')
  const isBuyerRoute = location.pathname.startsWith('/buyer') || location.pathname.startsWith('/user')
  const isAuctionRoute = location.pathname.startsWith('/auction')
  const isScenicRoute = isFarmerRoute || isBuyerRoute || isAuctionRoute

  if (isFarmerRoute) {
    role = 'farmer'
    if (location.pathname.includes('/produce')) sectionTitle = 'My Produce Inventory'
    else if (location.pathname.includes('/add')) sectionTitle = 'List New Produce'
    else if (location.pathname.includes('/prices')) sectionTitle = 'Mandi Market Intelligence'
    else sectionTitle = 'Farmer Dashboard'
  } else if (isBuyerRoute) {
    role = 'buyer'
    sectionTitle = 'Farmer Dashboard'
  } else if (location.pathname.startsWith('/store')) {
    role = 'store'
    sectionTitle = 'Central Store Inventory'
  } else if (location.pathname.startsWith('/auction')) {
    role = 'auction'
    sectionTitle = 'Live Harvest Auctions'
  } else if (location.pathname.startsWith('/admin')) {
    sectionTitle = 'Admin Portal & Order Control'
  }

  const theme = useRoleTheme(role)

  if (isScenicRoute) {
    return (
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

        <div className="px-5 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              title="Return to Hub"
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Home className="w-4 h-4 text-emerald-400" />
            </Link>
            <div className="h-4 w-[1px] bg-white/15" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Sprout className="w-4 h-4" />
              </div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
                {sectionTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13291e]/90 border border-[#214734] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider hidden sm:inline">
                {isFarmerRoute ? 'Farmer Desk' : isAuctionRoute ? 'Auction Exchange' : 'Buyer Desk'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <img
                src="/assets/images/portraits/farmer_avatar.jpg"
                alt="Farmer"
                className="w-7 h-7 rounded-full object-cover border-2 border-emerald-500/60 ml-0.5"
              />
            </div>
          </div>
        </div>
      </header>
    )
  }


  return (
    <header className="relative bg-surface border-b border-border select-none">
      {/* Role accent line */}
      <div
        className="h-[2px] w-full transition-colors duration-300"
        style={{ backgroundColor: theme?.color || 'var(--gold)' }}
      />
      <div className="px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            title="Return to Hub"
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          <div className="h-4 w-[1px] bg-border" />
          <h2 className="text-sm md:text-base font-medium text-text">
            {sectionTitle}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme?.color || 'var(--gold)' }}
            />
            <span className="text-xs text-text-muted uppercase tracking-wider font-semibold hidden sm:inline">
              {theme ? `${theme.name} Desk` : 'KisanSetu'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
