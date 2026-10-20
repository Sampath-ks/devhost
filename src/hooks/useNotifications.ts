import { useSyncExternalStore } from 'react'
import type { AppNotification } from '@/types/order'
import { getSession } from '@/lib/session'

const NOTIF_KEY = 'agri_marketplace_notifications_v1'

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-demo-1',
    recipientId: 'hiragkulal877@gmail.com',
    title: 'Order Placed by Buyer',
    message: 'A buyer placed an order for 50kg of Tomato (Hybrid). Please accept or reject.',
    orderId: 'ORD-8801',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'info',
  },
  {
    id: 'notif-demo-2',
    recipientId: 'buyer@example.com',
    title: 'Produce Arrived at Store',
    message: 'Your order of Onion (100kg) is delivered to the Central Store and ready for pickup!',
    orderId: 'ORD-8802',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: 'success',
  },
]

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* fallback to initial */
  }
  return initialNotifications
}

let notificationsState: AppNotification[] = loadNotifications()
const notifSubscribers = new Set<() => void>()

async function fetchNotifsFromDb() {
  try {
    const res = await fetch('/api/db')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.notifications) && data.notifications.length > 0) {
        const existingIds = new Set(data.notifications.map((n: any) => n.id))
        const localOnly = notificationsState.filter((n) => !existingIds.has(n.id))
        const merged = [...data.notifications, ...localOnly]

        const isDifferent =
          merged.length !== notificationsState.length ||
          JSON.stringify(merged) !== JSON.stringify(notificationsState)

        if (isDifferent) {
          notificationsState = merged
          try {
            localStorage.setItem(NOTIF_KEY, JSON.stringify(notificationsState))
          } catch {}
          notifSubscribers.forEach((fn) => fn())
        }

        if (localOnly.length > 0) {
          pushNotifsToDb(merged)
        }
      }
    }
  } catch {}
}

async function pushNotifsToDb(notifications: AppNotification[]) {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notifications }),
    })
  } catch {}
}

if (typeof window !== 'undefined') {
  fetchNotifsFromDb()
  setInterval(fetchNotifsFromDb, 2500)
  window.addEventListener('focus', fetchNotifsFromDb)

  window.addEventListener('storage', (e) => {
    if (e.key === NOTIF_KEY) {
      notificationsState = loadNotifications()
      notifSubscribers.forEach((fn) => fn())
    }
  })
}

function setNotificationsState(next: AppNotification[]) {
  notificationsState = next
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notificationsState))
  } catch {
    /* ignore storage errors */
  }
  pushNotifsToDb(notificationsState)
  notifSubscribers.forEach((fn) => fn())
}

const subscribeNotifs = (fn: () => void) => {
  notifSubscribers.add(fn)
  return () => {
    notifSubscribers.delete(fn)
  }
}
const getNotifsSnapshot = () => notificationsState

export function sendNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) {
  const newNotif: AppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    read: false,
    createdAt: new Date().toISOString(),
  }
  setNotificationsState([newNotif, ...notificationsState])
}

export function useNotifications() {
  const allNotifications = useSyncExternalStore(subscribeNotifs, getNotifsSnapshot)
  const session = getSession()
  const currentEmail = session?.email?.toLowerCase().trim() || ''

  // Notifications relevant to current logged-in user
  const userNotifications = allNotifications.filter((n) => {
    if (!currentEmail) return true
    const recipient = n.recipientId.toLowerCase().trim()
    return recipient === currentEmail || recipient === 'all'
  })

  const unreadCount = userNotifications.filter((n) => !n.read).length

  function markAsRead(id: string) {
    setNotificationsState(
      notificationsState.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  function markAllAsRead() {
    setNotificationsState(
      notificationsState.map((n) => {
        const recipient = n.recipientId.toLowerCase().trim()
        if (!currentEmail || recipient === currentEmail || recipient === 'all') {
          return { ...n, read: true }
        }
        return n
      })
    )
  }

  return {
    notifications: userNotifications,
    allNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
  }
}
