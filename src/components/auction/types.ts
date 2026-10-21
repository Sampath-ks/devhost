// types.ts
export type AuctionStatus = 'upcoming' | 'live' | 'closed'

export type ItemStatus = 'upcoming' | 'live' | 'sold' | 'unsold'

export type UnitType = 'kg' | 'crates' | 'quintal' | 'baskets' | 'pieces'

export interface AuctionSession {
  id: string
  title: string
  subtitle: string
  startTime: string // ISO string
  endTime: string // ISO string
  status: AuctionStatus
  antiSnipingTriggered?: boolean
  antiSnipingCount: number
}

export interface ItemBid {
  id: string
  itemId: string
  buyerId: string
  buyerName: string
  amount: number
  createdAt: string
  isWinning?: boolean
}

export interface AuctionItem {
  id: string
  farmerId: string
  farmerName: string
  farmerDistrict: string
  farmerPhone?: string
  name: string
  category: string
  imageUrl: string
  quantity: number
  unit: UnitType
  startingPrice: number
  currentHighestBid: number
  highestBidderId: string | null
  highestBidderName: string | null
  sessionId: string
  status: ItemStatus
  description?: string
  createdAt: string
  bids: ItemBid[]
}

export interface AuctionToast {
  id: string
  type: 'bid' | 'outbid' | 'session' | 'antisnipe' | 'error' | 'success'
  title: string
  message: string
  timestamp: number
}
