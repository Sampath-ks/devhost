export type SessionRole = 'farmer' | 'user'

export interface Session {
  email: string
  role: SessionRole
  loggedInAt?: string
}

const SESSION_KEY = 'agri_marketplace_session'

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (s && typeof s.email === 'string' && (s.role === 'farmer' || s.role === 'user')) {
      return s as Session
    }
  } catch {
    /* corrupted session */
  }
  return null
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function homePathFor(role: SessionRole) {
  return role === 'farmer' ? '/farmer' : '/buyer'
}

// The email is the unique farmer ID (there is no backend yet)
export function getFarmerId(): string {
  const s = getSession()
  return s && s.role === 'farmer' ? s.email : ''
}