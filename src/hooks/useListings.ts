import { useEffect, useSyncExternalStore } from 'react'
import type {
  ProduceListing,
  ListingInput,
  ListingStatus,
  SupplyRecord,
  SaleRecord,
} from '../lib/produceTypes'
import { validateListing, hasErrors, type ListingErrors } from '../lib/validateListing'
import { seedListings, seedSupply, seedSales } from '../data/produceSeed'
import { getFarmerId } from '../lib/session'

const KEY = 'produce_store_v2'

interface State {
  listings: ProduceListing[]
  supply: SupplyRecord[]
  sales: SaleRecord[]
  seeded: string[] // farmer IDs that already received the demo data
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>
      if (parsed.listings && parsed.listings.length > 0) {
        // Ensure any seed listings (like Mango) not yet in storage are merged in seamlessly
        const existingIds = new Set(parsed.listings.map((l) => l.id))
        const existingCrops = new Set(parsed.listings.map((l) => l.cropName.toLowerCase().trim()))
        const missingSeeds = seedListings.filter(
          (s) => !existingIds.has(s.id) && !existingCrops.has(s.cropName.toLowerCase().trim())
        )
        return {
          listings: [...parsed.listings, ...missingSeeds],
          supply: parsed.supply ?? [],
          sales: parsed.sales ?? [],
          seeded: parsed.seeded ?? [],
        }
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return {
    listings: seedListings,
    supply: seedSupply,
    sales: seedSales,
    seeded: ['seed'],
  }
}

let state: State = load()
const subscribers = new Set<() => void>()

async function fetchServerDb() {
  try {
    const res = await fetch('/api/db')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.listings) && data.listings.length > 0) {
        const existingIds = new Set(data.listings.map((l: any) => l.id))
        const localOnly = state.listings.filter((l) => !existingIds.has(l.id))
        const mergedListings = [...data.listings, ...localOnly]

        const isDifferent =
          mergedListings.length !== state.listings.length ||
          JSON.stringify(mergedListings.map((l: any) => l.id)) !==
            JSON.stringify(state.listings.map((l) => l.id))

        if (isDifferent) {
          state = { ...state, listings: mergedListings }
          try {
            localStorage.setItem(KEY, JSON.stringify(state))
          } catch {}
          subscribers.forEach((fn) => fn())
        }

        if (localOnly.length > 0) {
          pushServerDb({ listings: mergedListings })
        }
      }
    }
  } catch {}
}

async function pushServerDb(payload: { listings?: ProduceListing[] }) {
  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {}
}

function syncFromStorage() {
  const latest = load()
  const isDifferent =
    latest.listings.length !== state.listings.length ||
    JSON.stringify(latest.listings.map((l) => l.id)) !== JSON.stringify(state.listings.map((l) => l.id))

  if (isDifferent) {
    state = latest
    subscribers.forEach((fn) => fn())
  }
}

if (typeof window !== 'undefined') {
  fetchServerDb()
  setInterval(fetchServerDb, 2500)
  window.addEventListener('focus', fetchServerDb)

  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load()
      subscribers.forEach((fn) => fn())
    }
  })
}

function setState(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full or unavailable */
  }
  pushServerDb({ listings: state.listings })
  subscribers.forEach((fn) => fn())
}

const subscribe = (fn: () => void) => {
  subscribers.add(fn)
  return () => {
    subscribers.delete(fn)
  }
}
const getSnapshot = () => state

// Give every farmer their own copy of the demo data, once
function seedFarmer(farmerId: string) {
  if (!farmerId || state.seeded.includes(farmerId)) return
  const p = (id: string) => `${farmerId}:${id}`
  setState({
    listings: [
      ...seedListings.map((l) => ({ ...l, id: p(l.id), farmerId })),
      ...state.listings,
    ],
    supply: [
      ...seedSupply.map((r) => ({ ...r, id: p(r.id), listingId: p(r.listingId), farmerId })),
      ...state.supply,
    ],
    sales: [
      ...seedSales.map((r) => ({ ...r, id: p(r.id), listingId: p(r.listingId), farmerId })),
      ...state.sales,
    ],
    seeded: [...state.seeded, farmerId],
  })
}

