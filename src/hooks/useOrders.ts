import { useSyncExternalStore } from 'react'
import type { MarketplaceOrder } from '@/types/order'
import { sendNotification } from '@/hooks/useNotifications'
import { getSession } from '@/lib/session'
import { restoreStock } from '@/hooks/useListings'

const ORDERS_KEY = 'agri_marketplace_orders_v1'

const initialOrders: MarketplaceOrder[] = [
  {
    id: 'ORD-8801',
    listingId: 'L001',
    cropName: 'Tomato',
    variety: 'Hybrid',
    farmerId: 'hiragkulal877@gmail.com',
    buyerId: 'buyer.deepak@gmail.com',
    quantityKg: 50,
    pricePerKg: 24,
    totalAmount: 1200,
    status: 'PENDING_APPROVAL',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'ORD-8802',
    listingId: 'L002',
    cropName: 'Onion',
    variety: 'Red',
    farmerId: 'hiragkulal877@gmail.com',
    buyerId: 'anand.wholesaler@blr.com',
    quantityKg: 100,
    pricePerKg: 18,
    totalAmount: 1800,
    status: 'DELIVERED_TO_STORE',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    farmerDeliveredAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'ORD-8803',
    listingId: 'L003',
    cropName: 'Potato',
    variety: 'Kufri Jyoti',
    farmerId: 'ramesh.patil@karnatakaagri.org',
    buyerId: 'buyer.deepak@gmail.com',
    quantityKg: 200,
    pricePerKg: 21,
    totalAmount: 4200,
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
]

function loadOrders(): MarketplaceOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* fallback to initial */
  }
  return initialOrders
}

let ordersState: MarketplaceOrder[] = loadOrders()
const orderSubscribers = new Set<() => void>()

async function fetchOrdersFromDb() {
  try {
    const res = await fetch('/api/db')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        const existingIds = new Set(data.orders.map((o: any) => o.id))
        const localOnly = ordersState.filter((o) => !existingIds.has(o.id))
        const merged = [...data.orders, ...localOnly]

        const isDifferent =
          merged.length !== ordersState.length ||
          JSON.stringify(merged) !== JSON.stringify(ordersState)

        if (isDifferent) {
          ordersState = merged
          try {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(ordersState))
          } catch {}
          orderSubscribers.forEach((fn) => fn())
        }

        if (localOnly.length > 0) {
          pushOrdersToDb(merged)
        }
      }
    }
  } catch {}
}

async function pushOrdersToDb(orders: MarketplaceOrder[]) {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    })
  } catch {}
}

if (typeof window !== 'undefined') {
  fetchOrdersFromDb()
  setInterval(fetchOrdersFromDb, 2500)
  window.addEventListener('focus', fetchOrdersFromDb)

  window.addEventListener('storage', (e) => {
    if (e.key === ORDERS_KEY) {
      ordersState = loadOrders()
      orderSubscribers.forEach((fn) => fn())
    }
  })
}

function setOrdersState(next: MarketplaceOrder[]) {
  ordersState = next
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(ordersState))
  } catch {
    /* storage quota exceeded or unavailable */
  }
  pushOrdersToDb(ordersState)
  orderSubscribers.forEach((fn) => fn())
}

const subscribeOrders = (fn: () => void) => {
  orderSubscribers.add(fn)
  return () => {
    orderSubscribers.delete(fn)
  }
}
const getOrdersSnapshot = () => ordersState

const PLACED_ORDERS_STORAGE_KEY = 'agri_buyer_placed_order_ids_v1'

function getLocalPlacedOrderIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PLACED_ORDERS_STORAGE_KEY)
    if (raw) {
      const arr = JSON.parse(raw)
      if (Array.isArray(arr)) return new Set(arr)
    }
  } catch {}
  return new Set()
}

