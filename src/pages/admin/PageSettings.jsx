import React, { useState, useEffect } from 'react'
import './admin-theme.css'

export default function PageSettings() {
  const [activeTab, setActiveTab] = useState('banners')

  // Banners
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('tagger_banners')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: Date.now(),
        bg: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)',
        badge: '🛒 عرض الأسبوع',
        title: 'خضروات طازجة يومياً',
        subtitle: 'مباشرة من المزارع إلى بيتك — توصيل في غضون ساعتين',
        cta: 'تسوق الآن',
        ctaLink: '/categories',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
        accent: '#4ade80',
      }
    ]
  })

  // Brands
  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('tagger_brands')
    if (saved) return JSON.parse(saved)
    return [
      { id: 1, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
      { id: 2, name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' }
    ]
  })

  // Testimonials
  const [testimonials, setTestimonials] = useState(() => {
    const saved = localStorage.getItem('tagger_testimonials')
    if (saved) return JSON.parse(saved)
    return [
      {
        id: 1,
        name: 'أحمد محمود',
        role: 'عميل دائم',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        rating: 5,
        text: 'تجربة رائعة وتوصيل سريع جداً.',
      }
    ]
  })

  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem('tagger_banners', JSON.stringify(banners))
  }, [banners])

  useEffect(() => {
    localStorage.setItem('tagger_brands', JSON.stringify(brands))
  }, [brands])

  useEffect(() => {
    localStorage.setItem('tagger_testimonials', JSON.stringify(testimonials))
  }, [testimonials])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Banner Actions
  const addBanner = () => {
    setBanners(prev => [...prev, {
      id: Date.now(), bg: '#0f172a', badge: 'جديد', title: 'عنوان الشريحة', subtitle: 'وصف قصير', cta: 'اضغط هنا', ctaLink: '/', image: '', accent: '#3b82f6'
    }])
  }
  const updateBanner = (id, field, value) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
  }
  const removeBanner = (id) => setBanners(prev => prev.filter(b => b.id !== id))

  // Brand Actions
  const addBrand = () => {
    setBrands(prev => [...prev, { id: Date.now(), name: 'ماركة جديدة', logo: '' }])
  }
  const updateBrand = (id, field, value) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
  }
  const removeBrand = (id) => setBrands(prev => prev.filter(b => b.id !== id))

  // Testimonial Actions
  const addTestimonial = () => {
    setTestimonials(prev => [...prev, { id: Date.now(), name: 'اسم العميل', role: 'عميل', avatar: '', rating: 5, text: 'رأي العميل هنا...' }])
  }
  const updateTestimonial = (id, field, value) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }
  const removeTestimonial = (id) => setTestimonials(prev => prev.filter(t => t.id !== id))

  return (
    <div className="admin-stack">
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: 24, background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: 8, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
          {toast}
        </div>
      )}

      <div className="admin-card">
        <p className="admin-kicker">تخصيص الواجهة</p>
        <h2>إعدادات الصفحات</h2>
        <p className="admin-muted">قم بتعديل محتوى الصفحة الرئيسية (اللافتات، الماركات، والآراء).</p>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button 
            style={{ flex: 1, padding: 16, background: activeTab === 'banners' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'banners' ? '2px solid #3b82f6' : '2px solid transparent', fontWeight: 700, cursor: 'pointer', color: activeTab === 'banners' ? '#0f172a' : '#64748b' }}
            onClick={() => setActiveTab('banners')}
          >
            اللافتات الإعلانية
          </button>
          <button 
            style={{ flex: 1, padding: 16, background: activeTab === 'brands' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'brands' ? '2px solid #3b82f6' : '2px solid transparent', fontWeight: 700, cursor: 'pointer', color: activeTab === 'brands' ? '#0f172a' : '#64748b' }}
            onClick={() => setActiveTab('brands')}
          >
            الماركات البارزة
          </button>
          <button 
            style={{ flex: 1, padding: 16, background: activeTab === 'testimonials' ? '#fff' : 'transparent', border: 'none', borderBottom: activeTab === 'testimonials' ? '2px solid #3b82f6' : '2px solid transparent', fontWeight: 700, cursor: 'pointer', color: activeTab === 'testimonials' ? '#0f172a' : '#64748b' }}
            onClick={() => setActiveTab('testimonials')}
          >
            آراء العملاء
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* ──────────────── BANNERS ──────────────── */}
          {activeTab === 'banners' && (
            <div className="admin-stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>اللافتات (Banners)</h3>
                <button onClick={addBanner} className="admin-btn admin-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  + إضافة لافتة
                </button>
              </div>

              {banners.length === 0 && <p className="admin-muted text-center" style={{ padding: 40 }}>لا توجد لافتات.</p>}

              {banners.map((b, idx) => (
                <div key={b.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, position: 'relative' }}>
                  <button onClick={() => removeBanner(b.id)} style={{ position: 'absolute', top: 12, left: 12, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: 15, color: '#334155' }}>شريحة #{idx + 1}</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label className="admin-label"><span>العنوان (Title)</span><input className="admin-input" value={b.title} onChange={e => updateBanner(b.id, 'title', e.target.value)} /></label>
                    <label className="admin-label"><span>الوصف (Subtitle)</span><input className="admin-input" value={b.subtitle} onChange={e => updateBanner(b.id, 'subtitle', e.target.value)} /></label>
                    <label className="admin-label"><span>الشارة (Badge)</span><input className="admin-input" value={b.badge} onChange={e => updateBanner(b.id, 'badge', e.target.value)} /></label>
                    <label className="admin-label"><span>رابط الصورة (Image URL)</span><input className="admin-input" value={b.image} onChange={e => updateBanner(b.id, 'image', e.target.value)} /></label>
                    <label className="admin-label"><span>نص الزر (CTA)</span><input className="admin-input" value={b.cta} onChange={e => updateBanner(b.id, 'cta', e.target.value)} /></label>
                    <label className="admin-label"><span>رابط الزر (Link)</span><input className="admin-input" value={b.ctaLink} onChange={e => updateBanner(b.id, 'ctaLink', e.target.value)} /></label>
                    <label className="admin-label"><span>لون الخلفية (CSS)</span><input className="admin-input" value={b.bg} onChange={e => updateBanner(b.id, 'bg', e.target.value)} dir="ltr" /></label>
                    <label className="admin-label"><span>اللون المميز (Accent)</span><input className="admin-input" type="color" value={b.accent} onChange={e => updateBanner(b.id, 'accent', e.target.value)} style={{ padding: 4, height: 42 }} /></label>
                  </div>
                </div>
              ))}
              
              {banners.length > 0 && (
                <button onClick={() => showToast('تم الحفظ مؤقتاً في المتصفح')} className="admin-btn admin-btn-primary" style={{ width: '100%' }}>حفظ التعديلات</button>
              )}
            </div>
          )}

          {/* ──────────────── BRANDS ──────────────── */}
          {activeTab === 'brands' && (
            <div className="admin-stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>الماركات البارزة (Brands)</h3>
                <button onClick={addBrand} className="admin-btn admin-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  + إضافة ماركة
                </button>
              </div>

              {brands.length === 0 && <p className="admin-muted text-center" style={{ padding: 40 }}>لا توجد ماركات مضافة.</p>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {brands.map((b) => (
                  <div key={b.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, position: 'relative' }}>
                     <button onClick={() => removeBrand(b.id)} style={{ position: 'absolute', top: 8, left: 8, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                     <label className="admin-label"><span>اسم الماركة</span><input className="admin-input" value={b.name} onChange={e => updateBrand(b.id, 'name', e.target.value)} /></label>
                     <label className="admin-label" style={{ marginBottom: 0 }}><span>رابط الشعار (Logo URL)</span><input className="admin-input" value={b.logo} onChange={e => updateBrand(b.id, 'logo', e.target.value)} dir="ltr" /></label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──────────────── TESTIMONIALS ──────────────── */}
          {activeTab === 'testimonials' && (
            <div className="admin-stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>آراء العملاء (Testimonials)</h3>
                <button onClick={addTestimonial} className="admin-btn admin-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  + إضافة تقييم
                </button>
              </div>

              {testimonials.length === 0 && <p className="admin-muted text-center" style={{ padding: 40 }}>لا توجد تقييمات مضافة.</p>}

              {testimonials.map((t) => (
                <div key={t.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, position: 'relative' }}>
                  <button onClick={() => removeTestimonial(t.id)} style={{ position: 'absolute', top: 12, left: 12, background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label className="admin-label"><span>اسم العميل</span><input className="admin-input" value={t.name} onChange={e => updateTestimonial(t.id, 'name', e.target.value)} /></label>
                    <label className="admin-label"><span>الوصف (مثلاً: عميل جديد)</span><input className="admin-input" value={t.role} onChange={e => updateTestimonial(t.id, 'role', e.target.value)} /></label>
                    <label className="admin-label"><span>رابط الصورة الرمزية</span><input className="admin-input" value={t.avatar} onChange={e => updateTestimonial(t.id, 'avatar', e.target.value)} dir="ltr" /></label>
                    <label className="admin-label"><span>التقييم (من 1 لـ 5)</span>
                      <select className="admin-input" value={t.rating} onChange={e => updateTestimonial(t.id, 'rating', Number(e.target.value))}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="admin-label" style={{ marginTop: 16, marginBottom: 0 }}><span>الرأي النصي</span>
                    <textarea className="admin-input" rows={3} value={t.text} onChange={e => updateTestimonial(t.id, 'text', e.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
