import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from '../utils/toast'

function toForm(user) {
  return {
    username: user?.username || '',
    shopName: user?.shopName || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    governorate: user?.governorate || '',
    address: user?.address || '',
    image: user?.image || user?.avatar || user?.profileImage || '',
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, loading, updateProfile, refreshUser } = useAuth()
  const [form, setForm] = useState(toForm(user))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(toForm(user))
  }, [user])

  function change(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== null && v !== undefined)
      )
      const res = await updateProfile(payload)
      await refreshUser()
      toast(res?.message || 'تم تحديث بياناتك', 'success')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'فشل تحديث البيانات'
      toast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <section className="auth-page" dir="rtl" lang="ar">
      <div className="auth-grid">
        <aside className="auth-hero">
          <div className="auth-hero__badge">الملف الشخصي</div>
          <h1>بيانات الحساب</h1>
          <p>يمكنك تعديل بياناتك الأساسية ثم حفظها مباشرة عبر الـ API.</p>
          <ul className="auth-hero__list">
            <li>تحديث الاسم ورقم الهاتف والعنوان</li>
            <li>تعديل بيانات المتجر</li>
            <li>العودة إلى الصفحة الرئيسية بعد الحفظ</li>
          </ul>
        </aside>

        <div className="auth-card" role="main" aria-labelledby="profile-title">
          <header className="auth-header">
            <p className="auth-eyebrow">إدارة الحساب</p>
            <h2 id="profile-title">تعديل بيانات المستخدم</h2>
            <p className="auth-sub">أي تعديل هنا يتم إرساله إلى `POST /api/v1/auth/me`.</p>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <div className="input-row">
              <label className="input-group">
                <span>اسم المستخدم</span>
                <input type="text" value={form.username} onChange={change('username')} />
              </label>
              <label className="input-group">
                <span>اسم المتجر</span>
                <input type="text" value={form.shopName} onChange={change('shopName')} />
              </label>
            </div>

            <div className="input-row">
              <label className="input-group">
                <span>رقم الهاتف</span>
                <input type="tel" value={form.phoneNumber} onChange={change('phoneNumber')} dir="ltr" />
              </label>
              <label className="input-group">
                <span>المدينة</span>
                <input type="text" value={form.city} onChange={change('city')} />
              </label>
            </div>

            <div className="input-row">
              <label className="input-group">
                <span>المحافظة</span>
                <input type="text" value={form.governorate} onChange={change('governorate')} />
              </label>
              <label className="input-group">
                <span>العنوان</span>
                <input type="text" value={form.address} onChange={change('address')} />
              </label>
            </div>

            <label className="input-group">
              <span>رابط الصورة</span>
              <input type="text" value={form.image} onChange={change('image')} dir="ltr" />
            </label>

            <div className="actions-row">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>العودة للرئيسية</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
