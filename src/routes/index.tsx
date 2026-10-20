import { Routes, Route } from 'react-router-dom'
import DashboardShell from '@/components/layout/DashboardShell'
import { ProtectedRoute, PublicOnlyRoute } from '@/routes/ProtectedRoute'
import Hub from '@/pages/Hub'
import LoginPage from '@/pages/auth/LoginPage'
import FarmerDashboard from '@/pages/farmer/FarmerDashboard'
import ProduceListing from '@/pages/farmer/ProduceListing'
import Marketplace from '@/pages/buyer/Marketplace'
import StoreInventory from '@/pages/store/StoreInventory'
import AuctionList from '@/pages/auction/AuctionList'
import AdminDashboard from '@/pages/admin/AdminDashboard'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Only for logged-out visitors */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage initialMode="login" />} />
        <Route path="/register" element={<LoginPage initialMode="register" />} />
      </Route>

      {/* Farmer only */}
      <Route element={<ProtectedRoute allow={['farmer']} />}>
        <Route element={<DashboardShell />}>
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/farmer/listings" element={<ProduceListing />} />
        </Route>
      </Route>

      {/* User (buyer) only */}
      <Route element={<ProtectedRoute allow={['user']} />}>
        <Route element={<DashboardShell />}>
          <Route path="/buyer" element={<Marketplace />} />
          <Route path="/user" element={<Marketplace />} />
        </Route>
      </Route>

      {/* Any logged-in account (change later if needed) */}
      <Route element={<ProtectedRoute allow={['farmer', 'user']} />}>
        <Route element={<DashboardShell />}>
          <Route path="/store" element={<StoreInventory />} />
          <Route path="/auction" element={<AuctionList />} />
        </Route>
      </Route>
    </Routes>
  )
}