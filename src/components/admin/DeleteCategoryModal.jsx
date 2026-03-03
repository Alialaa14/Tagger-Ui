import React from 'react'

export default function DeleteCategoryModal({ isOpen, onCancel, onConfirm, pending = false }) {
  if (!isOpen) return null

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <h3>تأكيد الحذف</h3>
        <p>هل أنت متأكد من حذف هذه الفئة؟</p>

        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline-burgundy"
            onClick={onCancel}
            disabled={pending}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={onConfirm}
            disabled={pending}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  )
}
