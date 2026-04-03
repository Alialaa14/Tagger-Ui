import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackNavigator from '../components/common/BackNavigator';
import { toast } from '../utils/toast';
import { useAuth } from '../context/AuthContext';
import * as traderApi from '../controllers/traderProductController';
import * as invApi from '../controllers/inventoryController';
import './catalog.css';

// ── Search Icon Component ──────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="tc-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// ── Single Product Card ────────────────────────────────────────────────────────
function CatalogCard({ product, role, linkedData, onRefresh }) {
  const navigate = useNavigate();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isUpdating = !!linkedData;
  const isUser = role === 'user';
  const isTrader = role === 'trader';

  // Sync state with linked data (trader listing or inventory item)
  useEffect(() => {
    if (linkedData) {
      setPrice(linkedData.price || '');
      setQuantity(linkedData.quantity || '');
    } else {
      setPrice('');
      setQuantity('');
    }
  }, [linkedData]);

  const basePrice = product.price || 0;

  const handleSave = async () => {
    if (!price || isNaN(price)) {
      toast(isUser ? "يرجى إدخال سعر التتبع الخاص بك." : "يرجى إدخال سعر بيع صحيح.", "error");
      return;
    }

    setLoading(true);
    try {
      if (isTrader) {
        const payload = {
          productId: product._id,
          price: Number(price),
          quantity: quantity !== '' ? Number(quantity) : undefined
        };
        if (isUpdating) {
          await traderApi.updateListedProduct(linkedData._id, payload);
          toast(`تم تحديث ${product.name} في متجرك بنجاح`, "success");
        } else {
          await traderApi.addProductToStore(payload);
          toast(`تم إرسال ${product.name} لمتجرك بنجاح`, "success");
        }
      } else if (isUser) {
        // User adds to inventory
        if (isUpdating) {
          await invApi.updateInventory(linkedData._id, {
            price: Number(price),
            quantity: quantity !== '' ? Number(quantity) : undefined
          });
          toast(`تم تحديث بيانات ${product.name} في مخزنك`, "success");
        } else {
          await invApi.createPlatformInventory({
            productId: product._id,
            price: Number(price),
            quantity: quantity !== '' ? Number(quantity) : 0,
            lowStockThreshold: 10 // Default
          });
          toast(`تم إضافة ${product.name} لمخزنك بنجاح`, "success");
        }
      }
      
      setIsSaved(true);
      if (onRefresh) onRefresh();
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      toast(err.response?.data?.message || err.message || "حدث خطأ أثناء العملية", "error");
    } finally {
      setLoading(false);
    }
  };

  const productImg = (typeof product.image === 'string' ? product.image : product.image?.url) || 'https://placehold.co/400x400?text=No+Image';

  return (
    <div className={`tc-card ${isUpdating ? 'tc-card--listed' : ''}`}>
      <div className="tc-card-img-wrap">
        {product.category?.name && <span className="tc-card-category">{product.category.name}</span>}
        {isUpdating && <span className="tc-card-badge">{isTrader ? 'منتج مضاف ✅' : 'في المخزن ✅'}</span>}
        <img src={productImg} alt={product.name} className="tc-card-img" loading="lazy" />
      </div>

      <div className="tc-card-body">
        <h3 className="tc-card-title">{product.name}</h3>

        <div className="tc-card-prices" style={{ marginBottom: isUser && isUpdating ? '8px' : '16px' }}>
          <div className="tc-price-row">
            <span className="tc-price-label">سعر المنصة: </span>
            <span className="tc-base-price">{basePrice.toLocaleString()} <span>ج.م</span></span>
          </div>
          {isUser && isUpdating && (
            <div className="tc-income-badge">
              إجمالي القيمة: {(price * (quantity || 0)).toLocaleString()} ج.م
            </div>
          )}
        </div>

        <div className="tc-input-group" style={{ marginBottom: '10px' }}>
          <label className="tc-label">{isTrader ? 'سعر البيع الخاص بك' : 'سعر التكلفة/التتبع'}</label>
          <div className="tc-input-wrapper">
            <span className="tc-currency">ج.م</span>
            <input 
              type="number" 
              className="tc-input" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              step="10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="tc-input-group">
          <label className="tc-label">{isTrader ? 'الكمية المتاحة (إختياري)' : 'الكمية الحالية'}</label>
          <div className="tc-input-wrapper" style={{ paddingRight: isTrader ? '12px' : '0' }}>
            <input 
              type="number" 
              className="tc-input" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              min="0"
              placeholder={isTrader ? "إختياري" : "0"}
            />
          </div>
        </div>

        <button 
          type="button" 
          className={`tc-btn ${isSaved ? 'tc-btn--saved' : isUpdating ? 'tc-btn--update' : ''}`} 
          onClick={handleSave}
          disabled={loading}
          style={{ marginTop: '16px' }}
        >
          {loading ? (
             <span className="shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
          ) : isSaved ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              تم الحفظ
            </>
          ) : isUpdating ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              تحديث المعلومات
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              {isTrader ? 'إضافة لمتجري' : 'إضافة للمخزن'}
            </>
          )}
        </button>

        {isUser && (
          <button 
            type="button" 
            className="tc-btn tc-btn--ghost" 
            style={{ marginTop: '12px' }}
            onClick={() => navigate('/checkout', { state: { product } })}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"></path></svg>
            طلب توريد من المنصة
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export default function CatalogPage() {
  const { user } = useAuth();
  const role = user?.role || user?.accountType || 'user';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [linkedData, setLinkedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Map linked data by productId for O(1) lookup
  const dataMap = useMemo(() => {
    const map = new Map();
    linkedData.forEach(item => {
      const id = typeof item.productId === 'object' ? item.productId?._id : item.productId;
      if (id) map.set(id, item);
    });
    return map;
  }, [linkedData]);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const isTrader = role === 'trader';
      
      const requests = [
        traderApi.fetchPlatformCatalog({ page, limit: 12, search: searchQuery })
      ];

      if (isTrader) {
        requests.push(traderApi.fetchMyListedProducts({ limit: 1000 }));
      } else {
        requests.push(invApi.fetchMyInventory({ source: 'platform' }));
      }

      const [catalogData, personalData] = await Promise.all(requests);

      setProducts(catalogData.products || []);
      if (catalogData.pagination) {
        setTotalPages(catalogData.pagination.pages || 1);
      }
      
      const myList = personalData.products || personalData.inventory || personalData || [];
      setLinkedData(myList);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل في تحميل البيانات');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, page, role]);

  return (
    <div className="tc-page" dir="rtl">
      <Navbar />

      <main className="tc-main container section">
        <BackNavigator fallback="/profile" />

        <header className="tc-header">
          <p className="tc-kicker">{role === 'trader' ? 'Trader Marketplace' : 'Inventory Management'}</p>
          <h1 className="tc-title">كتالوج المنتجات الذكي</h1>
          <p className="tc-subtitle">
            {role === 'trader' 
              ? 'تصفح المنتجات وقم بإدارتها مباشرة في متجرك من شاشة واحدة.'
              : 'تصفح منتجات المنصة، أضفها لمخزنك الخاص وتابع كمياتك وأرباحك.'}
          </p>
        </header>

        {/* Toolbar */}
        <div className="tc-toolbar">
          <div className="tc-search" style={{ flex: 1, maxWidth: '100%' }}>
            <SearchIcon />
            <input 
              type="search" 
              className="tc-search-input" 
              placeholder="ابحث عن منتج بالاسم..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {error && (
          <div className="tc-empty" style={{ margin: '20px 0', borderColor: 'var(--red-200)', background: 'var(--red-50)' }}>
            <h3 style={{ color: 'var(--red-600)' }}>يوجد مشكلة</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="tc-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="tc-card" style={{ height: '350px' }}>
                <div className="shimmer" style={{ height: '200px', width: '100%' }} />
                <div style={{ padding: '15px' }}>
                  <div className="shimmer" style={{ height: '24px', width: '80%', marginBottom: '10px' }} />
                  <div className="shimmer" style={{ height: '20px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="tc-grid">
              {products.map(product => (
                <CatalogCard 
                  key={product._id} 
                  product={product} 
                  role={role}
                  linkedData={dataMap.get(product._id)}
                  onRefresh={() => fetchData(true)}
                />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '30px', alignItems: 'center' }}>
                <button
                  className="tc-btn"
                  style={{ padding: '8px 16px', background: '#334155', maxWidth: '120px' }}
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  السابق
                </button>
                <span style={{ fontSize: '14px', fontWeight: '500', margin: '0 8px' }}>
                  صفحة {page} من {totalPages}
                </span>
                <button
                  className="tc-btn"
                  style={{ padding: '8px 16px', background: '#334155', maxWidth: '120px' }}
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="tc-empty">
            <div className="tc-empty-icon">📦</div>
            <h3>لا توجد منتجات</h3>
            <p>حاول استخدام كلمات بحث مختلفة لتجد ما تبحث عنه.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
