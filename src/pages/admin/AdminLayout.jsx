import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminHeader from '../../components/admin/AdminHeader'

export default function AdminLayout() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="admin-shell">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />

      <main className="admin-content">
        <AdminHeader onMenuClick={() => setOpen(true)} />
        <div className="admin-content-body">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
