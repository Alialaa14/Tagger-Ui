import React, { useEffect, useRef, useState } from 'react'
import { useCart } from '../../context/CartContext'
import "./CartNote.css"

export default function CartNote() {
  const { note, setOrderNote } = useCart()

  const [text, setText]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const initialised           = useRef(false)

  // Only copy note → textarea ONCE, when the cart first loads
  useEffect(() => {
    if (initialised.current) return
    if (note === undefined || note === null) return
    setText(note)
    initialised.current = true
  }, [note])

  async function handleSave() {
    setSaving(true)
    setError('')
    const result = await setOrderNote(text.trim())
    if (result && !result.ok) setError(result.message || 'فشل حفظ الملاحظة')
    setSaving(false)
  }

  return (
    <div className="cart-note" dir="rtl">
      <p className="cart-note__label">📝 ملاحظة الطلب</p>

      <textarea
        className="cart-note__textarea"
        placeholder="أضف أي تعليمات خاصة… مثال: التوصيل بعد الساعة 6 مساءً"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={300}
        disabled={saving}
      />

      <div className="cart-note__footer">
        <span className="cart-note__count">{text.length}/300</span>
        <button
          type="button"
          className="cart-note__save"
          onClick={handleSave}
          disabled={saving || text.trim() === (note || '').trim()}
        >
          {saving ? 'جاري الحفظ…' : 'حفظ'}
        </button>
      </div>

      {error && <p className="cart-note__error">{error}</p>}

      {/* Display paragraph — shows the confirmed saved note from the server */}
      {note && note.trim() && (
        <div className="cart-note__display">
          <span className="cart-note__display-tag">ملاحظتك المحفوظة</span>
          <p className="cart-note__display-text">{note}</p>
        </div>
      )}
    </div>
  )
}
