import React, { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Cart(){
  const { open, items, totals, toggle, close, increment, decrement, remove, note, setNote, applyCoupon, coupon } = useCart()
  const [code, setCode] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const panelRef = useRef(null)
  const toggleRef = useRef(null)

  // close on Escape for accessibility
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.key === 'Escape' && open) close()
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[open, close])

  useEffect(() => {
    const onHoverOutside = (e) => {
      if (!open) return
      const panel = panelRef.current
      const toggleBtn = toggleRef.current
      if (!panel) return
      if (panel.contains(e.target)) return
      if (toggleBtn && toggleBtn.contains(e.target)) return
      close()
    }
    document.addEventListener('mouseover', onHoverOutside)
    return () => document.removeEventListener('mouseover', onHoverOutside)
  }, [open, close])

  const handleApply = ()=>{
    const res = applyCoupon(code)
    if(!res.ok){
      alert('كود غير صالح')
    } else {
      setCouponOpen(false)
    }
  }

  const totalQty = totals?.totalQuantity || items.reduce((s,i)=>s+i.quantity,0)
  const navigate = useNavigate()

  return (
    <>
      {/* Floating cart button */}
      <button ref={toggleRef} className="cart-toggle-btn" aria-label="Open cart" onClick={toggle} aria-expanded={open}>
        سلة
        <span className="cart-badge">{totalQty}</span>
      </button>

      <div className={open? 'cart-overlay active':'cart-overlay'} onClick={close} />

      <aside ref={panelRef} className={`cart-panel modal ${open ? 'open' : 'closed'}${collapsed ? ' collapsed' : ''}`} aria-hidden={!open} role="dialog" aria-label="Shopping cart" onClick={(e)=>e.stopPropagation()}>
        <header className="cart-header" style={{justifyContent:'space-between'}}>
          {!collapsed && <h3>سلة المشتريات</h3>}
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="cart-collapse" aria-label="Collapse cart" onClick={()=>setCollapsed(c=>!c)}>
              {collapsed ? '»' : '«'}
            </button>
            {!collapsed && <button className="cart-close" aria-label="Close cart" onClick={toggle}>×</button>}
          </div>
        </header>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-illustration">🛒</div>
              <div className="cart-empty-title">سلة الشراء فارغة</div>
              <div className="cart-empty-sub">لا توجد منتجات بعد — ابدأ بالتسوق لإضافة عناصر إلى السلة.</div>
              <div style={{marginTop:14}}>
                <button className="btn btn-primary" onClick={()=>{ navigate('/'); close() }}>ابدأ التسوق</button>
              </div>
            </div>
          ) : (
          items.map(i=> (
            <div key={i.product._id || i.product.name} className="cart-item">
              <div className="cart-media" style={{backgroundImage:`url(${i.product.image?.url || i.product.image || ''})`}} />
              <div className="cart-info">
                <div className="cart-name">{i.product.name}</div>
                <div className="cart-price">{i.product.price ? `$${(i.product.price).toFixed(2)}` : ''}</div>
                <div className="cart-qty">
                  <button className="btn btn-ghost" onClick={()=>decrement(i.product._id || i.product.name)}>-</button>
                  <span>{i.quantity}</span>
                  <button className="btn btn-ghost" onClick={()=>increment(i.product._id || i.product.name)}>+</button>
                </div>
              </div>
            </div>
          )))}

        </div>

        <footer className="cart-footer">
          <div className="cart-footer-left">
            <div className="cart-meta-small">{totalQty} عنصر</div>
            <div className="cart-meta-small">الإجمالي: ${ (totals?.totalPrice || 0).toFixed(2)}</div>
            {coupon && <div className="cart-meta-small">كوبون: {coupon.code} -${coupon.value}</div>}
            <div className="cart-meta-small">المبلغ النهائي: ${((totals?.finalPrice)|| (totals?.totalPrice)||0).toFixed(2)}</div>
          </div>
          <div className="cart-footer-actions">
            <button className="btn btn-ghost" onClick={()=>setCouponOpen(s=>!s)}>الكوبون</button>
            <button className="btn btn-ghost" onClick={()=>setNoteOpen(s=>!s)}>اضف ملاحظة</button>
            <button className="btn btn-primary">انتقل للسداد</button>
          </div>
        </footer>

        <div className={couponOpen ? 'cart-coupon-footer open' : 'cart-coupon-footer'}>
          <div className="coupon-inner">
            <input placeholder="رمز الكوبون" value={code} onChange={e=>setCode(e.target.value)} />
            <button className="btn btn-primary" onClick={handleApply}>تطبيق</button>
            <button className="btn btn-ghost" onClick={()=>{ setCouponOpen(false); setCode('') }}>إلغاء</button>
          </div>
        </div>

        <div className={noteOpen ? 'cart-note-footer open' : 'cart-note-footer'}>
          <div className="note-inner">
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="أدخل ملاحظة للطلب" />
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={()=>{ setNoteOpen(false) }}>إلغاء</button>
              <button className="btn btn-primary" onClick={()=>{ setNoteOpen(false) }}>حفظ</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
