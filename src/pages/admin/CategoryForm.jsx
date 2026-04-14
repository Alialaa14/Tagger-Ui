import React, { useEffect, useMemo, useState } from 'react'

const initialState = {
  name: '',
  description: '',
  image: null,
  preview: null,
}

function toInitialForm(mode, category) {
  if (mode === 'edit' && category) {
    return {
      name: category.name || '',
      description: category.description || '',
      image: null,
      preview: category.image?.url || null,
    }
  }

  return initialState
}

export default function CategoryForm({
  mode = 'create',
  category = null,
  onCreate,
  onUpdate,
  onCancel,
}) {
  const [form, setForm] = useState(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm(toInitialForm(mode, category))
  }, [mode, category])

  useEffect(() => {
    return () => {
      if (form.preview && String(form.preview).startsWith('blob:')) {
        URL.revokeObjectURL(form.preview)
      }
    }
  }, [form.preview])

  const canSubmit = useMemo(() => {
    if (mode === 'create') {
      return Boolean(form.name.trim() && form.description.trim() && form.image)
    }
    return Boolean(form.name.trim() && form.description.trim())
  }, [form.name, form.description, form.image, mode])

  const createCategory = async (formData) => {
    // Placeholder only: connect your API create request here.
    if (onCreate) await Promise.resolve(onCreate(formData))
    else console.log('createCategory(formData)', formData)
  }

  const updateCategory = async (formData) => {
    // Placeholder only: connect your API update request here.
    if (onUpdate) await Promise.resolve(onUpdate(formData))
    else console.log('updateCategory(formData)', formData)
  }

  const handleInput = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const nextPreview = URL.createObjectURL(file)

    setForm((prev) => {
      if (prev.preview && String(prev.preview).startsWith('blob:')) {
        URL.revokeObjectURL(prev.preview)
      }

      return {
        ...prev,
        image: file,
        preview: nextPreview,
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return

    const formData = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit') {
        await updateCategory(formData)
      } else {
        await createCategory(formData)
      }

      if (mode === 'create') {
        setForm(initialState)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <div className="space-y-6">
        <label className="admin-label">
          <span>??? ?????</span>
          <input
            type="text"
            className="admin-input"
            value={form.name}
            onChange={handleInput('name')}
            required
            placeholder="????: ??????????"
          />
        </label>

        <label className="admin-label">
          <span>??? ?????</span>
          <textarea
            className="admin-input"
            rows="4"
            maxLength={50}
            value={form.description}
            onChange={handleInput('description')}
            placeholder="??? ???? ?????"
          />
          <small className="admin-muted">
            {form.description.length}/50
          </small>
        </label>

        <label className="admin-label">
          <span>???? ?????</span>
          <input type="file" className="admin-input" accept="image/*" onChange={handleFileChange} />
      
          {form.preview ? (
            <div className="category-image-preview-wrap">
              <img src={form.preview} alt="?????? ?????" className="category-image-preview" />
            </div>
          ) : null}
        </label>
      </div>

      <div className="category-form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? '???? ?????...' : mode === 'edit' ? '????? ?????' : '????? ?????'}
        </button>

        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ?????
        </button>
      </div>
    </form>
  )
}

