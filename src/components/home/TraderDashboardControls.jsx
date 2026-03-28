import React from 'react'
import { useNavigate } from 'react-router-dom'
import './TraderDashboardControls.css'

export default function TraderDashboardControls() {
  const navigate = useNavigate()

  return (
    <section className="trader-controls-section container" dir="rtl">
      <header className="trader-controls-header">
        <div className="trader-controls-title-group">
          <h3>لوحة تحكم التاجر</h3>
          <p>وصول سريع لمهامك اليومية</p>
        </div>
      </header>

      <div className="trader-controls-grid">
        <button className="trader-control-card" onClick={() => navigate('/trader/orders')}>
          <div className="tcc-icon is-blue">📦</div>
          <div className="tcc-content">
            <h4>الطلبات الواردة</h4>
            <p>إدارة طلبات العملاء الجديدة</p>
          </div>
        </button>

        <button className="trader-control-card" onClick={() => navigate('/trader/orders?filter=delivered')}>
          <div className="tcc-icon is-green">✅</div>
          <div className="tcc-content">
            <h4>الطلبات المكتملة</h4>
            <p>سجل الطلبات المسلمة</p>
          </div>
        </button>

        <button className="trader-control-card" onClick={() => navigate('/trader/notifications')}>
          <div className="tcc-icon is-amber">🔔</div>
          <div className="tcc-content">
            <h4>الإشعارات</h4>
            <p>عرض التنبيهات والأحداث</p>
          </div>
        </button>

        <button className="trader-control-card" onClick={() => navigate('/trader/chat')}>
          <div className="tcc-icon is-purple">💬</div>
          <div className="tcc-content">
            <h4>المحادثات المباشرة</h4>
            <p>تواصل مع عملائك فوراً</p>
          </div>
        </button>
      </div>
    </section>
  )
}
