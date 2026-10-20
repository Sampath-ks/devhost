import { Navigate, Outlet } from 'react-router-dom'
import { getSession, type SessionRole } from '@/lib/session'

export function ProtectedRoute({ allow }: { allow: SessionRole[] }) {
  const session = getSession()

  // Not logged in -> login
  if (!session) return <Navigate to="/login" replace />

  // Logged in but not with the required role -> go to login/register so they can sign into that role
  if (!allow.includes(session.role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

// For /login and /register: allow users to access the login/register page even if logged into another role
export function PublicOnlyRoute() {
  return <Outlet />
}