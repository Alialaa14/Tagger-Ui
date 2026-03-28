import React, { useEffect, useState } from 'react'
import './CustomerTestimonials.css'

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: 'أحمد محمود',
    role: 'ميل دائم',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    rating: 5,
    text: 'تجربة رائعة وتوصيل سريع جداً. المنتجات وصلت بحالة ممتازة والتغليف كان فوق الممتاز. شكراً لكم!',
  },
  {
    id: 2,
    name: 'سارة خالد',
    role: 'ميل جديد',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    rating: 5,
    text: 'أفضل أسعار وجدتها في السوق، خدمة العملاء متعاونة جداً وتم حل مشكلتي في ثوانٍ. أنصح بالتعامل معهم.',
  },
  {
    id: 3,
    name: 'محمد علي',
    role: 'ميل مميز',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    rating: 4,
    text: 'واجهة التطبيق سهلة الاستخدام وتنوع المنتجات رائع. أتمنى إضافة خيارات دفع أكثر في المستقبل.',
  },
]

export default function CustomerTestimonials() {
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS)

  useEffect(() => {
    // Load custom testimonials from localStorage if available (Admin override)
    const stored = localStorage.getItem('tagger_testimonials')
    if (stored) {
      try {
        setReviews(JSON.parse(stored))
      } catch (err) { }
    }
  }, [])

  if (reviews.length === 0) return null

  return (
    <section className="testimonials-section container" aria-labelledby="testimonials-title" dir="rtl">
      <div className="section-head text-center">
        <h3 id="testimonials-title">آراء عملائنا</h3>
        <p>نفتخر بثقتكم بنا، ونسعى دائماً لتقديم الأفضل.</p>
      </div>

      <div className="testimonials-grid">
        {reviews.map((rev) => (
          <div key={rev.id} className="testimonial-card">
            <div className="testi-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`star ${i < rev.rating ? 'is-filled' : ''}`}>★</span>
              ))}
            </div>
            <p className="testi-text">"{rev.text}"</p>
            <div className="testi-user">
              <img src={rev.avatar} alt={rev.name} className="testi-avatar" loading="lazy" />
              <div className="testi-info">
                <h4>{rev.name}</h4>
                <span>{rev.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
