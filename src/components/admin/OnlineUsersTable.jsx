import React from 'react'

function getUserId(user) {
  return String(user?._id ?? user?.id ?? '')
}

export default function OnlineUsersTable({ users, isLoading, emptyMessage }) {
  return (
    <>
      <div className="users-admin-edit">
        <h3>المستخدمون المتصلون ({users?.length || 0})</h3>
      </div>

      {isLoading ? (
        <div className="users-online-empty">
          <p>جار تحميل المستخدمين...</p>
        </div>
      ) : !users?.length ? (
        <div className="users-online-empty">
          <div className="users-online-empty-icon">●</div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="users-admin-table-wrap">
          <table className="users-admin-table">
            <thead>
              <tr>
                <th>اسم المستخدم</th>
                <th>اسم المتجر</th>
                <th>رقم الهاتف</th>
                <th>الدور</th>
                <th>المدينة</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={getUserId(user)}>
                  <td>{user.username || '-'}</td>
                  <td>{user.shopName || '-'}</td>
                  <td>{user.phoneNumber || '-'}</td>
                  <td>{user.role || '-'}</td>
                  <td>{user.city || '-'}</td>
                  <td>
                    <span className={`users-admin-online-badge ${user.isOnline ? 'is-online' : 'is-offline'}`}>
                      {user.isOnline ? 'متصل' : 'غير متصل'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
