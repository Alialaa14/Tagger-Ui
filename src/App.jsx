import React from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ResetPassword from './pages/ResetPassword'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProductManager from './pages/admin/ProductManager'
import CategoryManager from './pages/admin/CategoryManager'
import UsersOnline from './pages/admin/UsersOnline'
import AdminNotificationPage from './pages/admin/NotificationsPage'
import PageSettings from './pages/admin/PageSettings'
import TraderProductManager from './pages/admin/TraderProductManager'
import AdminUserManager from './pages/admin/AdminUserManager'
import AdminStatsPage from './pages/admin/AdminStatsPage'
import CompanyManager from './pages/admin/CompanyManager'
import InventoryPage from './pages/InventoryPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import Home from './pages/Home'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'
import SearchResults from './pages/SearchResults'
import ProductsPage from './pages/ProductsPage'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import CartPage from './pages/CartPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { RequireAdmin, RequireAuth } from './components/RouteGuards'
import CheckoutPage from "./pages/CheckoutPage"
import CustomerOrdersPage from "./pages/CustomerOrdersPage"
import TraderOrdersPage from "./pages/TraderOrdersPage"
import CatalogPage from "./pages/CatalogPage"
import TraderChatPage from "./pages/TraderChatPage"
import AdminOrdersPage from "./pages/AdminOrdersPage"
import NotificationsPage from './pages/NotificationsPage'
import NotificationDetail from './pages/NotificationDetail'
import MyReviewsPage from './pages/MyReviewsPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'
import ScanPage from "./pages/ScanPage"
import ConsumerLayout from './layouts/ConsumerLayout'
import UserStatsPage from './pages/UserStatsPage'

function CategoryRedirect() {
  const { id } = useParams()
  return <Navigate to={`/products?category=${id}`} replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Consumer Routes ─────────────────────────────────────────── */}
      <Route element={<ConsumerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/categories/:id" element={<CategoryRedirect />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<CustomerOrdersPage />} />
          <Route path="/trader/orders" element={<TraderOrdersPage />} />
          <Route path="/trader/catalog" element={<Navigate to="/catalog" replace />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/trader/chat" element={<TraderChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/notifications/:id" element={<NotificationDetail />} />
          <Route path="/my-reviews" element={<MyReviewsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/scan/:userId/:productId" element={<ScanPage />} />
          <Route path="/stats" element={<UserStatsPage />} />
          <Route path="/trader/stats" element={<UserStatsPage />} />
        </Route>
      </Route>

      {/* ── Auth Routes (Standalone) ────────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Admin Routes ────────────────────────────────────────────── */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="stats" element={<AdminStatsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="trader-products" element={<TraderProductManager />} />
          <Route path="notifications" element={<AdminNotificationPage />} />
          <Route path="users-online" element={<UsersOnline />} />
          <Route path="admins" element={<AdminUserManager />} />
          <Route path="pages" element={<PageSettings />} />
          <Route path="companies" element={<CompanyManager />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
