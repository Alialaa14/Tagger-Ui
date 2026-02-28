import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PasswordInput from '../components/PasswordInput'
import toast from '../utils/toast'
import { refreshAuthFromCookies } from '../socket'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [phoneNumber, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  async function submit(e) {
    e.preventDefault()
    try {
      const payload = { phoneNumber, password }
      const { data: res } = await axios.post('http://localhost:3000/api/v1/auth/login', payload, { withCredentials: true })
      if (!res || !res.success) {
        toast(res?.message || 'فشل تسجيل الدخول', 'error')
        return
      }

      const data = res.data
      const role = data?.role
      if (role) localStorage.setItem('user_role', String(role).toLowerCase())
      else localStorage.removeItem('user_role')

      const token = data?.access_token || data?.token || (typeof data === 'string' ? data : null)
      if (token) {
        document.cookie = `access_token=${encodeURIComponent(token)};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`
        try { refreshAuthFromCookies() } catch (_) { /* ignore */ }
      }

      await refreshUser()
      toast(res.message || 'تم تسجيل الدخول', 'success')
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
          <div className="auth-hero__badge">تجربة دخول أسرع</div>
          <h1>مرحبا بعودتك</h1>
          <p>ادخل إلى حسابك لمتابعة الطلبات ومراجعة أداء متجرك باللغة العربية.</p>
          <ul className="auth-hero__list">
            <li>لوحة تحكم محدثة لحظيا</li>
            <li>إشعارات فورية للطلبات الجديدة</li>
            <li>إدارة مرنة لمنتجاتك</li>
          </ul>
        </aside>

        <div className="auth-card" role="main" aria-labelledby="login-title">
          <header className="auth-header">
            <p className="auth-eyebrow">تسجيل الدخول</p>
            <h2 id="login-title">ادخل لحسابك الآن</h2>
            <p className="auth-sub">أدخل رقم هاتفك وكلمة المرور للمتابعة.</p>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <label className="input-group">
              <span>رقم الهاتف</span>
              <input type="tel" placeholder="مثال: 01012345678" value={phoneNumber} onChange={e => setPhone(e.target.value)} autoComplete="tel" dir="ltr" />
            </label>

            <label className="input-group">
              <span>كلمة المرور</span>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" />
            </label>

            <div className="actions-row">
              <button type="submit" className="btn btn-primary">تسجيل الدخول</button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/signup')}>إنشاء حساب</button>
            </div>

            <div className="auth-links">
              <button type="button" className="link-btn" onClick={() => navigate('/forgot')}>نسيت كلمة المرور؟</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
