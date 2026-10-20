import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import LogoutButton from '@/components/shared/LogoutButton'

export default function DashboardShell() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <Topbar />
      <main className="flex-1 p-6 md:p-8">
        <div className="mb-4 flex justify-end">
          <LogoutButton />
        </div>
        <Outlet />
      </main>
    </div>
  )
}