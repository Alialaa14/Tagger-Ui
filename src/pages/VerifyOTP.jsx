import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VerifyOTP() {
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  function submit(e) {
    e.preventDefault()
    console.log('verify otp', otp)
    alert('تم التحقق (تجريبي)')
    navigate('/reset-password')
  }

  return (
    <section className="auth-page" dir="rtl" lang="ar">
      <div className="auth-grid">
        <aside className="auth-hero">
          <div className="auth-hero__badge">خطوة التحقق</div>
          <h1>تحقق من هويتك</h1>
          <p>أدخل رمز التحقق الذي تم إرساله إليك لإكمال الخطوة التالية.</p>
          <ul className="auth-hero__list">
            <li>رمز صالح لفترة قصيرة</li>
            <li>حماية إضافية لحسابك</li>
            <li>إعادة إرسال بنقرة واحدة</li>
          </ul>
        </aside>

        <div className="auth-card" role="main" aria-labelledby="otp-title">
          <header className="auth-header">
            <p className="auth-eyebrow">التحقق من الرمز</p>
            <h2 id="otp-title">أدخل رمز التحقق</h2>
            <p className="auth-sub">تحقق من الرسائل أو البريد الإلكتروني.</p>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <label className="input-group">
              <span>رمز التحقق (OTP)</span>
              <input type="text" placeholder="أدخل الرمز" value={otp} onChange={e => setOtp(e.target.value)} inputMode="numeric" dir="ltr" />
            </label>

            <div className="actions-row">
              <button type="submit" className="btn btn-primary">تحقق</button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/forgot')}>إعادة الإرسال</button>
            </div>

            <div className="auth-links">
              <button type="button" className="link-btn" onClick={() => navigate('/login')}>العودة لتسجيل الدخول</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
