import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ConsumerLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
