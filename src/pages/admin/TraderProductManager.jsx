import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from "../../utils/toast"
import { fetchTraderUsers } from '../../controllers/admin/tradersController'
import * as traderProductsApi from '../../controllers/admin/traderProductsController'
import CategoryFormModal from '../../components/admin/CategoryFormModal'
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal'

export default function TraderProductManager() {
  const [traders, setTraders] = useState([])
  const [selectedTraderId, setSelectedTraderId] = useState('')
  const [products, setProducts] = useState([])
  const [loadingTraders, setLoadingTraders] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  
  // Modals state
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [pending, setPending] = useState(false)

  // Current trader context
  const activeTrader = traders.find(t => t._id === selectedTraderId)

  useEffect(() => {
    const getTraders = async () => {
      setLoadingTraders(true)
      try {
        const users = await fetchTraderUsers()
        setTraders(users)
      } catch (err) {
        toast("فشل تحميل قائمة التجار", "error")
      } finally {
        setLoadingTraders(false)
      }
    }
    getTraders()
  }, [])

  useEffect(() => {
    if (!selectedTraderId) {
      setProducts([])
      return
    }
    
    const getProducts = async () => {
      setLoadingProducts(true)
      setProducts([]) // Reset immediately to avoid showing previous results
      try {
        const prods = await traderProductsApi.fetchProductsByTraderId(selectedTraderId)
        setProducts(prods || [])
      } catch (err) {
        // If 404, it might just mean the trader has no products yet
        if (err.response?.status !== 404) {
          toast("فشل تحميل منتجات التاجر", "error")
        }
        setProducts([]) 
      } finally {
        setLoadingProducts(false)
      }
    }
    getProducts()
  }, [selectedTraderId])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editItem) return
    
    setPending(true)
    try {
      await traderProductsApi.updateTraderProduct(editItem._id, {
        price: Number(editItem.price),
        quantity: editItem.quantity ? Number(editItem.quantity) : undefined
      })
      toast("تم تحديث المنتج بنجاح", "success")
      setProducts(prev => prev.map(p => p._id === editItem._id ? { ...p, price: editItem.price, quantity: editItem.quantity } : p))
      setEditItem(null)
    } catch (err) {
      toast("فشل التحديث", "error")
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setPending(true)
    try {
      await traderProductsApi.deleteTraderProduct(deleteItem._id)
      toast("تم حذف المنتج من متجر التاجر", "success")
      setProducts(prev => prev.filter(p => p._id !== deleteItem._id))
      setDeleteItem(null)
    } catch (err) {
      toast("فشل الحذف", "error")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="admin-stack" dir="rtl">
      {/* Header Card */}
      <div className="admin-card">
        <div className="admin-section-head">
          <div>
            <p className="admin-kicker">Trader Management</p>
            <h2>إدارة منتجات التجار</h2>
            <p className="admin-muted">عرض وتعديل المنتجات المعروضة في متاجر التجار المختلفة.</p>
          </div>
        </div>

        <div className="admin-grid-2" style={{ marginTop: '20px' }}>
          <div className="admin-label">
            <span>اختر التاجر للمعاينة</span>
            <select 
              className="admin-input" 
              value={selectedTraderId} 
              onChange={(e) => setSelectedTraderId(e.target.value)}
              disabled={loadingTraders}
            >
              <option value="">-- اختر تاجراً من القائمة --</option>
              {traders.map(t => (
                <option key={t._id} value={t._id}>{t.shopName || t.username} ({t.city || 'بدون مدينة'})</option>
              ))}
            </select>
          </div>
          
          {activeTrader && (
            <div className="admin-kpi" style={{ borderColor: 'var(--g500)', background: 'var(--g50)' }}>
              <span className="admin-kpi-label">معلومات المتجر</span>
              <div className="admin-kpi-value">{activeTrader.shopName || "بدون اسم متجر"}</div>
              <p className="admin-muted" style={{ fontSize: '11px' }}>{activeTrader.city} - {activeTrader.governorate}</p>
            </div>
          )}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="admin-card">
        <div className="admin-section-head" style={{ marginBottom: '14px' }}>
          <h3>قائمة المنتجات المعروضة</h3>
          {selectedTraderId && !loadingProducts && (
            <div className="discount-pill">{products.length} منتجات</div>
          )}
        </div>

        <div className="product-table-wrap">
          {loadingProducts ? (
            <div className="admin-notif-list" style={{ padding: '20px' }}>
              {[1, 2, 3].map(n => <div key={n} className="admin-notif-item" />)}
            </div>
          ) : selectedTraderId && products.length > 0 ? (
            <table className="product-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'right' }}>المنتج</th>
                  <th style={{ textAlign: 'right' }}>الفئة</th>
                  <th style={{ textAlign: 'right' }}>سعر المنصة</th>
                  <th style={{ textAlign: 'right' }}>سعر التاجر</th>
                  <th style={{ textAlign: 'right' }}>المخزون</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map(item => {
                  const p = item.productId || {}
                  const img = (typeof p.image === 'string' ? p.image : p.image?.url) || 'https://placehold.co/50x50?text=No+Image'
                  return (
                    <tr key={item._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={img} alt="" className="product-thumb" />
                          <div>
                            <div style={{ fontWeight: '800', color: '#0f172a' }}>{p.name || 'منتج غير معروف'}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>#{item._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="discount-pill" style={{ background: '#fffbeb', color: '#b45309' }}>{p.category?.name || '—'}</span></td>
                      <td>{p.price?.toLocaleString()} ج.م</td>
                      <td style={{ fontWeight: '900', color: 'var(--g700)' }}>{item.price?.toLocaleString()} <span>ج.م</span></td>
                      <td>
                         {item.quantity !== undefined && item.quantity !== null ? (
                           <span style={{ fontWeight: '700' }}>{item.quantity} قطعة</span>
                         ) : <span className="admin-muted">إفتراضي</span>}
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button className="admin-btn admin-btn-ghost btn-sm" onClick={() => setEditItem({ ...item })}>⚙️ تعديل</button>
                          <button className="admin-btn admin-btn-danger btn-sm" onClick={() => setDeleteItem(item)}>🗑️ حذف</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : selectedTraderId ? (
            <div className="admin-notif-empty">لا توجد منتجات مضافة لمتجر هذا التاجر حالياً.</div>
          ) : (
            <div className="admin-notif-empty">يرجى اختيار تاجر من الأعلى لعرض بياناته.</div>
          )}
        </div>
      </div>

      {/* Edit Modal (Admin Override) */}
      {editItem && (
        <CategoryFormModal 
          isOpen={true} 
          title="تعديل بيانات المنتج للتاجر" 
          onClose={() => setEditItem(null)}
        >
          <form className="admin-stack" onSubmit={handleUpdate}>
            <div className="admin-label">
              <span>اسم المنتج (للقراءة فقط)</span>
              <input type="text" className="admin-input" value={editItem.productId?.name || ''} disabled style={{ opacity: 0.6 }} />
            </div>

            <div className="product-form-grid" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '12px' }}>
              <div className="admin-label">
                <span>سعر البيع المقترح (ج.م)</span>
                <input 
                  type="number" 
                  className="admin-input" 
                  value={editItem.price} 
                  onChange={e => setEditItem({...editItem, price: e.target.value})}
                  required
                />
              </div>
              <div className="admin-label">
                <span>الكمية المتوفرة</span>
                <input 
                  type="number" 
                  className="admin-input" 
                  value={editItem.quantity || ''} 
                  onChange={e => setEditItem({...editItem, quantity: e.target.value})}
                  placeholder="اتركه فارغاً للافتراضي"
                />
              </div>
            </div>

            <div className="product-form-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={pending} style={{ flex: 1 }}>
                {pending ? "جاري الحفظ..." : "تطبيق وتحديث"}
              </button>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setEditItem(null)}>إلغاء</button>
            </div>
          </form>
        </CategoryFormModal>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal 
        isOpen={Boolean(deleteItem)}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        pending={pending}
      />
    </section>
  )
}
