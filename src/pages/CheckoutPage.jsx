import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './CheckoutPage.css'

/* ── Form field component ─────────────────────────────────────── */
function Field({ label, id, error, children }) {
  return (
    <label className="checkout-field" htmlFor={id}>
      <span className="checkout-field-label">{label}</span>
      {children}
      {error && <span className="checkout-field-error">{error}</span>}
    </label>
  )
}

/* ── Order summary row ────────────────────────────────────────── */
function SummaryRow({ label, value, isBold, isGreen, isSave }) {
  return (
    <div className={`checkout-sum-row${isBold ? ' checkout-sum-row-bold' : ''}${isGreen ? ' checkout-sum-row-green' : ''}${isSave ? ' checkout-sum-row-save' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/* ── Step indicator ───────────────────────────────────────────── */
function Steps({ current }) {
  const steps = ['السلة', 'التوصيل', 'تأكيد الطلب']
  return (
    <div className="checkout-steps" dir="rtl">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`checkout-step${i + 1 === current ? ' checkout-step-active' : ''}${i + 1 < current ? ' checkout-step-done' : ''}`}>
            <span className="checkout-step-dot">
              {i + 1 < current ? '✓' : i + 1}
            </span>
            <span className="checkout-step-label">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <span className="checkout-step-line" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    lineItems,
    totalQuantity,
    subtotal,
    totalDiscount,
    finalTotal,
    couponCode,
    orderNote,
    clear,
  } = useCart()

  const role = String(user?.role || user?.accountType || '').toLowerCase()
  const isCustomer = role === 'customer'

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: orderNote || '',
    paymentMethod: 'cash',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function change(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setErrors((err) => ({ ...err, [field]: '' }))
    }
  }

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'الاسم مطلوب'
    if (!form.phone.trim()) e.phone = 'رقم الهاتف مطلوب'
    else if (!/^[0-9+\s]{8,15}$/.test(form.phone.trim())) e.phone = 'رقم الهاتف غير صحيح'
    if (!form.address.trim()) e.address = 'العنوان مطلوب'
    if (!form.city.trim()) e.city = 'المدينة مطلوبة'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }

    setIsSubmitting(true)
    // 🔌 Wire your API order creation here:
    // await createOrder({ ...form, items: lineItems, total: finalTotal, coupon: couponCode })
    await new Promise((res) => setTimeout(res, 900)) // placeholder delay

    clear()
    setSubmitted(true)
    setIsSubmitting(false)
  }

  /* ── Submitted confirmation ── */
  if (submitted) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="container checkout-confirm-page" dir="rtl">
          <div className="checkout-confirm-card">
            <div className="checkout-confirm-icon">🎉</div>
            <h2>تم إرسال طلبك بنجاح!</h2>
            <p>سنتواصل معك قريباً لتأكيد الطلب وتحديد موعد التوصيل.</p>
            <div className="checkout-confirm-actions">
              <Link to="/" className="btn btn-primary checkout-confirm-btn">العودة للرئيسية</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Guard: not customer ── */
  if (!isCustomer) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="container checkout-guard" dir="rtl">
          <div className="checkout-confirm-card">
            <div className="checkout-confirm-icon">🔒</div>
            <h2>هذه الصفحة للعملاء فقط</h2>
            <p>يجب تسجيل الدخول كعميل لإتمام الطلب.</p>
            <Link to="/login" className="btn btn-primary">تسجيل الدخول</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* ── Guard: empty cart ── */
  if (lineItems.length === 0) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="container checkout-guard" dir="rtl">
          <div className="checkout-confirm-card">
            <div className="checkout-confirm-icon">🛒</div>
            <h2>السلة فارغة</h2>
            <p>أضف منتجات أولاً قبل إتمام الطلب.</p>
            <Link to="/" className="btn btn-primary">تصفح المنتجات</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="home-page">
      <Navbar />

      <main className="checkout-page container" dir="rtl">
        <header className="checkout-page-head">
          <p className="checkout-kicker">Checkout</p>
          <h1>إتمام الطلب</h1>
        </header>

        <Steps current={2} />

        <div className="checkout-layout">
          {/* ── Left: form ── */}
          <div className="checkout-form-col">
            {/* Delivery */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <span className="checkout-card-icon">📍</span>
                بيانات التوصيل
              </h2>

              <div className="checkout-form-grid">
                <Field label="الاسم الكامل" id="fullName" error={errors.fullName}>
                  <input
                    id="fullName"
                    className={`checkout-input${errors.fullName ? ' checkout-input-error' : ''}`}
                    value={form.fullName}
                    onChange={change('fullName')}
                    placeholder="مثال: أحمد محمد"
                    dir="rtl"
                  />
                </Field>

                <Field label="رقم الهاتف" id="phone" error={errors.phone}>
                  <input
                    id="phone"
                    className={`checkout-input${errors.phone ? ' checkout-input-error' : ''}`}
                    value={form.phone}
                    onChange={change('phone')}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    inputMode="tel"
                  />
                </Field>

                <Field label="العنوان بالتفصيل" id="address" error={errors.address}>
                  <input
                    id="address"
                    className={`checkout-input checkout-input-full${errors.address ? ' checkout-input-error' : ''}`}
                    value={form.address}
                    onChange={change('address')}
                    placeholder="الشارع، رقم البناية، الدور، الشقة"
                    dir="rtl"
                  />
                </Field>

                <Field label="المدينة / المنطقة" id="city" error={errors.city}>
                  <input
                    id="city"
                    className={`checkout-input${errors.city ? ' checkout-input-error' : ''}`}
                    value={form.city}
                    onChange={change('city')}
                    placeholder="مثال: القاهرة"
                    dir="rtl"
                  />
                </Field>

                <Field label="ملاحظات إضافية (اختياري)" id="notes">
                  <textarea
                    id="notes"
                    className="checkout-input checkout-input-full checkout-textarea"
                    rows={3}
                    value={form.notes}
                    onChange={change('notes')}
                    placeholder="أي تعليمات خاصة بالتوصيل…"
                    dir="rtl"
                  />
                </Field>
              </div>
            </div>

            {/* Payment method */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <span className="checkout-card-icon">💳</span>
                طريقة الدفع
              </h2>

              <div className="checkout-payment-options">
                {[
                  { value: 'cash', label: 'الدفع عند الاستلام', icon: '💵' },
                  { value: 'transfer', label: 'تحويل بنكي', icon: '🏦' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`checkout-payment-option${form.paymentMethod === opt.value ? ' checkout-payment-option-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={change('paymentMethod')}
                      className="checkout-payment-radio"
                    />
                    <span className="checkout-payment-icon">{opt.icon}</span>
                    <span className="checkout-payment-label">{opt.label}</span>
                    {form.paymentMethod === opt.value && (
                      <span className="checkout-payment-check">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: summary ── */}
          <div className="checkout-summary-col">
            <div className="checkout-card checkout-summary-card">
              <h2 className="checkout-card-title">
                <span className="checkout-card-icon">🧾</span>
                ملخص الطلب
              </h2>

              {/* Items */}
              <ul className="checkout-items-list">
                {lineItems.map((line) => (
                  <li key={line.item.productId} className="checkout-item-row">
                    <div className="checkout-item-info">
                      <span className="checkout-item-name line-clamp-2">
                        {line.product?.name || line.item.productId}
                      </span>
                      <span className="checkout-item-qty">× {line.item.quantity}</span>
                    </div>
                    <span className="checkout-item-total">
                      {line.lineTotal?.toFixed(2) ?? '—'} ج.م
                    </span>
                  </li>
                ))}
              </ul>

              <div className="checkout-sum-divider" />

              <SummaryRow label={`المجموع الفرعي (${totalQuantity} قطعة)`} value={`${subtotal?.toFixed(2)} ج.م`} />
              {totalDiscount > 0 && (
                <SummaryRow label="إجمالي الخصم" value={`-${totalDiscount?.toFixed(2)} ج.م`} isSave />
              )}
              {couponCode && (
                <div className="checkout-coupon-applied">
                  <span>🏷️ كوبون مطبّق</span>
                  <span className="checkout-coupon-code">{couponCode}</span>
                </div>
              )}

              <div className="checkout-sum-divider" />

              <SummaryRow
                label="الإجمالي النهائي"
                value={`${finalTotal?.toFixed(2)} ج.م`}
                isBold
                isGreen
              />

              <button
                className="checkout-submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="checkout-spinner" />
                ) : (
                  'تأكيد الطلب →'
                )}
              </button>

              <Link to="/cart" className="checkout-back-link">
                ← العودة إلى السلة
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
