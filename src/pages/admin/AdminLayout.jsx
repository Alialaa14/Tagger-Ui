import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import Navbar from '../../components/Navbar'
import { useUI } from '../../context/UIContext'

export default function AdminLayout() {
  const { adminSidebarOpen, setAdminSidebarOpen } = useUI()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true'
  })

  // Toggle global body classes for layout overrides
  useEffect(() => {
    document.body.classList.add('admin-mode')
    return () => {
      document.body.classList.remove('admin-mode')
      document.body.classList.remove('admin-sidebar-collapsed')
    }
  }, [])

  // Sync collapsed state with body class
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('admin-sidebar-collapsed')
    } else {
      document.body.classList.remove('admin-sidebar-collapsed')
    }
    localStorage.setItem('admin_sidebar_collapsed', isCollapsed)
  }, [isCollapsed])

  return (
    <>
      <Navbar />
      <div className={`admin-shell ${isCollapsed ? 'is-collapsed' : ''}`} style={{ marginTop: '0' }}>
        <AdminSidebar 
          open={adminSidebarOpen} 
          onClose={() => setAdminSidebarOpen(false)} 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="admin-content">
          <div className="admin-content-body">
            <Outlet context={{ setSidebarOpen: setAdminSidebarOpen }} />
          </div>
        </main>
      </div>
    </>
  )
}
