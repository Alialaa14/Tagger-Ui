import React, { createContext, useContext, useState } from 'react'

const UIContext = createContext()

export function UIProvider({ children }) {
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(false)

  const toggleAdminSidebar = () => setAdminSidebarOpen(v => !v)
  const closeAdminSidebar = () => setAdminSidebarOpen(false)

  return (
    <UIContext.Provider value={{ 
      adminSidebarOpen, 
      setAdminSidebarOpen, 
      toggleAdminSidebar, 
      closeAdminSidebar 
    }}>
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => useContext(UIContext)
