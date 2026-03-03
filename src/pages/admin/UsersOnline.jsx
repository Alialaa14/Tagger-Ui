import React, { useEffect, useMemo, useState } from 'react'
import OnlineUsersTable from '../../components/admin/OnlineUsersTable'
import toast from '../../utils/toast'
import { deleteUserById, fetchUserById, fetchUsers, updateUserById } from '../../utils/adminUsersApi'
import socket from '../../socket'

const initialForm = {
  username: '',
  shopName: '',
  phoneNumber: '',
  city: '',
  governorate: '',
  address: '',
  role: 'user',
  rank: 0,
  totalSales: 0,
  totalOrdersAccepted: 0,
  totalOrdersRejected: 0,
}

function mapUserToForm(user) {
  return {
    username: user?.username || '',
    shopName: user?.shopName || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    governorate: user?.governorate || '',
    address: user?.address || '',
    role: user?.role || 'user',
    rank: Number(user?.rank || 0),
    totalSales: Number(user?.totalSales || 0),
    totalOrdersAccepted: Number(user?.totalOrdersAccepted || 0),
    totalOrdersRejected: Number(user?.totalOrdersRejected || 0),
  }
}

const getUserId = (user) => String(user?._id ?? user?.id ?? '')

function UsersTable({
  title,
  users,
  isLoading,
  isFinding,
  isDeleting,
  emptyMessage,
  onLoadDetails,
  onStartEdit,
  onDelete,
}) {
  return (
    <>
      <div className="users-admin-edit">
        <h3>
          {title} ({users?.length || 0})
        </h3>
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
                <th>الإجراءات</th>
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
                  <td>
                    <div className="users-admin-row-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => onLoadDetails(getUserId(user))}
                        disabled={isFinding}
                      >
                        تفاصيل أكثر
                      </button>
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onStartEdit(user)}>
                        تعديل
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => onDelete(getUserId(user))}
                        disabled={isDeleting}
                      >
                        حذف
                      </button>
                    </div>
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

