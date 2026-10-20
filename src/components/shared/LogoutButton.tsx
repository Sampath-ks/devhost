import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { clearSession } from '@/lib/session'

export default function LogoutButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={`flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-muted transition-colors hover:border-farmer hover:text-text cursor-pointer ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>Log out</span>
    </button>
  )
}