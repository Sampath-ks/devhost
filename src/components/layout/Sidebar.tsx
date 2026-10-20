// Sidebar.tsx
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Package, PlusCircle, TrendingUp, Sprout } from 'lucide-react'
import { FARMERS } from '@/data/farmers'

const FARMER_NAV_ITEMS = [
  {
    path: '/farmer',
    label: 'Overview',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: '/farmer/produce',
    label: 'My Produce',
    icon: Package,
  },
  {
    path: '/farmer/add',
    label: 'Add Listing',
    icon: PlusCircle,
  },
  {
    path: '/farmer/prices',
    label: 'Market Prices',
    icon: TrendingUp,
  },
]

export default function Sidebar() {
  const location = useLocation()
  const isFarmerRoute = location.pathname.startsWith('/farmer')
  const signedFarmer = FARMERS[0] // Ramesh Patil

  const isNavActive = (itemPath: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === itemPath
    }
    return location.pathname.startsWith(itemPath)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border min-h-screen p-5 justify-between select-none">
        <div>
          {/* Brand/Role Header */}
          <Link to="/" className="flex items-center gap-3 px-3 py-2 mb-6 group">
            <div className="w-9 h-9 rounded-xl bg-farmer/15 border border-farmer/40 flex items-center justify-center text-farmer transition-transform group-hover:scale-105">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg text-text block leading-none">KisanSetu</span>
              <span className="text-[11px] text-farmer uppercase tracking-wider font-semibold">
                Farmer Desk
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {isFarmerRoute ? (
            <nav className="space-y-1.5" aria-label="Farmer Navigation">
              {FARMER_NAV_ITEMS.map((item) => {
                const active = isNavActive(item.path, item.exact)
                const Icon = item.icon

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-farmer ${
                      active ? 'text-text' : 'text-text-muted hover:text-text hover:bg-surface-2/60'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="farmer-sidebar-active"
                        className="absolute inset-0 rounded-xl bg-farmer/20 border border-farmer/50"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 w-4 h-4 transition-colors ${
                        active ? 'text-farmer' : 'text-text-muted'
                      }`}
                    />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          ) : (
            <div className="text-sm text-text-muted px-3 py-2">Sidebar Navigation</div>
          )}
        </div>

        {/* Farmer Profile Footer (Desktop) */}
        {isFarmerRoute && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-2/40 border border-border">
              <img
                src={signedFarmer.portrait}
                alt={signedFarmer.name}
                className="w-10 h-10 rounded-lg object-cover border border-farmer/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text truncate">
                    {signedFarmer.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-farmer shrink-0" />
                </div>
                <p className="text-[11px] text-text-muted truncate">
                  {signedFarmer.village}, {signedFarmer.district}
                </p>
                <p className="text-[10px] text-gold font-medium">★ {signedFarmer.rating} Rating</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Bar */}
      {isFarmerRoute && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border px-3 py-2 z-30 flex items-center justify-around"
          aria-label="Mobile Farmer Navigation"
        >
          {FARMER_NAV_ITEMS.map((item) => {
            const active = isNavActive(item.path, item.exact)
            const Icon = item.icon

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium transition-colors outline-none focus-visible:ring-1 focus-visible:ring-farmer"
              >
                {active && (
                  <motion.div
                    layoutId="farmer-mobile-active"
                    className="absolute inset-0 rounded-lg bg-farmer/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 w-4 h-4 ${
                    active ? 'text-farmer' : 'text-text-muted'
                  }`}
                />
                <span
                  className={`relative z-10 ${
                    active ? 'text-text font-semibold' : 'text-text-muted'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
