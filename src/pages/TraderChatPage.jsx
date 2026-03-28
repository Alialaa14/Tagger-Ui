import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackNavigator from '../components/common/BackNavigator'
import './orders.css'

export default function TraderChatPage() {
  return (
    <div className="home-page" dir="rtl">
      <Navbar />
      <main className="orders-page-wrap container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <BackNavigator fallback="/profile" className="is-floating" style={{ right: 8, top: 8 }} />
        <div className="orders-empty">
          <span className="orders-empty-icon">💬</span>
          <h2>المحادثات المباشرة</h2>
          <p>قريباً... ستتمكن من التواصل مع عملائك مباشرة.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
