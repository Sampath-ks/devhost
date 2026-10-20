// useRoleTheme.ts
import type { Role } from '@/types'

export interface RoleTheme {
  role: Role
  name: string
  color: string
}

export const ROLE_THEMES: Record<Role, RoleTheme> = {
  farmer: {
    role: 'farmer',
    name: 'Farmer',
    color: '#3F8F4A',
  },
  buyer: {
    role: 'buyer',
    name: 'Buyer',
    color: '#D98A2B',
  },
  store: {
    role: 'store',
    name: 'Store',
    color: '#3E7C8C',
  },
  auction: {
    role: 'auction',
    name: 'Auction',
    color: '#A8442F',
  },
}

export function useRoleTheme(role?: Role | null): RoleTheme | null {
  if (!role || !ROLE_THEMES[role]) return null
  return ROLE_THEMES[role]
}

export default useRoleTheme
