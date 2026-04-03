import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviews } from '../../controllers/admin/reviewsController';
import './admin-theme.css';

// ─── Helpers ───
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}

function StarBadge({ stars }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 99, fontSize: 13,
      fontWeight: 700, backgroundColor: '#fef3c7', color: '#92400e'
    }}>
      ⭐ {stars || 0}
    </span>
  );
}

// ─── Modal ───
function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn .15s ease'
      }}
    >
      <div style={{
        background: 'var(--modal-bg, #fff)', borderRadius: 18, width: '100%',
        maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        overflow: 'hidden', animation: 'slideUp .2s ease'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border, #e5e7eb)'
        }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 20, color: 'var(--muted, #6b7280)', lineHeight: 1
          }}>✕</button>
        </div>
        <div style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [avgStars, setAvgStars] = useState(0);

  // Modals
  const [viewModal, setViewModal] = useState(null);

  const loadReviews = useCallback(async (p, l) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllReviews({ page: p, limit: l });
      const list = Array.isArray(data) ? data : (data.reviews || data.results || data.data || []);
      setReviews(list);
      setTotalPages(data.pages || data.totalPages || data.pagination?.totalPages || 1);
      if (data.avgStars !== undefined) setAvgStars(data.avgStars);
    } catch (err) {
      setError('تعذّر تحميل التقييمات. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(page, limit);
  }, [page, limit, loadReviews]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <>
      <section className="admin-stack" dir="rtl">
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
            <p className="admin-kicker" style={{ marginBottom: 2 }}>إدارة النظام</p>
            <h2 style={{ marginBottom: 4 }}>تقييمات المنصة</h2>
            <p className="admin-muted">مراجعة تقييمات العملاء والتجار المستلمة على المنصة.</p>
            {avgStars > 0 && (
              <div style={{ marginTop: 12 }}>
                <StarBadge stars={avgStars.toFixed(1) + " متوسط التقييمات"} />
              </div>
            )}
          </div>

          {/* Filters */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 24px', borderBottom: '1px solid var(--border, #e5e7eb)',
            background: 'var(--row-hover, #f9fafb)'
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted, #6b7280)' }}>عرض:</span>
            <select
              style={{
                border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px',
                fontSize: 13, outline: 'none'
              }}
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n} عناصر</option>)}
            </select>
            <button className="admin-btn" style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 13 }} onClick={() => loadReviews(page, limit)}>
              🔄 تحديث
            </button>
          </div>

          {/* List */}
          {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>جاري التحميل...</div>}
          {!loading && error && <div style={{ padding: '24px', color: '#dc2626' }}>{error}</div>}
          {!loading && !error && reviews.length === 0 && (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#9ca3af', fontSize: 15 }}>
              ⭐ لم يتم إضافة أي تقييمات بعد.
            </div>
          )}
          {!loading && reviews.length > 0 && (
            <div>
              {reviews.map((r, idx) => {
                const user = r.user || {};
                const userName = user.name || user.shopName || user.username || 'مستخدم غير معروف';
                const content = r.content || '—';

                return (
                  <div key={r._id || r.id || idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '18px 24px', borderBottom: '1px solid var(--border, #e5e7eb)',
                    transition: 'background .15s'
                  }} className="notif-row">
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, color: '#0ea5e9', fontWeight: 800
                    }}>
                      {userName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{userName}</span>
                        <StarBadge stars={r.starsCount} />
                      </div>
                      <p style={{
                        fontSize: 14, color: '#4b5563', margin: '4px 0 8px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {content}
                      </p>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(r.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button className="admin-btn" style={{ background: '#eff6ff', color: '#1d4ed8' }} onClick={() => setViewModal(r)}>معاينة</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              padding: '16px 24px', borderTop: '1px solid var(--border, #e5e7eb)'
            }}>
              <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} className="admin-btn" style={{ background: '#fff' }}>السابق</button>
              <span style={{ fontWeight: 700, fontSize: 14, margin: '0 8px' }}>صفحة {page} من {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)} className="admin-btn" style={{ background: '#fff' }}>التالي</button>
            </div>
          )}
        </div>
      </section>

      {/* View Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="تفاصيل التقييم">
        {viewModal && (
          <div dir="rtl">
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: '#e0f2fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#0ea5e9'
              }}>
                {(viewModal.user?.name || viewModal.user?.shopName || 'م').charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{viewModal.user?.name || viewModal.user?.shopName || 'مستخدم غير معروف'}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{fmtDate(viewModal.createdAt)}</div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <StarBadge stars={viewModal.starsCount} />
            </div>
            <div style={{
              background: '#f9fafb', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb',
              fontSize: 15, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap'
            }}>
              {viewModal.content}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
