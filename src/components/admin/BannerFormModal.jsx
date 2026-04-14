import React, { useState, useEffect } from 'react'

export default function BannerFormModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    isActive: true,
    imageUrl: '',
    imageFile: null
  })
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        buttonText: initialData.buttonText || '',
        buttonLink: initialData.buttonLink || '',
        order: initialData.order || 0,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        imageUrl: initialData.imageUrl?.url || initialData.imageUrl || '',
        imageFile: null
      })
      setPreview(initialData.imageUrl?.url || initialData.imageUrl || '')
    } else {
      setFormData({
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        order: 0,
        isActive: true,
        imageUrl: '',
        imageFile: null
      })
      setPreview('')
    }
  }, [initialData, isOpen])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }))
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="category-form-modal-backdrop" role="dialog" aria-modal="true">
      <button type="button" className="category-form-modal-overlay" onClick={onClose} />
      
      <div className="category-form-modal" style={{ maxWidth: '600px' }}>
        <div className="category-form-modal-head">
          <h3>{initialData ? 'تعديل البانر' : 'إضافة بانر جديد'}</h3>
          <button type="button" className="category-form-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-stack" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <label className="admin-label">
              <span>العنوان (Title) *</span>
              <input 
                className="admin-input" 
                required 
                value={formData.title} 
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} 
              />
            </label>
            <label className="admin-label">
              <span>الوصف (Subtitle)</span>
              <input 
                className="admin-input" 
                value={formData.subtitle} 
                onChange={e => setFormData(p => ({ ...p, subtitle: e.target.value }))} 
              />
            </label>
            <label className="admin-label">
              <span>نص الزر (CTA)</span>
              <input 
                className="admin-input" 
                value={formData.buttonText} 
                onChange={e => setFormData(p => ({ ...p, buttonText: e.target.value }))} 
              />
            </label>
            <label className="admin-label">
              <span>رابط الزر (Link)</span>
              <input 
                className="admin-input" 
                value={formData.buttonLink} 
                onChange={e => setFormData(p => ({ ...p, buttonLink: e.target.value }))} 
              />
            </label>
            <label className="admin-label">
              <span>الترتيب (Order)</span>
              <input 
                className="admin-input" 
                type="number" 
                value={formData.order} 
                onChange={e => setFormData(p => ({ ...p, order: Number(e.target.value) }))} 
              />
            </label>
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.isActive} 
                onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} 
              />
              <span>تفعيل البانر (Active)</span>
            </label>
          </div>

          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 140px', gap: '16px' }}>
            <div className="admin-stack" style={{ gap: '12px' }}>
              <label className="admin-label">
                <span>اختيار صورة (Upload)</span>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
              <label className="admin-label">
                <span>أو رابط صورة خارجي (URL)</span>
                <input 
                  className="admin-input" 
                  value={formData.imageUrl} 
                  onChange={e => {
                    setFormData(p => ({ ...p, imageUrl: e.target.value }))
                    setPreview(e.target.value)
                  }} 
                />
              </label>
            </div>
            
            <div style={{ width: '140px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #e2e8f0', background: '#f8fafc' }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '11px' }}>لا توجد صورة</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="admin-btn admin-btn-primary" style={{ flex: 1 }}>حفظ</button>
            <button type="button" onClick={onClose} className="admin-btn admin-btn-ghost" style={{ flex: 1 }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}
