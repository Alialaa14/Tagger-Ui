import React, { useState, useEffect } from 'react'

export default function CompanyFormModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoFile: null
  })
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        logoFile: null
      })
      setPreview(initialData.logo?.url || '')
    } else {
      setFormData({
        name: '',
        description: '',
        logoFile: null
      })
      setPreview('')
    }
  }, [initialData, isOpen])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, logoFile: file }))
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
      
      <div className="category-form-modal">
        <div className="category-form-modal-head">
          <h3>{initialData ? 'تعديل الشركة' : 'إضافة شركة جديدة'}</h3>
          <button type="button" className="category-form-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-stack" style={{ padding: '24px' }}>
          <label className="admin-label">
            <span>اسم الشركة *</span>
            <input 
              className="admin-input" 
              required 
              value={formData.name} 
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
              placeholder="مثال: نسلة، المراعي..."
            />
          </label>

          <label className="admin-label">
            <span>وصف الشركة</span>
            <textarea 
              className="admin-input" 
              style={{ minHeight: '80px', paddingTop: '10px' }}
              value={formData.description} 
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} 
              placeholder="وصف قصير لنشاط الشركة"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '16px', alignItems: 'end' }}>
            <label className="admin-label">
              <span>شعار الشركة (Logo) *</span>
              <input 
                type="file" 
                accept="image/*" 
                required={!initialData} 
                onChange={handleFileChange} 
              />
            </label>
            
            <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid var(--border-soft)', background: 'var(--grey-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {preview ? (
                <img src={preview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ color: 'var(--grey-400)', fontSize: '10px', textAlign: 'center' }}>بدون شعار</div>
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
