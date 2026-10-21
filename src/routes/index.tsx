import { Routes, Route } from 'react-router-dom'
import DashboardShell from '@/components/layout/DashboardShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute'
import Hub from '@/pages/Hub'
import LoginPage from '@/pages/auth/LoginPage'
import FarmerDashboard from '@/pages/farmer/FarmerDashboard'
import MyProduce from '@/pages/farmer/MyProduce'
import ProduceListing from '@/pages/farmer/ProduceListing'
import MarketPrices from '@/pages/farmer/MarketPrices'
import Marketplace from '@/pages/buyer/Marketplace'
import StoreInventory from '@/pages/store/StoreInventory'
import AuctionPage from '@/pages/auction/AuctionPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import Lab from '@/pages/Lab'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/lab" element={<Lab />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Auth routes */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage initialMode="login" />} />
        <Route path="/register" element={<LoginPage initialMode="register" />} />
      </Route>

      {/* Farmer only */}
      <Route element={<ProtectedRoute allow={['farmer']} />}>
        <Route element={<DashboardShell />}>
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/farmer/produce" element={<MyProduce />} />
          <Route path="/farmer/listings" element={<ProduceListing />} />
          <Route path="/farmer/add" element={<ProduceListing />} />
          <Route path="/farmer/prices" element={<MarketPrices />} />
        </Route>
      </Route>

      {/* User (buyer) only */}
      <Route element={<ProtectedRoute allow={['user']} />}>
        <Route element={<DashboardShell />}>
          <Route path="/buyer" element={<Marketplace />} />
          <Route path="/user" element={<Marketplace />} />
        </Route>
      </Route>

      {/* Portals open to logged-in accounts */}
      <Route element={<ProtectedRoute allow={['farmer', 'user']} />}>
        <Route element={<DashboardShell />}>
          <Route path="/store" element={<StoreInventory />} />
        </Route>
      </Route>

      {/* Direct open access without login (same behavior as /admin) */}
      <Route element={<DashboardShell />}>
        <Route path="/auction" element={<AuctionPage />} />
      </Route>
    </Routes>
  )
}