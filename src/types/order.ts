export type OrderStatus =
  | 'PENDING_APPROVAL'     // Buyer created order, waiting for Farmer to Accept or Reject
  | 'ACCEPTED'             // Farmer accepted; ready to be delivered to store
  | 'REJECTED'             // Farmer rejected
  | 'DELIVERED_TO_STORE'   // Admin marked: Farmer delivered produce to store
  | 'COLLECTED_BY_BUYER'   // Admin marked: Buyer collected produce from store (Completed)

export interface MarketplaceOrder {
  id: string
  listingId: string
  cropName: string
  variety: string
  farmerId: string       // Farmer email or ID
  buyerId: string        // Buyer email or ID
  quantityKg: number
  pricePerKg: number
  totalAmount: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  rejectionReason?: string
  farmerDeliveredAt?: string
  buyerCollectedAt?: string
}

export type NotificationType = 'info' | 'success' | 'warning' | 'alert'

export interface AppNotification {
  id: string
  recipientId: string    // Email or user identifier
  title: string
  message: string
  orderId?: string
  read: boolean
  createdAt: string
  type: NotificationType
}
