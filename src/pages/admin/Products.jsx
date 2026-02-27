import React, { useState } from 'react'

export default function Products() {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', image: null, discounts: [] })
  const [preview, setPreview] = useState(null)

  function change(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function onFile(e) {
    const f = e.target.files[0]
    setForm(prev => ({ ...prev, image: f }))
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview(null)
  }

  function addDiscount() {
    setForm(f => ({ ...f, discounts: [...f.discounts, { quantity: '', discount: '' }] }))
  }

  function updateDiscount(idx, field) {
    return e => {
      setForm(f => {
        const ds = [...f.discounts]
        ds[idx] = { ...ds[idx], [field]: e.target.value }
        return { ...f, discounts: ds }
      })
    }
  }

  function removeDiscount(idx) {
    setForm(f => ({ ...f, discounts: f.discounts.filter((_, i) => i !== idx) }))
  }

  function submit(e) {
    e.preventDefault()
    console.log('create product', form)
    alert('تم إنشاء المنتج (تجريبي)')
    setForm({ name: '', description: '', price: '', category: '', image: null, discounts: [] })
    setPreview(null)
  }

  return (
    <div>
      <div className="card admin-card">
        <div className="header">
          <div className="h-title">إنشاء منتج جديد</div>
          <div className="h-sub">أضف بيانات المنتج والسعر والخصومات حسب الكمية</div>
        </div>

        <form className="form" onSubmit={submit}>
          <div className="row">
            <div className="input" style={{ flex: 1 }}>
              <label>اسم المنتج</label>
              <input type="text" value={form.name} onChange={change('name')} placeholder="مثال: هاتف ذكي" />
            </div>
            <div className="input" style={{ flex: 1 }}>
              <label>الفئة</label>
              <input type="text" value={form.category} onChange={change('category')} placeholder="مثال: إلكترونيات" />
            </div>
          </div>

          <div className="input">
            <label>الوصف</label>
            <textarea rows="3" value={form.description} onChange={change('description')} placeholder="وصف المنتج" />
          </div>

          <div className="row">
            <div className="input" style={{ flex: 1 }}>
              <label>السعر</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={change('price')} placeholder="مثال: 1200" />
            </div>
            <div className="input" style={{ flex: 1 }}>
              <label>صورة المنتج</label>
              <div className="file-input-wrapper">
                <input id="product-image" type="file" accept="image/*" onChange={onFile} />
                <label htmlFor="product-image" className="file-btn">اختر صورة</label>
                <button type="button" className="file-ghost" onClick={() => document.getElementById('product-image').click()}>استعراض</button>
                <div className="file-name">{form.image ? form.image.name : 'لم يتم اختيار ملف'}</div>
              </div>
              {preview && <img src={preview} alt="preview" style={{ width: 120, marginTop: 10, borderRadius: 8 }} />}
            </div>
          </div>

          <div className="discounts-block">
            <label className="discounts-title">الخصومات حسب الكمية</label>
            {form.discounts.length === 0 && <div className="small">يمكنك إضافة خصم حسب الكمية (discounts: [{`{ quantity, discount }`}])</div>}
            <div className="discounts-list">
              {form.discounts.map((d, idx) => (
                <div key={idx} className="discount-row">
                  <input type="number" min="1" placeholder="الكمية" value={d.quantity} onChange={updateDiscount(idx, 'quantity')} />
                  <input type="number" min="0" max="100" placeholder="الخصم %" value={d.discount} onChange={updateDiscount(idx, 'discount')} />
                  <button type="button" className="btn btn-ghost" onClick={() => removeDiscount(idx)}>حذف</button>
                </div>
              ))}

              <div className="discount-actions">
                <button type="button" className="btn btn-ghost" onClick={addDiscount}>إضافة خصم</button>
              </div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button type="submit" className="btn btn-primary">حفظ المنتج</button>
            <button type="reset" className="btn btn-ghost" onClick={() => { setForm({ name: '', description: '', price: '', category: '', image: null, discounts: [] }); setPreview(null) }}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}