export default function UsersOnline() {
  const [onlineUsers, setOnlineUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [userIdInput, setUserIdInput] = useState('')
  const [foundUser, setFoundUser] = useState(null)
  const [isFinding, setIsFinding] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const onlineUsersCount = useMemo(() => (Array.isArray(onlineUsers) ? onlineUsers.length : 0), [onlineUsers])
  const allUsersCount = useMemo(() => (Array.isArray(allUsers) ? allUsers.length : 0), [allUsers])

  

  const refreshUsers = async () => {
    setIsLoading(true)
    try {
      const fetchedUsers = await fetchUsers()
      const nextAllUsers = Array.isArray(fetchedUsers) ? fetchedUsers : []
      setAllUsers(nextAllUsers)
      setOnlineUsers(nextAllUsers.filter((user) => user?.isOnline))
    } catch (error) {
      console.log(error?.message)
      toast('فشل تحميل المستخدمين', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUsers()

    socket.on('userOnline', (data)=>{
      console.log(data)
      if (Object.keys(data).length>0) {
        setOnlineUsers(prev=> prev.includes(data)?[...prev]:[...prev,data])
      }
    })
    socket.on('userOffline', (data)=>{
      if (Object.keys(data).length>0) {
        setOnlineUsers(prev=>prev.filter(user=>user._id!==data._id))
      }
    })

    return () => {
      socket.off('onlineUsers')
      socket.off('offlineUser')
    }
  }, [])

  const handleLoadUserDetails = async (userId) => {
    const id = String(userId || '').trim()
    if (!id) {
      toast('أدخل معرف المستخدم أولاً', 'error')
      return
    }

    setIsFinding(true)
    try {
      const user = await fetchUserById(id)
      if (!user?._id) {
        setFoundUser(null)
        toast('لم يتم العثور على المستخدم', 'error')
        return
      }

      setFoundUser(user)
      setUserIdInput(user._id)
      toast('تم تحميل بيانات المستخدم', 'success')
    } catch (error) {
      console.log(error?.message)
      setFoundUser(null)
      toast('فشل تحميل تفاصيل المستخدم', 'error')
    } finally {
      setIsFinding(false)
    }
  }

  const handleStartEdit = (user) => {
    setEditingUser(user)
    setForm(mapUserToForm(user))
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setForm(initialForm)
  }

  const handleFormChange = (field) => (event) => {
    const raw = event.target.value
    const numericFields = ['rank', 'totalSales', 'totalOrdersAccepted', 'totalOrdersRejected']
    const value = numericFields.includes(field) ? Number(raw || 0) : raw
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveUser = async () => {
    if (!editingUser?._id) return
    setIsSaving(true)
    try {
      const updated = await updateUserById(editingUser._id, form)
      const nextUser = updated?._id ? updated : { ...editingUser, ...form }
      const editId = editingUser._id

      setAllUsers((prev) => prev.map((item) => (item?._id === editId ? { ...item, ...nextUser } : item)))
      setOnlineUsers((prev) =>
        prev.map((item) => (item?._id === editId ? { ...item, ...nextUser } : item))
      )

      if (foundUser?._id === editId) {
        setFoundUser(nextUser)
      }

      toast('تم تحديث المستخدم بنجاح', 'success')
      handleCancelEdit()
    } catch (error) {
      console.log(error?.message)
      toast('فشل تحديث المستخدم', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!userId || isDeleting) return
    const confirmed = window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteUserById(userId)
      setOnlineUsers((prev) => prev.filter((item) => item?._id !== userId))
      setAllUsers((prev) => prev.filter((item) => item?._id !== userId))
      if (foundUser?._id === userId) setFoundUser(null)
      if (editingUser?._id === userId) handleCancelEdit()
      toast('تم حذف المستخدم بنجاح', 'success')
    } catch (error) {
      console.log(error?.message)
      toast('فشل حذف المستخدم', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="admin-card users-online-panel">
      <header className="users-online-head">
        <div>
          <h2>إدارة المستخدمين</h2>
          <p>عرض المستخدمين وتحميل التفاصيل الكاملة ثم التعديل أو الحذف عبر API.</p>
        </div>

        <div className="users-admin-head-actions">
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={refreshUsers}
            disabled={isLoading}
          >
            {isLoading ? 'جار التحميل...' : 'تحديث'}
          </button>
          <span className="users-online-count">{onlineUsersCount} / {allUsersCount}</span>
        </div>
      </header>

      <div className="users-admin-controls">
        <label className="admin-label">
          <span>بحث بواسطة معرف المستخدم</span>
          <input
            className="admin-input"
            value={userIdInput}
            onChange={(event) => setUserIdInput(event.target.value)}
            placeholder="اكتب معرف المستخدم"
          />
        </label>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => handleLoadUserDetails(userIdInput)}
          disabled={isFinding}
        >
          {isFinding ? 'جار البحث...' : 'جلب المستخدم'}
        </button>
      </div>

      {foundUser ? (
        <div className="users-admin-found">
          <strong>اسم المستخدم:</strong> {foundUser.username || '-'} | <strong>الدور:</strong> {foundUser.role || '-'} |{' '}
          <strong>ID:</strong> {foundUser._id}
        </div>
      ) : null}

      {foundUser ? (
        <div className="users-admin-edit">
          <h3>تفاصيل المستخدم</h3>
          <div className="users-admin-meta-grid">
            <div><span>اسم المستخدم</span><strong>{foundUser.username || '-'}</strong></div>
            <div><span>اسم المتجر</span><strong>{foundUser.shopName || '-'}</strong></div>
            <div><span>رقم الهاتف</span><strong>{foundUser.phoneNumber || '-'}</strong></div>
            <div><span>الدور</span><strong>{foundUser.role || '-'}</strong></div>
            <div><span>المدينة</span><strong>{foundUser.city || '-'}</strong></div>
            <div><span>المحافظة</span><strong>{foundUser.governorate || '-'}</strong></div>
            <div><span>العنوان</span><strong>{foundUser.address || '-'}</strong></div>
            <div><span>الرتبة</span><strong>{foundUser.rank ?? 0}</strong></div>
            <div><span>إجمالي المبيعات</span><strong>{foundUser.totalSales ?? 0}</strong></div>
            <div><span>الطلبات المقبولة</span><strong>{foundUser.totalOrdersAccepted ?? 0}</strong></div>
            <div><span>الطلبات المرفوضة</span><strong>{foundUser.totalOrdersRejected ?? 0}</strong></div>
            <div>
              <span>حالة الاتصال</span>
              <strong>{foundUser.isOnline ? 'متصل' : 'غير متصل'}</strong>
            </div>
          </div>

          <div className="users-admin-edit-actions">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => handleStartEdit(foundUser)}>
              تعديل هذا المستخدم
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              onClick={() => handleDeleteUser(foundUser._id)}
              disabled={isDeleting}
            >
              حذف هذا المستخدم
            </button>
          </div>
        </div>
      ) : null}

      {editingUser ? (
        <div className="users-admin-edit">
          <h3>تعديل المستخدم</h3>
          <div className="users-admin-form-grid">
            <label className="admin-label">
              <span>اسم المستخدم</span>
              <input className="admin-input" value={form.username} onChange={handleFormChange('username')} />
            </label>
            <label className="admin-label">
              <span>اسم المتجر</span>
              <input className="admin-input" value={form.shopName} onChange={handleFormChange('shopName')} />
            </label>
            <label className="admin-label">
              <span>رقم الهاتف</span>
              <input className="admin-input" value={form.phoneNumber} onChange={handleFormChange('phoneNumber')} />
            </label>
            <label className="admin-label">
              <span>الدور</span>
              <select className="admin-input" value={form.role} onChange={handleFormChange('role')}>
                <option value="user">user</option>
                <option value="trader">trader</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label className="admin-label">
              <span>المدينة</span>
              <input className="admin-input" value={form.city} onChange={handleFormChange('city')} />
            </label>
            <label className="admin-label">
              <span>المحافظة</span>
              <input className="admin-input" value={form.governorate} onChange={handleFormChange('governorate')} />
            </label>
            <label className="admin-label users-admin-span-2">
              <span>العنوان</span>
              <input className="admin-input" value={form.address} onChange={handleFormChange('address')} />
            </label>
            <label className="admin-label">
              <span>الرتبة</span>
              <input type="number" className="admin-input" value={form.rank} onChange={handleFormChange('rank')} />
            </label>
            <label className="admin-label">
              <span>إجمالي المبيعات</span>
              <input
                type="number"
                className="admin-input"
                value={form.totalSales}
                onChange={handleFormChange('totalSales')}
              />
            </label>
            <label className="admin-label">
              <span>الطلبات المقبولة</span>
              <input
                type="number"
                className="admin-input"
                value={form.totalOrdersAccepted}
                onChange={handleFormChange('totalOrdersAccepted')}
              />
            </label>
            <label className="admin-label">
              <span>الطلبات المرفوضة</span>
              <input
                type="number"
                className="admin-input"
                value={form.totalOrdersRejected}
                onChange={handleFormChange('totalOrdersRejected')}
              />
            </label>
          </div>

          <div className="users-admin-edit-actions">
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? 'جار الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={handleCancelEdit} disabled={isSaving}>
              إلغاء
            </button>
          </div>
        </div>
      ) : null}

      <OnlineUsersTable
        users={onlineUsers}
        isLoading={isLoading}
        emptyMessage="لا يوجد مستخدمون متصلون حالياً."
      />

      <UsersTable
        title="جميع المستخدمين المسجلين"
        users={allUsers}
        isLoading={isLoading}
        isFinding={isFinding}
        isDeleting={isDeleting}
        emptyMessage="لا يوجد مستخدمون مسجلون."
        onLoadDetails={handleLoadUserDetails}
        onStartEdit={handleStartEdit}
        onDelete={handleDeleteUser}
      />
    </section>
  )
}
