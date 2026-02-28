import React, { useEffect, useMemo, useState } from 'react'

const LIMIT = 300

export default function OrderNoteModal({ open, onClose, initialValue = '', onSave }) {
  const [value, setValue] = useState(initialValue)
  const count = useMemo(() => value.length, [value])

  useEffect(() => {
    if (open) setValue(initialValue || '')
  }, [open, initialValue])

  if (!open) return null

  return (
    <div className="cart-modal-overlay open" onClick={onClose}>
      <div className="cart-mini-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Order note</h3>
        <div className="cart-mini-form">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, LIMIT))}
            placeholder="Write your order note..."
            rows={5}
          />
          <p className="note-counter">{count}/{LIMIT}</p>
          <div className="cart-mini-actions">
            <button type="button" className="btn cart-checkout-btn" onClick={() => { onSave(value); onClose() }}>
              Save
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