function saveLocalPlacedOrderId(orderId: string) {
  try {
    const ids = getLocalPlacedOrderIds()
    ids.add(orderId)
    localStorage.setItem(PLACED_ORDERS_STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {}
}

export function useOrders() {
  const allOrders = useSyncExternalStore(subscribeOrders, getOrdersSnapshot)
  const session = getSession()
  const currentEmail = session?.email?.toLowerCase().trim() || ''

  // Create a new order placed by buyer
  function createOrder(params: {
    listingId: string
    cropName: string
    variety: string
    farmerId: string
    quantityKg: number
    pricePerKg: number
  }) {
    const buyerEmail = currentEmail || 'buyer@example.com'
    const newOrder: MarketplaceOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`,
      listingId: params.listingId,
      cropName: params.cropName,
      variety: params.variety,
      farmerId: params.farmerId,
      buyerId: buyerEmail,
      quantityKg: params.quantityKg,
      pricePerKg: params.pricePerKg,
      totalAmount: Math.round(params.quantityKg * params.pricePerKg * 100) / 100,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveLocalPlacedOrderId(newOrder.id)
    setOrdersState([newOrder, ...ordersState])

    // 1. Notify Farmer of incoming order
    const qtyLabel = params.quantityKg >= 1 ? `${params.quantityKg}kg` : `${Math.round(params.quantityKg * 1000)}g`
    sendNotification({
      recipientId: params.farmerId,
      title: 'New Order Received',
      message: `${buyerEmail} requested an order: please provide ${qtyLabel} of ${params.cropName} (Total: ₹${newOrder.totalAmount}). Please accept or reject.`,
      orderId: newOrder.id,
      type: 'info',
    })

    return newOrder
  }

  // Create multiple orders across multiple farmers in a single atomic action
  function createBatchOrders(
    items: Array<{
      listingId: string
      cropName: string
      variety: string
      farmerId: string
      quantityKg: number
      pricePerKg: number
    }>
  ): MarketplaceOrder[] {
    const buyerEmail = currentEmail || 'buyer@example.com'
    const now = Date.now()
    const newOrders: MarketplaceOrder[] = items.map((item, idx) => {
      const orderId = `ORD-${(now + idx).toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`
      const totalAmount = Math.round(item.quantityKg * item.pricePerKg * 100) / 100
      saveLocalPlacedOrderId(orderId)
      return {
        id: orderId,
        listingId: item.listingId,
        cropName: item.cropName,
        variety: item.variety,
        farmerId: item.farmerId,
        buyerId: buyerEmail,
        quantityKg: item.quantityKg,
        pricePerKg: item.pricePerKg,
        totalAmount,
        status: 'PENDING_APPROVAL' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    setOrdersState([...newOrders, ...ordersState])

    // Send notifications to each individual farmer with exact required quantity
    newOrders.forEach((order) => {
      const qtyLabel = order.quantityKg >= 1 ? `${order.quantityKg}kg` : `${Math.round(order.quantityKg * 1000)}g`
      sendNotification({
        recipientId: order.farmerId,
        title: 'New Order Received',
        message: `${buyerEmail} requested an order: please provide ${qtyLabel} of ${order.cropName} (Total: ₹${order.totalAmount}). Please accept or reject.`,
        orderId: order.id,
        type: 'info',
      })
    })

    return newOrders
  }

  // Farmer accepts order
  function acceptOrder(orderId: string) {
    const order = ordersState.find((o) => o.id === orderId)
    if (!order) return false

    const now = new Date().toISOString()
    const updated: MarketplaceOrder = {
      ...order,
      status: 'ACCEPTED',
      updatedAt: now,
    }

    setOrdersState(ordersState.map((o) => (o.id === orderId ? updated : o)))

    // 2. Notify Buyer that farmer accepted
    sendNotification({
      recipientId: order.buyerId,
      title: 'Order Accepted by Farmer',
      message: `Farmer ${order.farmerId} has accepted your order for ${order.quantityKg}kg of ${order.cropName}. Produce will now be delivered to Central Store.`,
      orderId: order.id,
      type: 'success',
    })

    return true
  }

  // Farmer rejects order
  function rejectOrder(orderId: string, reason: string = 'Stock or schedule constraint') {
    const order = ordersState.find((o) => o.id === orderId)
    if (!order) return false

    const now = new Date().toISOString()
    const updated: MarketplaceOrder = {
      ...order,
      status: 'REJECTED',
      rejectionReason: reason,
      updatedAt: now,
    }

    setOrdersState(ordersState.map((o) => (o.id === orderId ? updated : o)))

    // Automatically restore listing stock when an order is declined/rejected
    if (order.listingId && order.quantityKg > 0) {
      restoreStock(order.listingId, order.quantityKg)
    }

    // Notify Buyer of rejection and stock restoration
    sendNotification({
      recipientId: order.buyerId,
      title: 'Order Declined - Stock Restored',
      message: `Farmer ${order.farmerId} was unable to accept your order for ${order.cropName}. Reason: ${reason}. The produce stock has been restored to the marketplace.`,
      orderId: order.id,
      type: 'warning',
    })

    return true
  }

  // Admin marks: Farmer delivered produce to the central store
  function markDeliveredToStore(orderId: string) {
    const order = ordersState.find((o) => o.id === orderId)
    if (!order) return false

    const now = new Date().toISOString()
    const updated: MarketplaceOrder = {
      ...order,
      status: 'DELIVERED_TO_STORE',
      farmerDeliveredAt: now,
      updatedAt: now,
    }

    setOrdersState(ordersState.map((o) => (o.id === orderId ? updated : o)))

    // 3. Notify Buyer: produce is at the store ready for collection!
    sendNotification({
      recipientId: order.buyerId,
      title: 'Produce Arrived at Central Store',
      message: `Your order #${order.id} (${order.quantityKg}kg ${order.cropName}) has been delivered to Central Store and is ready for pickup!`,
      orderId: order.id,
      type: 'success',
    })

    // 4. Notify Farmer: store verified their delivery
    sendNotification({
      recipientId: order.farmerId,
      title: 'Store Delivery Confirmed',
      message: `Your delivery for order #${order.id} was verified and accepted into the Central Store warehouse.`,
      orderId: order.id,
      type: 'info',
    })

    return true
  }

  // Admin marks: Buyer has collected the produce from the store
  function markCollectedByBuyer(orderId: string) {
    const order = ordersState.find((o) => o.id === orderId)
    if (!order) return false

    const now = new Date().toISOString()
    const updated: MarketplaceOrder = {
      ...order,
      status: 'COLLECTED_BY_BUYER',
      buyerCollectedAt: now,
      updatedAt: now,
    }

    setOrdersState(ordersState.map((o) => (o.id === orderId ? updated : o)))

    // 5. Notify Buyer: order completed
    sendNotification({
      recipientId: order.buyerId,
      title: 'Order Completed',
      message: `Thank you for collecting your order #${order.id} of ${order.cropName}. Transaction completed.`,
      orderId: order.id,
      type: 'success',
    })

    // 6. Notify Farmer: produce collected, payout ready
    sendNotification({
      recipientId: order.farmerId,
      title: 'Produce Collected by Buyer',
      message: `Buyer has collected order #${order.id} (${order.cropName}). Total payout ₹${order.totalAmount} approved.`,
      orderId: order.id,
      type: 'success',
    })

    return true
  }

  // Filtered views
  const farmerOrders = allOrders.filter(
    (o) => !currentEmail || o.farmerId.toLowerCase() === currentEmail
  )

  const buyerOrders = allOrders.filter((o) => {
    // 1. Any order placed in this browser session is always displayed for the buyer
    const localPlacedIds = getLocalPlacedOrderIds()
    if (localPlacedIds.has(o.id)) return true

    // 2. If no user is logged in, show all orders
    if (!currentEmail) return true

    // 3. Match current logged in user's email, or standard buyer emails
    const buyerEmail = (o.buyerId || '').toLowerCase().trim()
    return (
      buyerEmail === currentEmail ||
      buyerEmail === 'buyer@example.com' ||
      buyerEmail === 'quantumshorts49@gmail.com' ||
      buyerEmail === 'buyer.deepak@gmail.com'
    )
  })

  return {
    allOrders,
    farmerOrders,
    buyerOrders,
    createOrder,
    createBatchOrders,
    acceptOrder,
    rejectOrder,
    markDeliveredToStore,
    markCollectedByBuyer,
  }
}
