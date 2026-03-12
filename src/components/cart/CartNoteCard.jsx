import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import "./CartNoteCard.css"

/**
 * CartNoteCard
 * Inline note editor — shows the note and lets the user edit it in-place.
 * Exposes `openEditor()` via ref so CartSummaryCard's "تعديل" button can trigger it.
 *
 * Props:
 *   note      — string   current note from CartContext (updates immediately)
 *   onSave    — async (note: string) => void
 */
const CartNoteCard = forwardRef(function CartNoteCard({ note = '', onSave }, ref) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(note)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const textareaRef           = useRef(null)
  const wrapperRef            = useRef(null)

  // Keep draft synced when note changes from context (optimistic or API response)
  useEffect(() => {
    if (!editing) setDraft(note)
  }, [note, editing])

  // Auto-focus textarea when editor opens
  useEffect(() => {
    if (editing) textareaRef.current?.focus()
  }, [editing])

  // Expose openEditor() to parent via ref
  useImperativeHandle(ref, () => ({
    openEditor() {
      openEditor()
    },
  }))

  function openEditor() {
    setDraft(note)
    setEditing(true)
    setSaved(false)
  }

  function cancelEdit() {
    setDraft(note)
    setEditing(false)
  }

  async function handleSave() {
    const trimmed = draft.trim()
    setSaving(true)
    try {
      await onSave(trimmed)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Escape') cancelEdit()
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave()
  }

  const hasNote = note && note.trim().length > 0

  return (
    <div className="cart-note-card" dir="rtl" ref={wrapperRef}>
      {/* ── Header ── */}
      <div className="cart-note-header">
        <div className="cart-note-title">
          <span className="cart-note-icon">📝</span>
          <span>ملاحظة الطلب</span>
          {saved && <span className="cart-note-saved-badge">✓ تم الحفظ</span>}
        </div>

        {!editing && (
          <button
            type="button"
            className="cart-note-edit-btn"
            onClick={openEditor}
            aria-label="تعديل الملاحظة"
          >
            {hasNote ? '✏️ تعديل' : '+ إضافة'}
          </button>
        )}
      </div>

      {/* ── Display mode ── */}
      {!editing && (
        hasNote ? (
          <p className="cart-note-text" onClick={openEditor} title="اضغط للتعديل">
            {note}
          </p>
        ) : (
          <p className="cart-note-empty" onClick={openEditor}>
            أضف تعليمات خاصة مثل: وقت التوصيل، مكان الاستلام…
          </p>
        )
      )}

      {/* ── Edit mode ── */}
      {editing && (
        <div className="cart-note-editor">
          <textarea
            ref={textareaRef}
            className="cart-note-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 300))}
            onKeyDown={handleKey}
            placeholder="مثال: التوصيل بعد الساعة 6 مساءً، الباب الخلفي…"
            dir="rtl"
            rows={3}
            maxLength={300}
            disabled={saving}
          />
          <div className="cart-note-editor-footer">
            <span className="cart-note-char-count">{draft.length}/300</span>
            <div className="cart-note-actions">
              <button
                type="button"
                className="cart-note-cancel-btn"
                onClick={cancelEdit}
                disabled={saving}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="cart-note-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <span className="cart-note-spinner" /> : '💾 حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default CartNoteCard
