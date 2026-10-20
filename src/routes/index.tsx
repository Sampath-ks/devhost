// index.tsx
import { Routes, Route } from 'react-router-dom'
import DashboardShell from '@/components/layout/DashboardShell'
import Hub from '@/pages/Hub'
import FarmerDashboard from '@/pages/farmer/FarmerDashboard'
import Marketplace from '@/pages/buyer/Marketplace'
import StoreInventory from '@/pages/store/StoreInventory'
import AuctionList from '@/pages/auction/AuctionList'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route element={<DashboardShell />}>
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/buyer" element={<Marketplace />} />
        <Route path="/store" element={<StoreInventory />} />
        <Route path="/auction" element={<AuctionList />} />
      </Route>
    </Routes>
  )
}
