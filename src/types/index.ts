// index.ts

export type Role = 'farmer' | 'buyer' | 'store' | 'auction'

export type CropCategory = 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Plantation'

export interface Crop {
  id: string
  name: string
  hindiName: string
  category: CropCategory
  image: string
  unit: 'kg' | 'quintal' | 'piece'
  basePrice: number // in INR (₹)
  shelfLifeDays: number
}

export interface CropListing {
  id: string
  farmerId: string
  cropId: string
  quantity: number
  pricePerUnit: number // in INR (₹)
  qualityGrade: 'A' | 'B' | 'C'
  harvestDate: string // YYYY-MM-DD
  isOrganic?: boolean
  status?: 'Available' | 'Reserved' | 'Sold'
  district?: string
}

export interface Farmer {
  id: string
  name: string
  phone: string
  village: string
  district: string
  state: string
  distanceKm: number
  rating: number
  reviewCount: number
  portrait: string
  joinedDate: string
  listings: CropListing[]
}

export interface MandiPricePoint {
  date: string // YYYY-MM-DD
  modalPrice: number // ₹ per unit
  minPrice: number
  maxPrice: number
}

export interface MandiCropPrices {
  cropId: string
  currentModalPrice: number
  minSuggestedPrice: number
  maxSuggestedPrice: number
  series: MandiPricePoint[]
  previousPeriodSeries: MandiPricePoint[]
}

export type InventoryStatus = 'received' | 'verified' | 'rejected' | 'collected'

export interface InventoryItem {
  id: string
  listingId: string
  farmerId: string
  cropId: string
  quantity: number
  unit: string
  status: InventoryStatus
  receivedAt: string
  verifiedAt?: string
  collectedAt?: string
  warehouseBay: string
  batchNumber: string
  qualityScore?: number
}

export interface OrderLineItem {
  cropId: string
  farmerId: string
  cropName: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  qualityGrade: 'A' | 'B' | 'C'
}

export type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'collected'

export interface Order {
  id: string
  orderNumber: string
  buyerName: string
  buyerPhone: string
  buyerType: 'Retailer' | 'Wholesaler' | 'Restaurant' | 'Bulk Buyer'
  createdAt: string
  status: OrderStatus
  items: OrderLineItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
  collectionSlot?: string
}

export interface AuctionBid {
  bidId: string
  farmerId: string
  farmerName: string
  bidAmountPerUnit: number // in INR (₹)
  offeredQuantity: number
  timestamp: string
}

export type AuctionStatus = 'upcoming' | 'live' | 'closed'

export interface Auction {
  id: string
  cropId: string
  cropName: string
  requiredQuantity: number
  unit: string
  buyerName: string
  targetPricePerUnit: number
  status: AuctionStatus
  startTime: string
  endTime: string
  bids: AuctionBid[]
  winningBid?: AuctionBid
}

export interface Review {
  id: string
  orderId: string
  farmerId: string
  buyerName: string
  rating: number // 1 to 5
  comment: string
  date: string
  cropId: string
}

export default {}
