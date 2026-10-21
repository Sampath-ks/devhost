import { Outlet, useLocation } from 'react-router-dom'
import Topbar from './Topbar'
import LogoutButton from '@/components/shared/LogoutButton'

export default function DashboardShell() {
  const location = useLocation()
  const isFarmer = location.pathname.startsWith('/farmer')
  const isBuyer = location.pathname.startsWith('/buyer') || location.pathname.startsWith('/user')
  const isAuction = location.pathname.startsWith('/auction')

  const bgImage = isFarmer
    ? `url('/assets/images/portals/auth_bg.jpg')`
    : isBuyer
    ? `url('/images/portals/buyer-back.png')`
    : isAuction
    ? `url('/assets/images/portals/Farmers_bidding.jpg')`
    : undefined

  const hasScenicBg = isFarmer || isBuyer || isAuction

  return (
    <div
      className={`min-h-screen text-text flex flex-col relative ${
        hasScenicBg ? 'bg-cover bg-center bg-fixed' : 'bg-bg'
      }`}
      style={hasScenicBg ? { backgroundImage: bgImage } : undefined}
    >
      {/* Dark atmospheric overlay for scenic pages to highlight glassmorphic cards */}
      {hasScenicBg && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-brightness-[0.82] pointer-events-none z-0"
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-7">
          {!hasScenicBg && (
            <div className="mb-4 flex justify-end">
              <LogoutButton />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
