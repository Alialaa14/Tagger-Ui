import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ResetPassword from './pages/ResetPassword'
import Orders from './pages/Orders'
import AdminLayout from './pages/admin/AdminLayout'
import Categories from './pages/admin/Categories'
import Products from './pages/admin/Products'
import UsersOnline from './pages/admin/UsersOnline'
import Coupons from './pages/admin/Coupons'
import Home from './pages/Home'
import Category from './pages/Category'
import CategoryPage from './pages/CategoryPage'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import CartPage from './pages/CartPage'
import { RequireAdmin, RequireAuth } from './components/RouteGuards'

export default function App(){
  return (
    <div className="app-shell">
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/categories/:id" element={<CategoryPage />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Categories />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<Products />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="users-online" element={<UsersOnline />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
