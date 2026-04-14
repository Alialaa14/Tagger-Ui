import React from 'react'

export default function DeleteCategoryModal({ isOpen, onCancel, onConfirm, pending = false }) {
  if (!isOpen) return null

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <h3>????? ?????</h3>
        <p>?? ??? ????? ?? ??? ??? ??????</p>

        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline-burgundy"
            onClick={onCancel}
            disabled={pending}
          >
            ?????
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={onConfirm}
            disabled={pending}
          >
            ???
          </button>
        </div>
      </div>
    </div>
  )
}
