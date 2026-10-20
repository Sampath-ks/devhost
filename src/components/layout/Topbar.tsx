import { useLocation } from 'react-router-dom'
import { useRoleTheme } from '@/hooks/useRoleTheme'
import type { Role } from '@/types'
import NotificationBell from '@/components/shared/NotificationBell'

export default function Topbar() {
  const location = useLocation()

  let role: Role | null = null
  if (location.pathname.startsWith('/farmer')) role = 'farmer'
  else if (location.pathname.startsWith('/buyer') || location.pathname.startsWith('/user')) role = 'buyer'
  else if (location.pathname.startsWith('/store')) role = 'store'
  else if (location.pathname.startsWith('/auction')) role = 'auction'

  const theme = useRoleTheme(role)

  return (
    <header className="relative bg-surface border-b border-border">
      {/* Role accent line */}
      <div
        className="h-[2px] w-full transition-colors duration-300"
        style={{ backgroundColor: theme?.color || 'var(--gold)' }}
      />
      <div className="px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-text">
            {theme ? `${theme.name} Portal` : 'Dashboard'}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="text-xs text-muted uppercase tracking-wider hidden sm:block">
            {theme ? theme.name : 'Overview'}
          </div>
        </div>
      </div>
    </header>
  )
}
