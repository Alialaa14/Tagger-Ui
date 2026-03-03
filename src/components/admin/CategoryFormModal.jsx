import React from 'react'

export default function CategoryFormModal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="category-form-modal-backdrop" role="dialog" aria-modal="true">
      <button
        type="button"
        className="category-form-modal-overlay"
        aria-label="إغلاق نافذة الفئة"
        onClick={onClose}
      />

      <div className="category-form-modal">
        <div className="category-form-modal-head">
          <h3>{title}</h3>
          <button type="button" className="category-form-modal-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
