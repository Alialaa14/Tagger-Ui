import React, { useState } from 'react'
import './NewsletterSignup.css'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-title" dir="rtl">
      <div className="container">
        <div className="newsletter-inner">
          <div className="newsletter-content">
            <h3 id="newsletter-title">اشترك في النشرة البريدية</h3>
            <p>احصل على أحدث العروض والخصومات الحصرية مباشرة على بريدك الإلكتروني.</p>
            
            {status === 'success' ? (
              <div className="newsletter-success">
                <span className="success-icon">🎉</span>
                تم الاشتراك بنجاح! شكراً لك.
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubmit}>
                <input 
                  type="email" 
                  className="newsletter-input" 
                  placeholder="أدخل بريدك الإلكتروني..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                />
                <button 
                  type="submit" 
                  className="newsletter-btn"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'جاري...' : 'اشتراك'}
                </button>
              </form>
            )}
          </div>
          
          <div className="newsletter-image">
            {/* Using a nice abstract shape or relevant e-commerce illustration */}
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M47.7,-57.2C59.6,-47.3,65.6,-30.6,68.5,-13.9C71.5,2.9,71.4,19.8,63.4,32.3C55.4,44.9,39.6,53.2,22.8,60.1C6,67,-11.7,72.4,-27.2,68.4C-42.7,64.4,-55.8,51,-62.7,35.4C-69.5,19.8,-70.2,2,-65.4,-13.4C-60.6,-28.9,-50.4,-42.1,-37.2,-51.7C-24.1,-61.3,-8,-67.4,4.7,-73C17.5,-78.5,35.9,-67.2,47.7,-57.2Z" transform="translate(100 100)" />
            </svg>
            <div className="newsletter-badge">٪ خصم</div>
          </div>
        </div>
      </div>
    </section>
  )
}