export type SaveResult =
  | { ok: true; listing: ProduceListing }
  | { ok: false; errors: ListingErrors }

export function useListings(farmerId: string = getFarmerId()) {
  const s = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    syncFromStorage()
    seedFarmer(farmerId)
  }, [farmerId])

  const listings = s.listings.filter((l) => l.farmerId === farmerId)
  const supply = s.supply.filter((r) => r.farmerId === farmerId)
  const sales = s.sales.filter((r) => r.farmerId === farmerId)

  function createListing(input: ListingInput): SaveResult {
    const errors = validateListing(input)
    if (hasErrors(errors)) return { ok: false, errors }

    const effectiveFarmerId = farmerId || getFarmerId() || 'hiragkulal877@gmail.com'
    const now = new Date().toISOString()
    const listing: ProduceListing = {
      ...input,
      farmerId: effectiveFarmerId,
      id: `L${Date.now()}`,
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    }

    const currentLatest = load()
    setState({
      ...currentLatest,
      listings: [listing, ...currentLatest.listings],
    })
    return { ok: true, listing }
  }

  function updateListing(id: string, input: ListingInput): SaveResult {
    const errors = validateListing(input)
    if (hasErrors(errors)) return { ok: false, errors }

    const existing = state.listings.find((l) => l.id === id && l.farmerId === farmerId)
    if (!existing) return { ok: false, errors: { cropName: 'Listing not found' } }

    const listing: ProduceListing = {
      ...existing,
      ...input,
      farmerId,
      updatedAt: new Date().toISOString(),
    }
    setState({
      ...state,
      listings: state.listings.map((l) => (l.id === id ? listing : l)),
    })
    return { ok: true, listing }
  }

  function setStatus(id: string, status: ListingStatus) {
    setState({
      ...state,
      listings: state.listings.map((l) =>
        l.id === id && l.farmerId === farmerId
          ? { ...l, status, updatedAt: new Date().toISOString() }
          : l
      ),
    })
  }

  return { listings, supply, sales, createListing, updateListing, setStatus }
}

export interface OrderResult {
  ok: boolean
  error?: string
  sale?: SaleRecord
  orderId?: string
}

export function useAllListings() {
  const s = useSyncExternalStore(subscribe, getSnapshot)

  useEffect(() => {
    syncFromStorage()
    if (state.listings.length === 0) {
      setState({
        listings: seedListings,
        supply: seedSupply,
        sales: seedSales,
        seeded: ['seed'],
      })
    }
  }, [])

  function placeOrder(listingId: string, quantityKg: number): OrderResult {
    const listing = state.listings.find((l) => l.id === listingId)
    if (!listing) return { ok: false, error: 'Listing not found' }
    if (quantityKg <= 0 || quantityKg > listing.quantityKg) {
      return { ok: false, error: `Quantity must be between 1 and ${listing.quantityKg} kg` }
    }

    const remainingKg = listing.quantityKg - quantityKg
    const updatedStatus: ListingStatus = remainingKg === 0 ? 'Sold Out' : listing.status

    const updatedListing: ProduceListing = {
      ...listing,
      quantityKg: remainingKg,
      status: updatedStatus,
      updatedAt: new Date().toISOString(),
    }

    const sale: SaleRecord = {
      id: `SL${Date.now()}`,
      listingId: listing.id,
      farmerId: listing.farmerId,
      date: new Date().toISOString().split('T')[0],
      orderId: `ORD-${Date.now().toString().slice(-4)}`,
      quantityKg,
      pricePerKg: listing.askingPrice,
    }

    setState({
      ...state,
      listings: state.listings.map((l) => (l.id === listingId ? updatedListing : l)),
      sales: [sale, ...state.sales],
    })

    return { ok: true, sale, orderId: sale.orderId }
  }

  return {
    allListings: s.listings,
    placeOrder,
  }
}