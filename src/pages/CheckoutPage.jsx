import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import socket from '../socket'
import BackNavigator from '../components/common/BackNavigator'
import './CheckoutPage.css'
import "./CheckoutPage.extra.css"

/* -- Field wrapper --------------------------------------------- */
function Field({ label, id, error, children }) {
  return (
    <label className="checkout-field" htmlFor={id}>
      <span className="checkout-field-label">{label}</span>
      {children}
      {error && <span className="checkout-field-error">{error}</span>}
    </label>
  )
}

/* -- Summary row ----------------------------------------------- */
function SummaryRow({ label, value, isBold, isGreen, isSave }) {
  return (
    <div className={`checkout-sum-row${isBold ? ' checkout-sum-row-bold' : ''}${isGreen ? ' checkout-sum-row-green' : ''}${isSave ? ' checkout-sum-row-save' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

/* -- Step indicator -------------------------------------------- */
function Steps({ current }) {
  const steps = ['السلة', 'الشحن', 'تأكيد الطلب']
  return (
    <div className="checkout-steps" dir="rtl">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`checkout-step${i + 1 === current ? ' checkout-step-active' : ''}${i + 1 < current ? ' checkout-step-done' : ''}`}>
            <span className="checkout-step-dot">{i + 1 < current ? '✓' : i + 1}</span>
            <span className="checkout-step-label">{s}</span>
          </div>
          {i < steps.length - 1 && <span className="checkout-step-line" />}
        </React.Fragment>
      ))}
    </div>
  )
}

/* -- Payment option card --------------------------------------- */
function PaymentOption({ value, selected, icon, title, subtitle, onChange }) {
  return (
    <label className={`checkout-pay-card${selected ? ' checkout-pay-card-active' : ''}`}>
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="checkout-payment-radio"
      />
      <span className="checkout-pay-icon">{icon}</span>
      <div className="checkout-pay-text">
        <span className="checkout-pay-title">{title}</span>
        {subtitle && <span className="checkout-pay-subtitle">{subtitle}</span>}
      </div>
      <span className={`checkout-pay-dot${selected ? ' checkout-pay-dot-active' : ''}`} />
    </label>
  )
}

/* -------------------------------------------------------------- */

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
    couponDiscount,
    note,
    clear,
  } = useCart()

  const [form, setForm] = useState({
    username: '',
    shopName: '',
    phoneNumber: '',
    governorate: '',
    city: '',
    address: '',
    notes: '',
    paymentMethod: 'cash',
  })

  // Track which fields were manually changed so we can show the ↩ reset button
  const [edited, setEdited] = useState({})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill from user profile once available
  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      username: user.username || '',
      shopName: user.shopName || '',
      phoneNumber: user.phoneNumber || '',
      governorate: user.governorate || '',
      city: user.city || '',
      address: user.address || '',
      notes: note || '',
    }))
  }, [user, note])

  function change(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setEdited((ed) => ({ ...ed, [field]: true }))
      setErrors((err) => ({ ...err, [field]: '' }))
    }
  }

  // Revert a field to the original user profile value
  function resetField(field) {
    const original = {
      username: user?.username || '',
      shopName: user?.shopName || '',
      phoneNumber: user?.phoneNumber || '',
      governorate: user?.governorate || '',
      city: user?.city || '',
      address: user?.address || '',
    }
    setForm((f) => ({ ...f, [field]: original[field] ?? '' }))
    setEdited((ed) => ({ ...ed, [field]: false }))
    setErrors((err) => ({ ...err, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.username.trim()) e.username = 'الاسم مطلوب'
    if (!form.phoneNumber.trim()) e.phoneNumber = 'رقم الهاتف مطلوب'
    else if (!/^01[0-9]{9}$/.test(form.phoneNumber.trim())) e.phoneNumber = 'رقم الهاتف غير صحيح (01xxxxxxxxx)'
    if (!form.governorate.trim()) e.governorate = 'المحافظة مطلوبة'
    if (!form.city.trim()) e.city = 'المدينة مطلوبة'
    if (!form.address.trim()) e.address = 'العنوان مطلوب'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setIsSubmitting(true)
    // ← Wire your API order creation here:
    const orderPayload = {
      shopId: user?._id || user?.id,
      traderId: null,
      products: (lineItems || []).map((line) => ({
        productId: line?.item?.productId || line?.item?._id || line?.item?.id,
        quantity: Number(line?.item?.quantity) || 1,
        totalPrice: Number(line?.pricing?.finalTotal) || 0,
      })),
      isPaid: false,
      isAccepted: false,
      isRejected: false,
      isDelivered: false,
      isPacked: false,
      isCancelled: false,
      isReturned: false,
      totalPrice: Number(finalTotal) || 0,
      totalQuantity: Number(totalQuantity) || 0,
      note: note || '',
      address: form.address || '',
    }
    try {
      console.log(orderPayload)
      socket.emit('sendOrder', {
        order: orderPayload,
        user: {
          _id: user?._id || user?.id,
          username: user?.username,
          shopName: user?.shopName,
          phoneNumber: user?.phoneNumber
        }
      })
    } catch (error) {
      console.log(`Socket Error ${error.message}`)
    }
    clear()
    setSubmitted(true)
    setIsSubmitting(false)
  }

  /* -- Success screen ------------------------------------------ */
  if (submitted) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="container checkout-confirm-page" dir="rtl">
          <div className="checkout-confirm-card">
            <div className="checkout-confirm-icon">✅</div>
            <h2>تم تقديم طلبك بنجاح!</h2>
            <p>سيتواصل معك فريقنا قريباً لتأكيد الطلب وترتيب عملية التوصيل.</p>
            <div className="checkout-confirm-actions">
              <Link to="/" className="btn btn-primary checkout-confirm-btn">العودة للرئيسية</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* -- Empty cart guard ---------------------------------------- */
  if (lineItems.length === 0) {
    return (
      <div className="home-page">
        <Navbar />
        <main className="container checkout-guard" dir="rtl">
          <div className="checkout-confirm-card">
            <div className="checkout-confirm-icon">🛒</div>
            <h2>السلة فارغة</h2>
            <p>لا توجد منتجات في سلة التسوق الخاصة بك.</p>
            <Link to="/" className="btn btn-primary">تصفح المنتجات</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  /* -- Main page ----------------------------------------------- */
  return (
    <div className="home-page">
      <Navbar />

      <main className="checkout-page container" dir="rtl">
        <BackNavigator fallback="/cart" />
        <header className="checkout-page-head">
          <p className="checkout-kicker">Checkout</p>
          <h1>إتمام الطلب</h1>
        </header>

        <Steps current={2} />

        <div className="checkout-layout">

          {/* -- Left col: form ---------------------------------- */}
          <div className="checkout-form-col">

            {/* Delivery details */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <span className="checkout-card-icon">📦</span>
                بيانات التوصيل
              </h2>

              <div className="checkout-form-grid">

                {/* Name */}
                <Field label="الاسم" id="username" error={errors.username}>
                  <div className="checkout-input-wrap">
                    <input
                      id="username"
                      className={`checkout-input${errors.username ? ' checkout-input-error' : ''}`}
                      value={form.username}
                      onChange={change('username')}
                      placeholder="اسم المستلم"
                      dir="rtl"
                    />
                    {edited.username && (
                      <button type="button" className="checkout-reset-btn" onClick={() => resetField('username')} title="استعادة القيمة الأصلية">↩</button>
                    )}
                  </div>
                </Field>

                {/* Phone */}
                <Field label="رقم الهاتف" id="phoneNumber" error={errors.phoneNumber}>
                  <div className="checkout-input-wrap">
                    <input
                      id="phoneNumber"
                      className={`checkout-input${errors.phoneNumber ? ' checkout-input-error' : ''}`}
                      value={form.phoneNumber}
                      onChange={change('phoneNumber')}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      inputMode="tel"
                    />
                    {edited.phoneNumber && (
                      <button type="button" className="checkout-reset-btn" onClick={() => resetField('phoneNumber')} title="استعادة القيمة الأصلية">↩</button>
                    )}
                  </div>
                </Field>

                {/* Shop name – full width */}
                <Field label="اسم المحل" id="shopName">
                  <div className="checkout-input-wrap checkout-input-full">
                    <input
                      id="shopName"
                      className="checkout-input"
                      value={form.shopName}
                      onChange={change('shopName')}
                      placeholder="اسم محلك"
                      dir="rtl"
                    />
                    {edited.shopName && (
                      <button type="button" className="checkout-reset-btn" onClick={() => resetField('shopName')} title="استعادة القيمة الأصلية">↩</button>
                    )}
                  </div>
                </Field>

                {/* Governorate */}
                <Field label="المحافظة" id="governorate" error={errors.governorate}>
                  <div className="checkout-input-wrap">
                    <input
                      id="governorate"
                      className={`checkout-input${errors.governorate ? ' checkout-input-error' : ''}`}
                      value={form.governorate}
                      onChange={change('governorate')}
                      placeholder="مثال: القاهرة"
                      dir="rtl"
                    />
                    {edited.governorate && (
                      <button type="button" className="checkout-reset-btn" onClick={() => resetField('governorate')} title="استعادة القيمة الأصلية">↩</button>
                    )}
                  </div>
                </Field>

                {/* City */}
                <Field label="المدينة / الحي" id="city" error={errors.city}>
                  <div className="checkout-input-wrap">
                    <input
                      id="city"
                      className={`checkout-input${errors.city ? ' checkout-input-error' : ''}`}
                      value={form.city}
                      onChange={change('city')}
                      placeholder="مثال: مدينة نصر"
                      dir="rtl"
                    />
                    {edited.city && (
                      <button type="button" className="checkout-reset-btn" onClick={() => resetField('city')} title="استعادة القيمة الأصلية">↩</button>
                    )}
                  </div>
                </Field>

                {/* Address – full width */}
                <Field label="العنوان بالتفصيل" id="address" error={errors.address}>
                  <div className="checkout-input-wrap checkout-input-full">
                    <input
                      id="address"
                      className={`checkout-input${errors.address ? ' checkout-input-error' : ''}`}
                      value={form.address}
                      onChange={change('address')}
                      placeholder="الشارع ورقم المبنى والدور والشقة"
                      dir="rtl"
                    />
                    {edited.address && (
                      <button type="button" className="checkout-reset-btn" onClick={() => resetField('address')} title="استعادة القيمة الأصلية">↩</button>
                    )}
                  </div>
                </Field>

                {/* Extra notes – full width */}
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

              <p className="checkout-prefill-note">
                تم تعبئة البيانات تلقائياً من ملفك الشخصي — يمكنك تعديل أي حقل لهذا الطلب فقط دون تغيير بياناتك المحفوظة.
              </p>
            </div>

            {/* Payment method */}
            <div className="checkout-card">
              <h2 className="checkout-card-title">
                <span className="checkout-card-icon">💳</span>
                طريقة الدفع
              </h2>

              <div className="checkout-payment-options">
                <PaymentOption
                  value="cash"
                  selected={form.paymentMethod === 'cash'}
                  icon="💵"
                  title="الدفع عند الاستلام"
                  subtitle="ادفع نقداً عند وصول طلبك إليك"
                  onChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
                />
                <PaymentOption
                  value="wallet"
                  selected={form.paymentMethod === 'wallet'}
                  icon="📱"
                  title="المحفظة الإلكترونية"
                  subtitle="فودافون كاش — اتصالات كاش — أورنج كاش"
                  onChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}
                />
              </div>

              {form.paymentMethod === 'wallet' && (
                <div className="checkout-wallet-info">
                  <span className="checkout-wallet-info-icon">ℹ️</span>
                  <div>
                    <p className="checkout-wallet-info-title">تعليمات الدفع الإلكتروني</p>
                    <p className="checkout-wallet-info-body">
                      سيتم إرسال تفاصيل الدفع إليك عبر رسالة نصية بعد تأكيد طلبك.
                      يرجى إتمام الدفع خلال الوقت المحدد لضمان معالجة طلبك.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* -- Right col: order summary ------------------------- */}
          <div className="checkout-summary-col">
            <div className="checkout-card checkout-summary-card">
              <h2 className="checkout-card-title">
                <span className="checkout-card-icon">🧾</span>
                ملخص الطلب
              </h2>

              <ul className="checkout-items-list">
                {lineItems.map((line) => (
                  <li key={line.item.productId} className="checkout-item-row">
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">
                        {line.item?.name || line.product?.name || 'منتج'}
                      </span>
                      <span className="checkout-item-qty">× {line.item.quantity}</span>
                    </div>
                    <span className="checkout-item-total">
                      {(line.lineTotal ?? line.item.unitPrice * line.item.quantity)?.toFixed(2)} ج.م
                    </span>
                  </li>
                ))}
              </ul>

              <div className="checkout-sum-divider" />

              <SummaryRow
                label={`المجموع الفرعي (${totalQuantity} قطعة)`}
                value={`${subtotal?.toFixed(2)} ج.م`}
              />

              {totalDiscount > 0 && (
                <SummaryRow
                  label="خصم المنتجات"
                  value={`- ${totalDiscount?.toFixed(2)} ج.م`}
                  isSave
                />
              )}

              {couponCode && (
                <div className="checkout-coupon-applied">
                  <span>كود الخصم: <strong>{couponCode}</strong></span>
                  {couponDiscount > 0 && (
                    <span className="checkout-coupon-code">- {couponDiscount?.toFixed(2)} ج.م</span>
                  )}
                </div>
              )}

              {/* Cart note */}
              {note && note.trim() && (
                <div className="checkout-order-note">
                  <span className="checkout-order-note-icon">📝</span>
                  <span>{note}</span>
                </div>
              )}

              <div className="checkout-sum-divider" />

              <SummaryRow
                label="الإجمالي النهائي"
                value={`${finalTotal?.toFixed(2)} ج.م`}
                isBold
                isGreen
              />

              {/* Active payment method badge */}
              <div className="checkout-pay-badge">
                {form.paymentMethod === 'cash'
                  ? <><span>💵</span> الدفع عند الاستلام</>
                  : <><span>📱</span> المحفظة الإلكترونية</>}
              </div>

              <button
                className="checkout-submit-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="checkout-spinner" /> : 'تأكيد الطلب ✓'}
              </button>

              <Link to="/cart" className="checkout-back-link">→ العودة إلى السلة</Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
