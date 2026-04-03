import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackNavigator from '../components/common/BackNavigator'
import { Link } from 'react-router-dom'
import { toast } from '../utils/toast'
import axios from 'axios'
import './trader-my-products.css'

// ── Edit Modal Component ──────────────────────────────────────────────────────
function EditProductModal({ product, onClose, onSave }) {
  const [price, setPrice] = useState(product.price || '')
  const [quantity, setQuantity] = useState(product.quantity || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!price || isNaN(price)) {
      toast("يرجى إدخال سعر صحيح", "error")
      return
    }

    setLoading(true)
    try {
      await onSave(product._id, { 
        price: Number(price), 
        quantity: quantity !== '' ? Number(quantity) : undefined 
      })
      onClose()
    } catch (err) {
      // toast is handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tmp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tmp-modal" dir="rtl">
        <div className="tmp-modal-head">
          <h2 className="tmp-modal-title">تعديل المنتج</h2>
          <button className="tmp-modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="tmp-modal-body">
          <div className="tmp-form-group">
            <label className="tmp-label">سعر البيع الخاص بك (ج.م)</label>
            <input 
              type="number" 
              className="tmp-input" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="أدخل السعر الجديد..."
              required
            />
          </div>

          <div className="tmp-form-group">
            <label className="tmp-label">الكمية المتاحة</label>
            <input 
              type="number" 
              className="tmp-input" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              placeholder="أدخل الكمية..."
            />
          </div>

          <div className="tmp-modal-footer">
            <button type="submit" className="tmp-btn-save" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
            <button type="button" className="tmp-btn-cancel" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function TraderMyProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  
  const fetchMyProducts = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:3000/api/v1/trader-products/my', {
        withCredentials: true
      });
      // Handle different response structures
      const data = res.data?.data?.products || res.data?.products || res.data?.data || [];
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل في تحميل منتجاتك');
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProducts()
  }, [])

  const handleUpdate = async (id, payload) => {
    try {
      await axios.patch(`http://localhost:3000/api/v1/trader-products/${id}`, payload, {
        withCredentials: true
      });
      toast("تم تحديث المنتج بنجاح", "success")
      fetchMyProducts() // Refresh list
    } catch (err) {
      toast(err.response?.data?.message || err.message || "فشل التحديث", "error")
      throw err
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج من متجرك؟")) return

    try {
      await axios.delete(`http://localhost:3000/api/v1/trader-products/${id}`, {
        withCredentials: true
      });
      toast("تم حذف المنتج من متجرك", "success")
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      toast(err.response?.data?.message || err.message || "فشل الحذف", "error")
    }
  }

  return (
    <div className="tmp-page" dir="rtl">
      <Navbar />

      <main className="tmp-main container section">
        <BackNavigator fallback="/profile" />

        <header className="tmp-header">
          <p className="tmp-kicker">Manage Listings</p>
          <h1 className="tmp-title">منتجاتي المعروضة</h1>
        </header>

        {/* Toolbar with Stats */}
        <div className="tmp-toolbar">
          <div className="tmp-stats">
            <div className="tmp-stat-item">
              <span className="tmp-stat-label">إجمالي المنتجات</span>
              <span className="tmp-stat-value">{products.length}</span>
            </div>
          </div>
          <Link to="/catalog" className="tmp-btn" style={{ background: 'var(--amber-600)', color: '#fff', padding: '0 24px', width: 'auto', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)' }}>
            + إضافة منتجات أخرى
          </Link>
        </div>

        {error && (
          <div className="tmp-empty" style={{ borderColor: 'var(--red-200)', background: 'var(--red-50)' }}>
            <h3 style={{ color: 'var(--red-600)' }}>خطأ</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="tmp-grid">
            {[1, 2, 3].map(n => (
              <div key={n} className="tmp-card shimmer" style={{ opacity: 0.5 }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="tmp-grid">
            {products.map(item => {
              const product = item.productId || {}
              const productImg = (typeof product.image === 'string' ? product.image : product.image?.url) || 'https://placehold.co/400x400?text=No+Image';
              
              return (
                <div key={item._id} className="tmp-card">
                  <div className="tmp-card-img-wrap">
                    <img src={productImg} alt={product.name} className="tmp-card-img" loading="lazy" />
                  </div>

                  <div className="tmp-card-body">
                    <h3 className="tmp-card-title">{product.name || "منتج غير معروف"}</h3>
                    <span className="tmp-card-cat">{product.category?.name || "بدون تصنيف"}</span>
                    
                    <div className="tmp-card-details">
                      <div className="tmp-detail-row">
                        <span className="tmp-detail-label">سعر البيع:</span>
                        <span className="tmp-detail-value tmp-price-tag">{item.price?.toLocaleString()} ج.م</span>
                      </div>
                      <div className="tmp-detail-row">
                        <span className="tmp-detail-label">الكمية:</span>
                        <span className="tmp-detail-value">{item.quantity ?? "—"}</span>
                      </div>
                    </div>

                    <div className="tmp-card-actions">
                      <button className="tmp-btn tmp-btn--edit" onClick={() => setEditProduct(item)}>
                        ⚙️ تعديل
                      </button>
                      <button className="tmp-btn tmp-btn--delete" onClick={() => handleDelete(item._id)}>
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="tmp-empty">
            <span className="tmp-empty-icon">📦</span>
            <h3>لا توجد منتجات معروضة</h3>
            <p>ابدأ بإضافة منتجات من الكتالوج لعرضها في متجرك.</p>
            <Link to="/catalog" className="tmp-empty-btn" style={{ background: 'var(--green-600)', padding: '12px 32px', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}>
              استعراض كتالوج المنصة
            </Link>
          </div>
        )}
      </main>

      {editProduct && (
        <EditProductModal 
          product={editProduct} 
          onClose={() => setEditProduct(null)} 
          onSave={handleUpdate}
        />
      )}

      <Footer />
    </div>
  )
}
