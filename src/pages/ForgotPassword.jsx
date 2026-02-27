import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  function submit(e) {
    e.preventDefault()
    console.log('forgot password', { phone, email })
    alert('تم إرسال رمز التحقق إلى البريد أو الهاتف (تجريبي)')
    navigate('/verify-otp')
  }

  return (
    <section className="auth-page" dir="rtl" lang="ar">
      <div className="auth-grid">
        <aside className="auth-hero">
          <div className="auth-hero__badge">استعادة الوصول</div>
          <h1>لا تقلق، نعيد لك حسابك</h1>
          <p>أرسل رقم الهاتف أو البريد الإلكتروني لنرسل لك رمز التحقق.</p>
          <ul className="auth-hero__list">
            <li>رمز تحقق سريع وآمن</li>
            <li>خطوات بسيطة لإعادة التعيين</li>
            <li>دعم على مدار الساعة</li>
          </ul>
        </aside>

        <div className="auth-card" role="main" aria-labelledby="forgot-title">
          <header className="auth-header">
            <p className="auth-eyebrow">استعادة كلمة المرور</p>
            <h2 id="forgot-title">أرسل بياناتك لاستلام الرمز</h2>
            <p className="auth-sub">يمكنك استخدام الهاتف أو البريد الإلكتروني.</p>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <div className="input-row">
              <label className="input-group">
                <span>رقم الهاتف</span>
                <input type="tel" placeholder="مثال: 01012345678" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" dir="ltr" />
              </label>
              <label className="input-group">
                <span>البريد الإلكتروني</span>
                <input type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" dir="ltr" />
              </label>
            </div>

            <div className="actions-row">
              <button type="submit" className="btn btn-primary">إرسال رمز التحقق</button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>العودة لتسجيل الدخول</button>
            </div>

            <div className="auth-links">
              <button type="button" className="link-btn" onClick={() => navigate('/verify-otp')}>لديك رمز بالفعل؟ تحقق الآن</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
