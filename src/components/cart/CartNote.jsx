import React, { useEffect, useRef, useState } from 'react'
import { useCart } from '../../context/CartContext'
import "./CartNote.css"

export default function CartNote() {
  const { note, setOrderNote } = useCart()

  const [text, setText]     = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [saved, setSaved]   = useState(false)
  const editing             = useRef(false)   // true while the user is actively typing

  // Sync textarea from context whenever note changes,
  // but NEVER overwrite what the user is currently typing.
  useEffect(() => {
    if (editing.current) return
    setText(note || '')
  }, [note])

  function handleChange(e) {
    editing.current = true   // user started typing — block context overwrites
    setText(e.target.value)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    const result = await setOrderNote(text.trim())
    if (result && !result.ok) {
      setError(result.message || 'فشل حفظ الملاحظة')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      editing.current = false  // allow context to sync again after a successful save
    }
    setSaving(false)
  }

  return (
    <div className="cart-note" dir="rtl">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <p className="cart-note__label" style={{ margin: 0 }}>📝 ملاحظة الطلب</p>
        {saved && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#16a34a',
            background: '#dcfce7', borderRadius: 999, padding: '2px 10px',
          }}>
            ✓ تم الحفظ
          </span>
        )}
      </div>

      <textarea
        className="cart-note__textarea"
        placeholder="أضف أي تعليمات خاصة… مثال: التوصيل بعد الساعة 6 مساءً"
        value={text}
        onChange={handleChange}
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

      {/* Confirmed saved note — sourced from context (server truth), not from textarea draft */}
      {note && note.trim() && (
        <div className="cart-note__display">
          <span className="cart-note__display-tag">✓ ملاحظتك المحفوظة</span>
          <p className="cart-note__display-text">{note}</p>
        </div>
      )}
    </div>
  )
}
