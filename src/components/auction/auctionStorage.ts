// auctionStorage.ts
import type { AuctionSession, AuctionItem, ItemBid, AuctionStatus, ItemStatus } from './types'
import { soundEffects } from './soundEffects'

const SESSION_STORAGE_KEY = 'kisansetu_auction_session_v2'
const ITEMS_STORAGE_KEY = 'kisansetu_auction_items_v2'
const BIDS_STORAGE_KEY = 'kisansetu_auction_bids_v2'
const BROADCAST_CHANNEL_NAME = 'kisansetu_auction_broadcast_v2'

// Initial Coastal Morning Produce Seed
function getInitialSession(): AuctionSession {
  const now = new Date()
  const start = new Date(now.getTime() - 25 * 60 * 1000) // Started 25 mins ago
  const end = new Date(now.getTime() + 35 * 60 * 1000) // Closes in 35 mins

  return {
    id: 'session-morning-dawn',
    title: "Morning Coastal Harvest Auction",
    subtitle: "Wharf Platform 4 • Fresh dawn catches & coastal produce lots",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    status: 'live',
    antiSnipingCount: 0,
    antiSnipingTriggered: false,
  }
}

function getInitialItems(sessionId: string): AuctionItem[] {
  const now = new Date()
  return [
    {
      id: 'lot-mango-01',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh Patil',
      farmerDistrict: 'Ratnagiri / Konkan Coast',
      farmerPhone: '+91 98234 11029',
      name: 'Ratnagiri Alphonso Mangoes (GI Tag)',
      category: 'Fruits',
      imageUrl: '/assets/images/crops/mango.png',
      quantity: 50,
      unit: 'crates',
      startingPrice: 1800,
      currentHighestBid: 2250,
      highestBidderId: 'buyer-south-traders',
      highestBidderName: 'Malabar Wholesalers Ltd',
      sessionId,
      status: 'live',
      description: 'Hand-picked pre-dawn from sea-facing orchards. 12 dozen per wooden crate, zero chemical ripening.',
      createdAt: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      bids: [
        {
          id: 'bid-m-1',
          itemId: 'lot-mango-01',
          buyerId: 'buyer-coastal-retail',
          buyerName: 'Deccan Marts',
          amount: 1950,
          createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
        },
        {
          id: 'bid-m-2',
          itemId: 'lot-mango-01',
          buyerId: 'buyer-south-traders',
          buyerName: 'Malabar Wholesalers Ltd',
          amount: 2250,
          createdAt: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'lot-onion-02',
      farmerId: 'farmer-2',
      farmerName: 'Sunita Devi',
      farmerDistrict: 'Coastal Belts, Nashik/Raigad',
      farmerPhone: '+91 94152 77310',
      name: 'Coastal Red Shallots / Nashik Onions',
      category: 'Vegetables',
      imageUrl: '/assets/images/crops/onion.png',
      quantity: 1200,
      unit: 'kg',
      startingPrice: 28,
      currentHighestBid: 34,
      highestBidderId: 'buyer-port-canteen',
      highestBidderName: 'Harbor Canteens Consortium',
      sessionId,
      status: 'live',
      description: 'Medium 45-55mm graded red onions, naturally sun-cured with high shelf stability for port transit.',
      createdAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      bids: [
        {
          id: 'bid-o-1',
          itemId: 'lot-onion-02',
          buyerId: 'buyer-port-canteen',
          buyerName: 'Harbor Canteens Consortium',
          amount: 34,
          createdAt: new Date(now.getTime() - 14 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'lot-banana-03',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh Patil',
      farmerDistrict: 'Ratnagiri / Konkan Coast',
      farmerPhone: '+91 98234 11029',
      name: 'Malabar Nendran Big Plantains',
      category: 'Fruits',
      imageUrl: '/assets/images/crops/banana.png',
      quantity: 800,
      unit: 'kg',
      startingPrice: 32,
      currentHighestBid: 32,
      highestBidderId: null,
      highestBidderName: null,
      sessionId,
      status: 'live',
      description: 'First-cut robust bunches, ideal for commercial chips processing or coastal wholesale supply.',
      createdAt: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      bids: [],
    },
    {
      id: 'lot-chilli-04',
      farmerId: 'farmer-6',
      farmerName: 'Chetan Shinde',
      farmerDistrict: 'Guntur / Coastal Andhra',
      farmerPhone: '+91 97654 32109',
      name: 'Stemless Guntur S17 Red Chillies',
      category: 'Spices',
      imageUrl: '/assets/images/crops/chilli.png',
      quantity: 350,
      unit: 'kg',
      startingPrice: 140,
      currentHighestBid: 165,
      highestBidderId: 'buyer-spice-route',
      highestBidderName: 'SpiceRoute Exporters',
      sessionId,
      status: 'live',
      description: 'Deep red color value 80+ ASTA, low moisture (<10%), sun-dried on clean tarpaulins.',
      createdAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      bids: [
        {
          id: 'bid-c-1',
          itemId: 'lot-chilli-04',
          buyerId: 'buyer-curry-king',
          buyerName: 'CurryKing Foods',
          amount: 150,
          createdAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
        },
        {
          id: 'bid-c-2',
          itemId: 'lot-chilli-04',
          buyerId: 'buyer-spice-route',
          buyerName: 'SpiceRoute Exporters',
          amount: 165,
          createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'lot-coconut-05',
      farmerId: 'farmer-2',
      farmerName: 'Sunita Devi',
      farmerDistrict: 'Coastal Karnataka / Konkan',
      farmerPhone: '+91 94152 77310',
      name: 'Konkan Sweet Tender Coconuts (Grade A)',
      category: 'Plantation',
      imageUrl: '/assets/images/crops/coconut.png',
      quantity: 600,
      unit: 'pieces',
      startingPrice: 38,
      currentHighestBid: 46,
      highestBidderId: 'buyer-ocean-refresh',
      highestBidderName: 'OceanRefresh Beverages',
      sessionId,
      status: 'live',
      description: 'Plump green coconuts with minimum 400ml sweet water, freshly harvested at 4 AM today.',
      createdAt: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(),
      bids: [
        {
          id: 'bid-co-1',
          itemId: 'lot-coconut-05',
          buyerId: 'buyer-ocean-refresh',
          buyerName: 'OceanRefresh Beverages',
          amount: 46,
          createdAt: new Date(now.getTime() - 11 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      id: 'lot-tomato-06',
      farmerId: 'farmer-1',
      farmerName: 'Ramesh Patil',
      farmerDistrict: 'Ratnagiri / Konkan Coast',
      farmerPhone: '+91 98234 11029',
      name: 'Dawn-Plucked Vine Red Tomatoes',
      category: 'Vegetables',
      imageUrl: '/assets/images/crops/tomato.png',
      quantity: 1500,
      unit: 'kg',
      startingPrice: 22,
      currentHighestBid: 28,
      highestBidderId: 'buyer-fresh-chain',
      highestBidderName: 'Apex Fresh Supermarkets',
      sessionId,
      status: 'live',
      description: 'Firm, uniform size, graded table tomatoes with tight calyx. Zero transit bruise.',
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      bids: [
        {
          id: 'bid-t-1',
          itemId: 'lot-tomato-06',
          buyerId: 'buyer-fresh-chain',
          buyerName: 'Apex Fresh Supermarkets',
          amount: 28,
          createdAt: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        },
      ],
    },
  ]
}

// Global broadcast channel instance for real-time multi-tab synchronization
let broadcastChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
  } catch {
    broadcastChannel = null
  }
}

export const auctionStorage = {
  // Read session
  getSession(): AuctionSession {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY)
      if (raw) {
        const session: AuctionSession = JSON.parse(raw)
        return this.syncSessionStatus(session)
      }
    } catch (e) {
      console.warn('Failed to parse auction session', e)
    }

    const initial = getInitialSession()
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(initial))
    return initial
  },

  // Save session & notify
  saveSession(session: AuctionSession, notify = true) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    if (notify && broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SESSION_UPDATED', session })
    }
  },

  // Read all items
  getItems(): AuctionItem[] {
    const session = this.getSession()
    try {
      const raw = localStorage.getItem(ITEMS_STORAGE_KEY)
      if (raw) {
        const items: AuctionItem[] = JSON.parse(raw)
        return this.syncItemsStatus(items, session.status)
      }
    } catch (e) {
      console.warn('Failed to parse auction items', e)
    }

    const initialItems = getInitialItems(session.id)
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(initialItems))
    return initialItems
  },

  // Save items & notify
  saveItems(items: AuctionItem[], notify = true) {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
    if (notify && broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ITEMS_UPDATED', items })
    }
  },

  // Auto-synchronize session status according to current clock
  syncSessionStatus(session: AuctionSession): AuctionSession {
    const now = Date.now()
    const start = new Date(session.startTime).getTime()
    const end = new Date(session.endTime).getTime()

    let newStatus: AuctionStatus = session.status
    if (now < start) {
      newStatus = 'upcoming'
    } else if (now >= start && now < end) {
      newStatus = 'live'
    } else {
      newStatus = 'closed'
    }

    if (newStatus !== session.status) {
      session.status = newStatus
      this.saveSession(session, true)
    }
    return session
  },

  // Sync items status based on session status
  syncItemsStatus(items: AuctionItem[], sessionStatus: AuctionStatus): AuctionItem[] {
    let changed = false
    const updated = items.map((item) => {
      let nextStatus: ItemStatus = item.status

      if (sessionStatus === 'upcoming') {
        if (item.status !== 'upcoming') {
          nextStatus = 'upcoming'
          changed = true
        }
      } else if (sessionStatus === 'live') {
        if (item.status === 'upcoming') {
          nextStatus = 'live'
          changed = true
        }
      } else if (sessionStatus === 'closed') {
        if (item.status === 'live' || item.status === 'upcoming') {
          nextStatus = item.highestBidderId ? 'sold' : 'unsold'
          changed = true
        }
      }

      return nextStatus === item.status ? item : { ...item, status: nextStatus }
    })

    if (changed) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(updated))
    }
    return updated
  },

  // Place a bid with strict validation and optional anti-sniping (+30s if <30s remaining)
  placeBid(params: {
    itemId: string
    buyerId: string
    buyerName: string
    amount: number
  }): {
    success: boolean
    error?: string
    antiSnipingTriggered?: boolean
    newBid?: ItemBid
    item?: AuctionItem
  } {
    const session = this.getSession()

    // 1. Session status validation
    if (session.status !== 'live') {
      const msg =
        session.status === 'upcoming'
          ? 'Bidding has not started yet. The auction session is upcoming.'
          : 'This auction session has ended. Bidding is now locked.'
      return { success: false, error: msg }
    }

    const now = Date.now()
    const endTime = new Date(session.endTime).getTime()
    if (now >= endTime) {
      session.status = 'closed'
      this.saveSession(session, true)
      return { success: false, error: 'Auction time elapsed! Bidding is closed.' }
    }

    // 2. Item validation
    const items = this.getItems()
    const itemIndex = items.findIndex((i) => i.id === params.itemId)
    if (itemIndex === -1) {
      return { success: false, error: 'Item not found in this auction lot.' }
    }

    const item = items[itemIndex]
    if (item.status !== 'live') {
      return {
        success: false,
        error: `This produce lot is currently ${item.status}. Bids can only be placed on active live lots.`,
      }
    }

    // 3. Minimum bid validation (at least starting price, and at least current highest + ₹10)
    const minRequired =
      item.bids.length === 0
        ? item.startingPrice
        : item.currentHighestBid + 10

    if (params.amount < minRequired) {
      return {
        success: false,
        error: `Bid must be at least ₹${minRequired.toLocaleString('en-IN')} (Minimum increment: ₹10 over current highest bid).`,
      }
    }

    // 4. Create new bid
    const newBid: ItemBid = {
      id: `bid-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      itemId: item.id,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      amount: Math.round(params.amount),
      createdAt: new Date().toISOString(),
      isWinning: true,
    }

    // Previous winning bids are no longer winning
    const updatedBids = item.bids.map((b) => ({ ...b, isWinning: false }))
    updatedBids.unshift(newBid) // Newest first

    const previousHighestBidderId = item.highestBidderId

    const updatedItem: AuctionItem = {
      ...item,
      currentHighestBid: newBid.amount,
      highestBidderId: newBid.buyerId,
      highestBidderName: newBid.buyerName,
      bids: updatedBids,
    }

    items[itemIndex] = updatedItem
    this.saveItems(items, true)

    // 5. Anti-sniping engine:
    // If a bid comes in during the last 30 seconds of the live session, extend timer by 30 seconds!
    let antiSnipingTriggered = false
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000))

    if (remainingSeconds <= 30 && remainingSeconds > 0) {
      const extendedEnd = new Date(endTime + 30 * 1000)
      session.endTime = extendedEnd.toISOString()
      session.antiSnipingTriggered = true
      session.antiSnipingCount = (session.antiSnipingCount || 0) + 1
      this.saveSession(session, true)
      antiSnipingTriggered = true
      soundEffects.playGavelStrike()
    } else {
      soundEffects.playBidChime()
    }

    // Broadcast the bid event to all tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'NEW_BID',
        itemId: item.id,
        itemName: item.name,
        bid: newBid,
        previousHighestBidderId,
        antiSnipingTriggered,
      })
    }

    return {
      success: true,
      antiSnipingTriggered,
      newBid,
      item: updatedItem,
    }
  },

  // Farmer creates a new item for auction
  createItem(
    itemData: Omit<
      AuctionItem,
      'id' | 'createdAt' | 'bids' | 'currentHighestBid' | 'highestBidderId' | 'highestBidderName' | 'status'
    >
  ): { success: boolean; item?: AuctionItem; error?: string } {
    const session = this.getSession()
    const items = this.getItems()

    const newItem: AuctionItem = {
      ...itemData,
      id: `lot-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      bids: [],
      currentHighestBid: itemData.startingPrice,
      highestBidderId: null,
      highestBidderName: null,
      status: session.status === 'upcoming' ? 'upcoming' : 'live',
    }

    items.unshift(newItem)
    this.saveItems(items, true)
    return { success: true, item: newItem }
  },

  // Farmer edits an item: STRICTLY ONLY ALLOWED BEFORE AUCTION IS LIVE
  updateItem(
    itemId: string,
    updates: Partial<Omit<AuctionItem, 'id' | 'farmerId' | 'bids' | 'currentHighestBid' | 'highestBidderId'>>
  ): { success: boolean; error?: string } {
    const items = this.getItems()
    const index = items.findIndex((i) => i.id === itemId)
    if (index === -1) return { success: false, error: 'Item not found' }

    const item = items[index]
    if (item.status !== 'upcoming') {
      return {
        success: false,
        error: 'Items can ONLY be edited before the auction session goes live. This lot is already active or closed.',
      }
    }

    items[index] = {
      ...item,
      ...updates,
      startingPrice: updates.startingPrice !== undefined ? updates.startingPrice : item.startingPrice,
      currentHighestBid: updates.startingPrice !== undefined ? updates.startingPrice : item.currentHighestBid,
    }

    this.saveItems(items, true)
    return { success: true }
  },

  // Farmer deletes an item: STRICTLY ONLY ALLOWED BEFORE AUCTION IS LIVE
  deleteItem(itemId: string): { success: boolean; error?: string } {
    const items = this.getItems()
    const index = items.findIndex((i) => i.id === itemId)
    if (index === -1) return { success: false, error: 'Item not found' }

    const item = items[index]
    if (item.status !== 'upcoming') {
      return {
        success: false,
        error: 'Items can ONLY be deleted before the auction session goes live.',
      }
    }

    items.splice(index, 1)
    this.saveItems(items, true)
    return { success: true }
  },

  // Quick schedule controls for testing and administration
  setSessionSchedule(startTimeIso: string, endTimeIso: string) {
    const session = this.getSession()
    session.startTime = startTimeIso
    session.endTime = endTimeIso
    session.antiSnipingTriggered = false
    session.antiSnipingCount = 0

    const updated = this.syncSessionStatus(session)
    this.saveSession(updated, true)

    // Re-sync items
    const items = this.getItems()
    this.syncItemsStatus(items, updated.status)
    return updated
  },

  // Preset: Start a quick 2-minute live demo session right now
  startDemoTwoMinuteLive() {
    const now = new Date()
    const start = new Date(now.getTime() - 1000) // 1 sec ago
    const end = new Date(now.getTime() + 120 * 1000) // 2 minutes from now
    return this.setSessionSchedule(start.toISOString(), end.toISOString())
  },

  // Preset: Start 15-minute live morning session
  startLiveSessionNow(durationMinutes = 15) {
    const now = new Date()
    const start = new Date(now.getTime() - 1000)
    const end = new Date(now.getTime() + durationMinutes * 60 * 1000)
    return this.setSessionSchedule(start.toISOString(), end.toISOString())
  },

  // Preset: Set upcoming session starting in 5 minutes
  setUpcomingSession(minutesUntilStart = 5, durationMinutes = 30) {
    const now = new Date()
    const start = new Date(now.getTime() + minutesUntilStart * 60 * 1000)
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
    return this.setSessionSchedule(start.toISOString(), end.toISOString())
  },

  // Preset: Immediately close the session
  closeSessionNow() {
    const now = new Date()
    const start = new Date(now.getTime() - 60 * 60 * 1000)
    const end = new Date(now.getTime() - 1000)
    const updated = this.setSessionSchedule(start.toISOString(), end.toISOString())
    soundEffects.playGavelStrike()
    return updated
  },

  // Reset to initial demo lots & state
  resetAll() {
    const session = getInitialSession()
    const items = getInitialItems(session.id)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ALL_RESET' })
    }
    return { session, items }
  },

  // Subscription helper for components
  subscribe(callback: (event: { type: string; payload?: unknown }) => void): () => void {
    const storageHandler = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY || e.key === ITEMS_STORAGE_KEY) {
        callback({ type: 'STORAGE_CHANGE', payload: e.key })
      }
    }

    let channelHandler: ((e: MessageEvent) => void) | null = null
    if (broadcastChannel) {
      channelHandler = (e: MessageEvent) => {
        callback(e.data)
      }
      broadcastChannel.addEventListener('message', channelHandler)
    }

    window.addEventListener('storage', storageHandler)

    return () => {
      window.removeEventListener('storage', storageHandler)
      if (broadcastChannel && channelHandler) {
        broadcastChannel.removeEventListener('message', channelHandler)
      }
    }
  },
}
