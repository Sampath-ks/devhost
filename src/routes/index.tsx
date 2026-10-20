// index.tsx
import { Routes, Route } from 'react-router-dom'
import DashboardShell from '@/components/layout/DashboardShell'
import Hub from '@/pages/Hub'
import LoginPage from '@/pages/auth/LoginPage'
import FarmerDashboard from '@/pages/farmer/FarmerDashboard'
import MyProduce from '@/pages/farmer/MyProduce'
import ProduceListing from '@/pages/farmer/ProduceListing'
import MarketPrices from '@/pages/farmer/MarketPrices'
import Marketplace from '@/pages/buyer/Marketplace'
import StoreInventory from '@/pages/store/StoreInventory'
import AuctionList from '@/pages/auction/AuctionList'
import Lab from '@/pages/Lab'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/login" element={<LoginPage initialMode="login" />} />
      <Route path="/register" element={<LoginPage initialMode="register" />} />
      <Route path="/lab" element={<Lab />} />
      <Route element={<DashboardShell />}>
        {/* Farmer Portal Routes */}
        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/farmer/produce" element={<MyProduce />} />
        <Route path="/farmer/add" element={<ProduceListing />} />
        <Route path="/farmer/prices" element={<MarketPrices />} />

        {/* Other Portals */}
        <Route path="/buyer" element={<Marketplace />} />
        <Route path="/user" element={<Marketplace />} />
        <Route path="/store" element={<StoreInventory />} />
        <Route path="/auction" element={<AuctionList />} />
      </Route>
    </Routes>
  )
}
