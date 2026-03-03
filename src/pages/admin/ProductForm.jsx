import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addProductDiscountRow,
  removeProductDiscountRow,
  setProductFormField,
  setProductFormImage,
  setProductSubmitting,
  updateProductDiscountRow,
} from '../../store/productAdminSlice'

function buildSubmitPayload(formState, mode, product) {
  return {
    ...(mode === 'edit' && product?._id ? { _id: product._id } : {}),
    name: formState.name.trim(),
    description: formState.description.trim(),
    price: Number(formState.price),
    category: formState.category,
    discount: formState.discounts
      .filter((item) => item.quantity !== '' && item.discountValue !== '')
      .map((item) => ({
        quantity: Number(item.quantity),
        discountValue: Number(item.discountValue),
      })),
    image: formState.image,
    imageUrl: formState.image ? URL.createObjectURL(formState.image) : '',
  }
}

export default function ProductForm({
  mode = 'create',
  product = null,
  categories = [],
  onSubmit,
  onCancel,
}) {
  const dispatch = useDispatch()
  const { form, isSubmitting } = useSelector((state) => state.productAdmin)

  const canSubmit = useMemo(() => {
    return Boolean(form.name && form.description && form.price && form.category)
  }, [form])

  useEffect(() => {
    return () => {
      if (form.previewUrl && form.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(form.previewUrl)
      }
    }
  }, [form.previewUrl])

  const createProduct = async (formData) => {
    // Placeholder only: connect your API request here.
    console.log('createProduct(formData)', formData)
  }

  const updateProduct = async (formData) => {
    // Placeholder only: connect your API request here.
    console.log('updateProduct(formData)', formData)
  }

  const handleFieldChange = (field) => (event) => {
    dispatch(setProductFormField({ field, value: event.target.value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null

    if (form.previewUrl && form.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(form.previewUrl)
    }

    const previewUrl = file ? URL.createObjectURL(file) : product?.image?.url || ''
    dispatch(setProductFormImage({ file, previewUrl }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return

    const payload = buildSubmitPayload(form, mode, product)

    dispatch(setProductSubmitting(true))
    try {
      if (onSubmit) {
        await Promise.resolve(onSubmit(payload))
      } else if (mode === 'edit') {
        await updateProduct(payload)
      } else {
        await createProduct(payload)
      }
    } finally {
      dispatch(setProductSubmitting(false))
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form-grid">
        <label className="admin-label">
          <span>اسم المنتج</span>
          <input
            type="text"
            className="admin-input"
            value={form.name}
            onChange={handleFieldChange('name')}
            placeholder="مثال: سماعات بلوتوث"
          />
        </label>

        <label className="admin-label">
          <span>السعر</span>
          <input
            type="number"
            className="admin-input"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleFieldChange('price')}
            placeholder="0"
          />
        </label>
      </div>

      <label className="admin-label">
        <span>الوصف</span>
        <textarea
          rows="4"
          className="admin-input"
          value={form.description}
          onChange={handleFieldChange('description')}
          placeholder="أدخل وصفًا واضحًا للمنتج"
        />
      </label>

      <label className="admin-label">
        <span>الفئة</span>
        <select className="admin-input" value={form.category} onChange={handleFieldChange('category')}>
          <option value="">اختر الفئة</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-label">
        <span>الخصومات حسب الكمية</span>

        <div className="discount-list">
          {form.discounts.map((row, index) => (
            <div key={`${index}-${mode}`} className="discount-row">
              <input
                type="number"
                min="1"
                className="admin-input"
                placeholder="Quantity"
                value={row.quantity}
                onChange={(event) =>
                  dispatch(updateProductDiscountRow({ index, field: 'quantity', value: event.target.value }))
                }
              />
              <input
                type="number"
                min="0"
                className="admin-input"
                placeholder="Discount Value"
                value={row.discountValue}
                onChange={(event) =>
                  dispatch(updateProductDiscountRow({ index, field: 'discountValue', value: event.target.value }))
                }
              />
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => dispatch(removeProductDiscountRow(index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => dispatch(addProductDiscountRow())}>
          + إضافة خصم
        </button>
      </div>

      <label className="admin-label">
        <span>صورة المنتج</span>
        <input type="file" accept="image/*" className="admin-input" onChange={handleImageChange} />
        {form.previewUrl ? <img src={form.previewUrl} alt="معاينة المنتج" className="product-preview" /> : null}
      </label>

      <div className="product-form-actions">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={!canSubmit || isSubmitting}>
          {mode === 'edit' ? 'تحديث المنتج' : 'إنشاء المنتج'}
        </button>
        {onCancel ? (
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            إلغاء
          </button>
        ) : null}
      </div>
    </form>
  )
}
