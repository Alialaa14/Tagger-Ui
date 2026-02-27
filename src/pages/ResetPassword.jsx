import React, { useState } from 'react'
import PasswordInput from '../components/PasswordInput'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const navigate = useNavigate()

  function submit(e) {
    e.preventDefault()
    if (password.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف أو أكثر')
      return
    }
    if (password !== confirm) {
      alert('كلمتا المرور غير متطابقتين')
      return
    }
    console.log('reset password', password)
    alert('تم تغيير كلمة المرور (تجريبي)')
    navigate('/login')
  }

  return (
    <section className="auth-page" dir="rtl" lang="ar">
      <div className="auth-grid">
        <aside className="auth-hero">
          <div className="auth-hero__badge">تعيين كلمة مرور</div>
          <h1>اجعل حسابك أكثر أمانا</h1>
          <p>اختر كلمة مرور قوية يسهل تذكرها ويصعب تخمينها.</p>
          <ul className="auth-hero__list">
            <li>مزج بين الأحرف والأرقام</li>
            <li>تجنب الكلمات الشائعة</li>
            <li>لا تشارك كلمة المرور مع أحد</li>
          </ul>
        </aside>

        <div className="auth-card" role="main" aria-labelledby="reset-title">
          <header className="auth-header">
            <p className="auth-eyebrow">كلمة مرور جديدة</p>
            <h2 id="reset-title">تعيين كلمة مرور جديدة</h2>
            <p className="auth-sub">أدخل كلمة مرور جديدة لتسجيل الدخول لاحقا.</p>
          </header>

          <form className="auth-form" onSubmit={submit}>
            <label className="input-group">
              <span>كلمة المرور الجديدة</span>
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور الجديدة" />
            </label>

            <label className="input-group">
              <span>تأكيد كلمة المرور</span>
              <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="أعد إدخال كلمة المرور" />
            </label>

            <div className="actions-row">
              <button type="submit" className="btn btn-primary">حفظ</button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/login')}>إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
