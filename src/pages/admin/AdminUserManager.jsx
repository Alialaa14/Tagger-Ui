import React, { useState, useEffect, useMemo } from 'react'
import { fetchUsers, createAdminUser } from '../../utils/adminUsersApi'
import toast from '../../utils/toast'

const initialForm = {
  username: '',
  password: '',
  phoneNumber: '',
  role: 'admin'
}

export default function AdminUserManager() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fetchAdminUsers = async () => {
    setLoading(true)
    try {
      const allUsers = await fetchUsers()
      // Filter for admins only
      const admins = allUsers.filter(u => u.role === 'admin')
      setUsers(admins)
    } catch (error) {
      toast('فشل تحميل قائمة المسئولين', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.phoneNumber) {
      toast('يرجى ملء كافة البيانات المطلوبة', 'error')
      return
    }

    setIsSaving(true)
    try {
      await createAdminUser(form)
      toast('تم إضافة المسئول بنجاح', 'success')
      setForm(initialForm)
      fetchAdminUsers()
    } catch (error) {
      const msg = error?.response?.data?.message || 'فشل إنشاء حساب المسئول'
      toast(msg, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredAdmins = useMemo(() => {
    return users.filter(u => 
      u.username?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  return (
    <div className="admin-stack" dir="rtl">
      {/* ── Create Admin Form ── */}
      <section className="admin-card">
        <div className="admin-section-head">
          <div>
            <h2>إضافة مسئول جديد</h2>
            <p>قم بإنشاء حساب جديد بصلاحيات كاملة للمنصة.</p>
          </div>
        </div>

        <form className="product-form" onSubmit={handleCreateAdmin}>
          <div className="product-form-grid">
            <label className="admin-label">
              <span>اسم المستخدم *</span>
              <input 
                className="admin-input" 
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                placeholder="مثال: admin_ali"
                required
              />
            </label>
            <label className="admin-label">
              <span>رقم الهاتف *</span>
              <input 
                className="admin-input" 
                value={form.phoneNumber}
                onChange={e => setForm({...form, phoneNumber: e.target.value})}
                placeholder="مثال: 01012345678"
                required
              />
            </label>
            <label className="admin-label">
              <span>كلمة المرور *</span>
              <input 
                type="password"
                className="admin-input" 
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </label>
          </div>
          
          <div className="product-form-actions">
            <button 
              type="submit" 
              className="admin-btn admin-btn-primary" 
              disabled={isSaving}
            >
              {isSaving ? 'جار الحفظ...' : 'إنشاء حساب المسئول'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Admin List ── */}
      <section className="admin-card">
        <div className="admin-section-head">
          <div>
            <h2>قائمة المسئولين الحاليين</h2>
            <p>إدارة وتصفح جميع الحسابات ذات الصلاحيات الإدارية.</p>
          </div>
          <div className="users-admin-controls" style={{ marginTop: 0 }}>
             <input 
                className="admin-input" 
                style={{ width: '240px' }}
                placeholder="بحث..."
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
          </div>
        </div>

        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>اسم المستخدم</th>
                <th>رقم الهاتف</th>
                <th>تاريخ الإنضمام</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>لا يوجد مسئولون مطابقون للبحث.</td>
                </tr>
              ) : (
                filteredAdmins.map(admin => (
                  <tr key={admin._id || admin.id}>
                    <td><strong>{admin.username}</strong></td>
                    <td>{admin.phoneNumber || '-'}</td>
                    <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('ar-EG') : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
