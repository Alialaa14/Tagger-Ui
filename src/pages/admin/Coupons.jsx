import React, { useState } from 'react'

export default function Coupons() {
  const [form, setForm] = useState({
    code: '',
    expiryDate: '',
    discountValue: '',
  })

  function change(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function resetForm() {
    setForm({ code: '', expiryDate: '', discountValue: '' })
  }

  function submit(e) {
    e.preventDefault()
    console.log('create coupon', form)
    alert('تم إنشاء الكوبون (تجريبي)')
    resetForm()
  }

  return (
    <div>
      <div className="card admin-card">
        <div className="header">
          <div className="h-title">إنشاء كوبون جديد</div>
          <div className="h-sub">أدخل كود الكوبون وتاريخ الانتهاء وقيمة الخصم</div>
        </div>

        <form className="form" onSubmit={submit}>
          <div className="input">
            <label>Coupon Code</label>
            <input
              type="text"
              value={form.code}
              onChange={change('code')}
              placeholder="EXAMPLE10"
              required
            />
          </div>

          <div className="input">
            <label>Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate}
              onChange={change('expiryDate')}
              required
            />
          </div>

          <div className="input">
            <label>Discount Value</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.discountValue}
              onChange={change('discountValue')}
              placeholder="10"
              required
            />
          </div>

          <div className="row">
            <button type="submit" className="btn btn-primary">Save Coupon</button>
            <button type="reset" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
