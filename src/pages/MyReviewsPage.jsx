import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { createReview, getMyReviews, updateReview, deleteReview } from '../controllers/reviewsController';
import { toast } from '../utils/toast';
import './MyReviewsPage.css';

const StarRating = ({ value, onChange, readonly = false }) => {
  return (
    <div className={`star-rating ${readonly ? 'star-rating--readonly' : ''}`} dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="28" height="28" viewBox="0 0 24 24"
          fill={star <= value ? '#f59e0b' : 'none'}
          stroke={star <= value ? '#f59e0b' : '#d1d5db'}
          strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          onClick={() => !readonly && onChange && onChange(star)}
          className="star-svg"
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [hasMore, setHasMore] = useState(false);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [starsCount, setstarsCount] = useState(5);
  const [content, setContent] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editstarsCount, setEditstarsCount] = useState(5);
  const [editContent, setEditContent] = useState('');

  const fetchReviews = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const data = await getMyReviews({ page: p, limit });
      const list = Array.isArray(data) ? data : (data.reviews || data.results || data.data || []);
      setReviews(list);

      const totalPages = data.pages || data.totalPages || data.pagination?.totalPages || 1;
      setHasMore(p < totalPages || list.length === limit);
    } catch (err) {
      toast(err?.response?.data?.message || err.message || "حدث خطأ أثناء تحميل التقييمات", "error");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchReviews(page);
  }, [page, fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      return toast("يرجى كتابة محتوى التقييم", "error");
    }
    try {
      setIsSubmitting(true);
      await createReview({ starsCount, content: content.trim() });
      toast("تم التقييم بنجاح! شكراً لك", "success");
      setstarsCount(5);
      setContent('');
      if (page === 1) {
        fetchReviews(1);
      } else {
        setPage(1);
      }
    } catch (err) {
      toast(err?.response?.data?.message || err.message || "فشل في تسجيل التقييم", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editContent.trim()) {
      return toast("يرجى كتابة محتوى التقييم", "error");
    }
    try {
      setIsSubmitting(true);
      await updateReview(id, { starsCount: editstarsCount, content: editContent.trim() });
      toast("تم تعديل التقييم بنجاح", "success");
      setEditingId(null);
      setReviews(prev => prev.map(r => (r._id === id || r.id === id) ? { ...r, starsCount: editstarsCount, content: editContent } : r));
    } catch (err) {
      toast(err?.response?.data?.message || err.message || "فشل في التعديل", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;
    try {
      await deleteReview(id);
      toast("تم حذف التقييم بنجاح", "success");
      fetchReviews(page);
    } catch (err) {
      toast(err?.response?.data?.message || err.message || "فشل في الحذف", "error");
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id || review.id);
    setEditstarsCount(review.starsCount || 5);
    setEditContent(review.content || '');
  };

  return (
    <div className="mr-page" dir="rtl">
      <Navbar />
      <main className="container section">
        <header className="mr-header">
          <h1>تقييماتي</h1>
          <p>شاركنا تجربتك. رأيك يهمنا ويساعدنا على التحسين الذائم!</p>
        </header>

        {/* Create Review Form */}
        <section className="mr-card mr-form-card">
          <h2>أضف تقييماً جديداً</h2>
          <form onSubmit={handleSubmit}>
            <div className="mr-stars-wrap">
              <label>مستوى رضاك:</label>
              <StarRating value={starsCount} onChange={setstarsCount} />
            </div>
            <div className="mr-input-wrap">
              <label>تجربتك بالتفصيل:</label>
              <textarea
                placeholder="أخبرنا عن تجربتك مع المنصة، وما الذي نال إعجابك أو يحتاج تحسينًا..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            <button type="submit" className="mr-btn mr-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'جارٍ الحفظ...' : 'نشر التقييم'}
            </button>
          </form>
        </section>

        {/* List Reviews */}
        <section className="mr-list">
          <h2>سجل التقييمات السابقة</h2>

          {loading && <div className="mr-loading">جاري إحضار تقييماتك...</div>}

          {!loading && reviews.length === 0 && (
            <div className="mr-empty">
              لم تقم بإضافة أي تقييمات بعد.كن أول من يقيم!
            </div>
          )}

          {!loading && reviews.length > 0 && (
            <div className="mr-grid">
              {reviews.map((review) => {
                const rId = review._id || review.id;
                const isEditing = editingId === rId;

                return (
                  <div key={rId} className="mr-review-card">
                    {isEditing ? (
                      <div className="mr-edit-mode">
                        <div className="mr-stars-wrap">
                          <StarRating value={editstarsCount} onChange={setEditstarsCount} />
                        </div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={4}
                        />
                        <div className="mr-actions">
                          <button onClick={() => handleUpdate(rId)} className="mr-btn mr-btn-success" disabled={isSubmitting}>حفظ التغييرات</button>
                          <button onClick={() => setEditingId(null)} className="mr-btn mr-btn-ghost">إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mr-review-head">
                          <StarRating value={review.starsCount || 5} readonly />
                          <span className="mr-date">
                            {new Date(review.createdAt || Date.now()).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                        <p className="mr-review-body">{review.content}</p>
                        <div className="mr-actions">
                          <button onClick={() => startEdit(review)} className="mr-btn mr-btn-outline">تعديل</button>
                          <button onClick={() => handleDelete(rId)} className="mr-btn mr-btn-danger">حذف</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && (hasMore || page > 1) && (
            <div className="mr-pagination">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="mr-page-btn">السابق</button>
              <span className="mr-page-num">{page}</span>
              <button disabled={!hasMore} onClick={() => setPage(p => p + 1)} className="mr-page-btn">التالي</button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
