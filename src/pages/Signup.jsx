import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from '../utils/toast'
import { refreshAuthFromCookies } from '../socket'

export default function Signup() {
  const [form, setForm] = useState({
    username: '',
    shopName: '',
    phoneNumber: '',
    city: '',
    governorate: '',
    address: '',
    password: '',
    role: 'trader',
  })
  const navigate = useNavigate()

  function change(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function setRole(role) {
    setForm(f => ({ ...f, role }))
  }

  async function submit(e) {
    e.preventDefault()
    try {
      const { data: res } = await axios.post('http://localhost:3000/api/v1/auth/register', form, { withCredentials: true })
      if (!res || !res.success) {
        toast(res?.message || 'فشل إنشاء الحساب', 'error')
        return
      }
      const data = res.data
      const token = data?.access_token || data?.token || (typeof data === 'string' ? data : null)
      if (token) {
        document.cookie = `access_token=${encodeURIComponent(token)};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`
        try { refreshAuthFromCookies() } catch (e) { /* ignore */ }
      }
      toast(res.message || 'تم إنشاء الحساب', 'success')
      navigate('/')
    } catch (err) {
      console.error(err)
      const serverMsg = err?.response?.data?.message || err.message || 'خطأ في الاتصال'
      toast(serverMsg, 'error')
    }
  }

  return (
    <section className="auth-page" dir="rtl" lang="ar">
      <div className="auth-grid">
        <aside className="auth-hero">
          <div className="auth-hero__badge">منصة تجارة عربية</div>
          <h1>ابدأ متجرك بسهولة</h1>
          <p>
            أنشئ حسابك كتاجر أو عميل، وابدأ إدارة الطلبات والمنتجات في واجهة عربية مصممة للهواتف والويب.
          </p>
          <ul className="auth-hero__list">
            <li>واجهة عربية كاملة واتجاه RTL صحيح</li>
            <li>لوحة تحكم بسيطة وسريعة</li>
            <li>إدارة الطلبات والمتجر من مكان واحد</li>
          </ul>
        </aside>

        <div className="auth-card" role="main" aria-labelledby="signup-title">
          <header className="auth-header">
            <p className="auth-eyebrow">إنشاء حساب جديد</p>
            <h2 id="signup-title">تسجيل حسابك في دقائق</h2>
            <p className="auth-sub">أدخل بياناتك الأساسية، واختر نوع الحساب المناسب.</p>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <div className="input-row">
              <label className="input-group">
                <span>اسم المستخدم</span>
                <input type="text" placeholder="الاسم الكامل" value={form.username} onChange={change('username')} autoComplete="name" />
              </label>
              <label className="input-group">
                <span>اسم المتجر</span>
                <input type="text" placeholder="اسم متجرك" value={form.shopName} onChange={change('shopName')} autoComplete="organization" />
              </label>
            </div>

            <div className="input-row">
              <label className="input-group">
                <span>رقم الهاتف</span>
                <input type="tel" placeholder="01012345678" value={form.phoneNumber} onChange={change('phoneNumber')} autoComplete="tel" dir="ltr" />
              </label>
              <label className="input-group">
                <span>المدينة</span>
                <input type="text" placeholder="المدينة" value={form.city} onChange={change('city')} autoComplete="address-level2" />
              </label>
            </div>

            <div className="input-row">
              <label className="input-group">
                <span>المحافظة</span>
                <input type="text" placeholder="المحافظة" value={form.governorate} onChange={change('governorate')} autoComplete="address-level1" />
              </label>
              <label className="input-group">
                <span>العنوان</span>
                <input type="text" placeholder="عنوان مفصل" value={form.address} onChange={change('address')} autoComplete="street-address" />
              </label>
            </div>

            <label className="input-group">
              <span>كلمة المرور</span>
              <input type="password" placeholder="اختر كلمة مرور قوية" value={form.password} onChange={change('password')} autoComplete="new-password" />
            </label>

            <div className="role-section">
              <span className="role-label">نوع الحساب</span>
              <div className="role-options" role="group" aria-label="نوع الحساب">
                <button type="button" className={`role-option ${form.role === 'trader' ? 'is-active' : ''}`} onClick={() => setRole('trader')}>
                  تاجر
                </button>
                <button type="button" className={`role-option ${form.role === 'customer' ? 'is-active' : ''}`} onClick={() => setRole('customer')}>
                  عميل
                </button>
              </div>
            </div>

            <div className="actions-row">
              <button type="submit" className="btn btn-primary">إنشاء الحساب</button>
              <button type="reset" className="btn btn-ghost">مسح</button>
            </div>

            <p className="form-note">بالتسجيل أنت توافق على الشروط والأحكام وسياسة الخصوصية.</p>
            <div className="auth-links">
              <button type="button" className="link-btn" onClick={() => navigate('/login')}>لديك حساب؟ تسجيل الدخول</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
