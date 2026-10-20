// Topbar.tsx
import { useLocation, Link } from 'react-router-dom'
import { useRoleTheme } from '@/hooks/useRoleTheme'
import type { Role } from '@/types'
import { Home } from 'lucide-react'

export default function Topbar() {
  const location = useLocation()

  let role: Role | null = null
  let sectionTitle = 'Overview'

  if (location.pathname.startsWith('/farmer')) {
    role = 'farmer'
    if (location.pathname.includes('/produce')) sectionTitle = 'My Produce Inventory'
    else if (location.pathname.includes('/add')) sectionTitle = 'List New Produce'
    else if (location.pathname.includes('/prices')) sectionTitle = 'Mandi Market Intelligence'
    else sectionTitle = 'Farmer Dashboard'
  } else if (location.pathname.startsWith('/buyer') || location.pathname.startsWith('/user')) {
    role = 'buyer'
    sectionTitle = 'Wholesale Marketplace'
  } else if (location.pathname.startsWith('/store')) {
    role = 'store'
    sectionTitle = 'Central Store Inventory'
  } else if (location.pathname.startsWith('/auction')) {
    role = 'auction'
    sectionTitle = 'Live Harvest Auctions'
  }

  const theme = useRoleTheme(role)

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
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme?.color || 'var(--gold)' }}
          />
          <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
            {theme ? `${theme.name} Desk` : 'KisanSetu'}
          </span>
        </div>
      </div>
    </header>
  )
}
