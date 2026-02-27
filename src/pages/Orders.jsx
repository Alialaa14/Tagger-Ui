import React from 'react'
import './Orders.css'

// Sample orders — replace with real data or fetch from API/socket
const sampleOrders = [
  { id: 'ORD-1001', qty: 5 },
  { id: 'ORD-1002', qty: 12 },
  { id: 'ORD-1003', qty: 2 },
  { id: 'ORD-1004', qty: 20 },
]

export default function Orders(){
  const handleAction = (orderId, action) => {
    console.log('Action', action, 'on', orderId)
    // TODO: send action to server via socket or API
  }

  return (
    <div className="orders-page">
      <header className="orders-header">
        <h1>قائمة الطلبات</h1>
        <p className="subtitle">اعرض الطلبات الواردة وتأكد من توفرها أو رفضها</p>
      </header>

      <div className="orders-list">
        {sampleOrders.map(o => (
          <div key={o.id} className="order-card">
            <div className="order-meta">
              <div className="order-id">رقم الطلب: <strong>{o.id}</strong></div>
              <div className="order-qty">عدد الأصناف: <strong>{o.qty}</strong></div>
            </div>

            <div className="order-actions">
              <button className="btn accept" onClick={() => handleAction(o.id, 'accept')}>اقبل</button>
              <button className="btn reject" onClick={() => handleAction(o.id, 'reject')}>ارفض</button>
              <button className="btn unavailable" onClick={() => handleAction(o.id, 'unavailable')}>مش متوفر الكل</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
