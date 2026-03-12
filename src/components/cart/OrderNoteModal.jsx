import React, { useEffect, useState } from 'react'

/**
 * OrderNoteModal
 * Props:
 *   open          — bool
 *   onClose       — () => void
 *   initialValue  — string
 *   onSave        — (note: string) => void
 */
export default function OrderNoteModal({ open, onClose, initialValue = '', onSave }) {
  const [note, setNote] = useState(initialValue)
  useEffect(() => {
    if (!open) return
    setNote(initialValue || '')
  }, [open, initialValue])

  if (!open) return null

  function handleSave() {
    onSave(note.trim())
    onClose()
  }

  return (
    <div
      className="cart-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="cart-modal" dir="rtl">
        {/* Head */}
        <div className="cart-modal-head">
          <div>
            <h3 id="note-modal-title">📝 ملاحظة الطلب</h3>
            <p>أضف أي تعليمات خاصة تريد إيصالها مع طلبك.</p>
          </div>
          <button className="cart-modal-close" onClick={onClose} aria-label="إغلاق">✕</button>
        </div>

        {/* Textarea */}
        <textarea
          className="cart-modal-textarea"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="مثال: التوصيل بعد الساعة 6 مساءً، الباب الخلفي…"
          dir="rtl"
          autoFocus
        />

        {/* Actions */}
        <div className="cart-modal-actions">
          <button className="btn btn-ghost" onClick={onClose} type="button">إلغاء</button>
          <button className="btn btn-primary" onClick={handleSave} type="button">حفظ الملاحظة</button>
        </div>
      </div>
    </div>
  )
}
