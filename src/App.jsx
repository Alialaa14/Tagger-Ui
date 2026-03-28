import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
import NotificationsPage from './pages/admin/NotificationsPage'
import PageSettings from './pages/admin/PageSettings'
import Home from './pages/Home'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import CartPage from './pages/CartPage'
import { RequireAdmin, RequireAuth } from './components/RouteGuards'
import CheckoutPage from "./pages/CheckoutPage"
import CustomerOrdersPage from "./pages/CustomerOrdersPage"
import TraderOrdersPage from "./pages/TraderOrdersPage"
import TraderNotificationsPage from "./pages/TraderNotificationsPage"
import TraderChatPage from "./pages/TraderChatPage"
import AdminOrdersPage from "./pages/AdminOrdersPage"
export default function App() {
  return (
    <div className="app-shell">
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/categories/:id" element={<CategoryPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders"    element={<CustomerOrdersPage />} />
            <Route path="/trader/orders" element={<TraderOrdersPage />} />
            <Route path="/trader/notifications" element={<TraderNotificationsPage />} />
            <Route path="/trader/chat" element={<TraderChatPage />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="products" element={<ProductManager />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="users-online" element={<UsersOnline />} />
              <Route path="pages" element={<PageSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
