import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import NotificationsPanel from '../components/notifications/NotificationsPanel'
import BackNavigator from '../components/common/BackNavigator'
import './orders.css'

export default function TraderNotificationsPage() {
  return (
    <div className="home-page" dir="rtl">
      <Navbar />
      <main className="orders-page-wrap container" style={{ minHeight: '60vh' }}>
        <BackNavigator fallback="/profile" />
        <div className="orders-page-head">
          <div>
            <p className="orders-kicker">Trader Dashboard</p>
            <h1>إشعارات التاجر</h1>
            <p>تابع آخر التحديثات والطلبات الجديدة</p>
          </div>
        </div>
        
        <NotificationsPanel />

      </main>
      <Footer />
    </div>
  )
}
