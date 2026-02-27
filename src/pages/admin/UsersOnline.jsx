import React, { useState, useEffect } from 'react'
import axios from 'axios'


export default function UsersOnline() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchOnlineUser = async () => {
      try {
        const result = await axios.get("http://localhost:3000/api/v1/auth/users-online", { withCredentials: true })
        const payload = result.data.data
        if (Array.isArray(payload)) {
          setUsers(payload)
        } else if (payload && Array.isArray(payload.users)) {
          setUsers(payload.users)
        } else {
          console.warn('unexpected users-online response', payload)
          setUsers([])
        }
      } catch (error) {
        console.log(error.message)
        setUsers([])
      }
    }
    fetchOnlineUser()
  }, [])
  

  return (
    <div style={{ margin: 0, width: '100%', padding: 0 }}>
      <div className="card admin-card">
        <div className="header">
          <div className="h-title">المتاجر المتصلة</div>
          <div className="h-sub">عرض حالة الاتصال وأهم بيانات المتاجر الآن</div>
        </div>

        {users.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>لا يوجد متاجر متصلة حاليا</p>
          </div>
        ) : (
          <div className="users-grid">
            {Array.isArray(users) && users.map((u, idx) => (
              <div key={idx} className={`user-card ${u.isOnline ? 'is-online' : 'is-offline'}`}>
                <div className="user-card__top">
                  <div>
                    <h4>{u.shopName || 'متجر بدون اسم'}</h4>
                    <p>{u.city || '-'} • {u.governorate || '-'}</p>
                  </div>
                  <span className="user-status">{u.isOnline ? 'متصل' : 'غير متصل'}</span>
                </div>
                <div className="user-meta">
                  <div>
                    <span>الهاتف</span>
                    <strong>{u.phoneNumber || '-'}</strong>
                  </div>
                  <div>
                    <span>العنوان</span>
                    <strong>{u.address || '-'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
