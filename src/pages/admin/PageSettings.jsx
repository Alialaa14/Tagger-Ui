import React, { useState, useEffect } from 'react'
import { bannerApi } from '../../utils/bannerApi'
import BannerFormModal from '../../components/admin/BannerFormModal'
import './admin-theme.css'

export default function PageSettings() {
  const [activeTab, setActiveTab] = useState('banners')

  // Banners
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)

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
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const data = await bannerApi.getAllBanners()
      setBanners(data || [])
    } catch (err) {
      showToast('❌ فشل تحميل البانرات')
    } finally {
      setLoading(false)
    }
  }

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
  const openCreateBanner = () => {
    setEditingBanner(null)
    setIsBannerModalOpen(true)
  }

  const openEditBanner = (banner) => {
    setEditingBanner(banner)
    setIsBannerModalOpen(true)
  }

  const handleSaveBanner = async (formData) => {
    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('subtitle', formData.subtitle)
      payload.append('buttonText', formData.buttonText)
      payload.append('buttonLink', formData.buttonLink)
      payload.append('order', formData.order || 0)
      payload.append('isActive', formData.isActive)

      if (formData.imageFile) {
        payload.append('image', formData.imageFile)
      } else if (formData.imageUrl) {
        payload.append('imageUrl', formData.imageUrl)
      }

      if (editingBanner) {
        await bannerApi.updateBanner(editingBanner._id, payload)
        showToast('✅ تم تحديث البانر')
      } else {
        await bannerApi.createBanner(payload)
        showToast('✅ تم إضافة البانر')
      }
      
      setIsBannerModalOpen(false)
      fetchBanners()
    } catch (err) {
      showToast(editingBanner ? '❌ فشل التحديث' : '❌ فشل الإضافة')
    }
  }

  const toggleBannerStatus = async (id) => {
    try {
      await bannerApi.toggleBanner(id)
      setBanners(prev => prev.map(b => b._id === id ? { ...b, isActive: !b.isActive } : b))
      showToast('✅ تم تغيير حالة البانر')
    } catch (err) {
      showToast('❌ فشل تغيير الحالة')
    }
  }

  const removeBanner = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البانر؟')) return
    try {
      await bannerApi.deleteBanner(id)
      setBanners(prev => prev.filter(b => b._id !== id))
      showToast('✅ تم حذف البانر')
    } catch (err) {
      showToast('❌ فشل حذف البانر')
    }
  }

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
                <button onClick={openCreateBanner} className="admin-btn admin-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                  + إضافة لافتة
                </button>
              </div>

               {banners.length === 0 && !loading && <p className="admin-muted text-center" style={{ padding: 40 }}>لا توجد لافتات مضافة حالياً.</p>}
               {loading && <p className="admin-muted text-center" style={{ padding: 40 }}>جاري التحميل...</p>}

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {banners.map((b, idx) => (
                  <div key={b._id} className="admin-card" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 2 }}>
                       <button onClick={() => removeBanner(b._id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '10px', background: '#f1f5f9', marginBottom: '12px', overflow: 'hidden' }}>
                      <img 
                        src={b.imageUrl?.url || b.image} 
                        alt={b.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={e => e.target.src = 'https://placehold.co/400x200?text=No+Image'}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px' }}>{b.title}</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>ترتيب: {b.order}</p>
                      </div>
                      <span style={{ 
                        fontSize: '10px', padding: '2px 8px', borderRadius: '99px', 
                        background: b.isActive ? '#dcfce7' : '#f1f5f9', 
                        color: b.isActive ? '#16a34a' : '#64748b',
                        fontWeight: 800
                      }}>
                        {b.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button onClick={() => openEditBanner(b)} className="admin-btn admin-btn-ghost" style={{ flex: 1, minHeight: '34px', fontSize: '12px' }}>تعديل</button>
                      <button onClick={() => toggleBannerStatus(b._id)} className="admin-btn admin-btn-ghost" style={{ flex: 1, minHeight: '34px', fontSize: '12px' }}>
                        {b.isActive ? 'تعطيل' : 'تفعيل'}
                      </button>
                    </div>
                  </div>
                ))}
               </div>
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

      <BannerFormModal 
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        initialData={editingBanner}
        onSave={handleSaveBanner}
      />
    </div>
  )
}
