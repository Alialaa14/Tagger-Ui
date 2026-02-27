import React, { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminLayout(){
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  return (
    <div className={`admin-layout ${open ? 'is-open' : ''}`}>
      <aside className="admin-aside">
        <div className="admin-aside__top">
          <div className="title">لوحة الإدارة</div>
          <button className="admin-close" onClick={() => setOpen(false)} aria-label="إغلاق القائمة">×</button>
        </div>
        <nav>
          <Link to="/admin/categories" onClick={() => setOpen(false)}>إدارة الأقسام</Link>
          <Link to="/admin/products" onClick={() => setOpen(false)}>إدارة المنتجات</Link>
          <Link to="/admin/users-online" onClick={() => setOpen(false)}>المتاجر المتصلة</Link>
        </nav>
        <div className="admin-aside__footer">
          <button
            className="btn btn-ghost"
            onClick={async () => {
              try {
                await axios.post('http://localhost:3000/api/v1/auth/logout', {}, { withCredentials: true })
                navigate('/login')
              } catch (err) {
                console.error('logout failed', err)
              }
            }}
          >تسجيل خروج</button>
        </div>
      </aside>

      <section className="admin-main">
        <div className="admin-topbar">
          <button className="admin-toggle" onClick={() => setOpen(true)} aria-label="فتح القائمة">☰</button>
          <div>
            <h2>لوحة التحكم</h2>
            <p>إدارة المحتوى والمتاجر المتصلة بسهولة</p>
          </div>
        </div>
        <Outlet />
      </section>
    </div>
  )
}
