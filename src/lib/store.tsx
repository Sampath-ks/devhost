// store.tsx
import React, { createContext, useContext, useReducer, useMemo } from 'react'
import type { CropListing, Order, InventoryItem, Farmer, Crop } from '@/types'
import { FARMERS } from '@/data/farmers'
import { ORDERS } from '@/data/orders'
import { INVENTORY_ITEMS } from '@/data/inventory'
import { CROPS } from '@/data/crops'

// Flatten initial listings with default Available status and farmer district
const INITIAL_LISTINGS: CropListing[] = FARMERS.flatMap((farmer) =>
  farmer.listings.map((listing) => ({
    ...listing,
    status: listing.status || 'Available',
    district: listing.district || farmer.district,
  }))
)

interface AppState {
  listings: CropListing[]
  orders: Order[]
  inventory: InventoryItem[]
  currentFarmerId: string
}

type AppAction =
  | { type: 'ADD_LISTING'; payload: CropListing }
  | { type: 'UPDATE_LISTING'; payload: { id: string; updates: Partial<CropListing> } }
  | { type: 'REMOVE_LISTING'; payload: { id: string } }

function storeReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_LISTING':
      return {
        ...state,
        listings: [action.payload, ...state.listings],
      }
    case 'UPDATE_LISTING':
      return {
        ...state,
        listings: state.listings.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload.updates } : item
        ),
      }
    case 'REMOVE_LISTING':
      return {
        ...state,
        listings: state.listings.filter((item) => item.id !== action.payload.id),
      }
    default:
      return state
  }
}

interface AppStoreContextType {
  listings: CropListing[]
  orders: Order[]
  inventory: InventoryItem[]
  crops: Crop[]
  farmers: Farmer[]
  currentFarmer: Farmer
  currentFarmerListings: CropListing[]
  addListing: (newListing: Omit<CropListing, 'id' | 'farmerId'> & { id?: string; farmerId?: string }) => CropListing
  updateListing: (id: string, updates: Partial<CropListing>) => void
  removeListing: (id: string) => void
}

const AppStoreContext = createContext<AppStoreContextType | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, {
    listings: INITIAL_LISTINGS,
    orders: ORDERS,
    inventory: INVENTORY_ITEMS,
    currentFarmerId: 'farmer-1',
  })

  const currentFarmer = useMemo(() => {
    return FARMERS.find((f) => f.id === state.currentFarmerId) || FARMERS[0]
  }, [state.currentFarmerId])

  const currentFarmerListings = useMemo(() => {
    return state.listings.filter((l) => l.farmerId === state.currentFarmerId)
  }, [state.listings, state.currentFarmerId])

  const addListing = (
    newListing: Omit<CropListing, 'id' | 'farmerId'> & { id?: string; farmerId?: string }
  ): CropListing => {
    const listingId = newListing.id || `list-${Date.now().toString(36)}`
    const created: CropListing = {
      id: listingId,
      farmerId: newListing.farmerId || state.currentFarmerId,
      cropId: newListing.cropId,
      quantity: Number(newListing.quantity),
      pricePerUnit: Number(newListing.pricePerUnit),
      qualityGrade: newListing.qualityGrade,
      harvestDate: newListing.harvestDate,
      isOrganic: Boolean(newListing.isOrganic),
      status: newListing.status || 'Available',
      district: newListing.district || currentFarmer.district,
    }

    dispatch({ type: 'ADD_LISTING', payload: created })
    return created
  }

  const updateListing = (id: string, updates: Partial<CropListing>) => {
    dispatch({ type: 'UPDATE_LISTING', payload: { id, updates } })
  }

  const removeListing = (id: string) => {
    dispatch({ type: 'REMOVE_LISTING', payload: { id } })
  }

  const value = {
    listings: state.listings,
    orders: state.orders,
    inventory: state.inventory,
    crops: CROPS,
    farmers: FARMERS,
    currentFarmer,
    currentFarmerListings,
    addListing,
    updateListing,
    removeListing,
  }

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider')
  }
  return context
}

export default AppStoreProvider
