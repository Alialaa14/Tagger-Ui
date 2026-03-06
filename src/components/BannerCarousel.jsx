import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    id: 1,
    bg: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)',
    badge: '🛒 عرض الأسبوع',
    title: 'خضروات طازجة يومياً',
    subtitle: 'مباشرة من المزارع إلى بيتك — توصيل في غضون ساعتين',
    cta: 'تسوق الآن',
    ctaLink: '/categories',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
    accent: '#4ade80',
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)',
    badge: '❄️ منتجات مبردة',
    title: 'ألبان ومنتجات أطباء',
    subtitle: 'تشكيلة واسعة من الألبان والأجبان الطازجة بأفضل الأسعار',
    cta: 'اكتشف المزيد',
    ctaLink: '/categories',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80',
    accent: '#60a5fa',
  },
  {
    id: 3,
    bg: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
    badge: '🔥 أسعار لا تُفوَّت',
    title: 'تخفيضات نهاية الأسبوع',
    subtitle: 'وفّر حتى ٤٠٪ على المنتجات المختارة — العرض لفترة محدودة',
    cta: 'شاهد العروض',
    ctaLink: '/categories',
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&q=80',
    accent: '#fb923c',
  },
  {
    id: 4,
    bg: 'linear-gradient(135deg, #4a1d96 0%, #7c3aed 50%, #8b5cf6 100%)',
    badge: '🧴 العناية الشخصية',
    title: 'منتجات التنظيف والعناية',
    subtitle: 'كل ما تحتاجه للمنزل من منظفات ومستلزمات العناية',
    cta: 'تصفح المنتجات',
    ctaLink: '/categories',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    accent: '#c084fc',
  },
]

export default function BannerCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [animDir, setAnimDir] = useState('next')
  const navigate = useNavigate()

  const goTo = useCallback((i, dir = 'next') => {
    setAnimDir(dir)
    setIndex(i)
  }, [])

  const next = useCallback(() => goTo((index + 1) % SLIDES.length, 'next'), [index, goTo])
  const prev = useCallback(() => goTo((index - 1 + SLIDES.length) % SLIDES.length, 'prev'), [index, goTo])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4500)
    return () => clearInterval(id)
  }, [paused, next])

  const slide = SLIDES[index]

  return (
    <section
      className="bc-root"
      aria-label="شرائح إعلانية"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`bc-slide ${i === index ? 'bc-slide--active' : ''}`}
          style={{ background: s.bg }}
          aria-hidden={i !== index}
        >
          {/* Content */}
          <div className="bc-body">
            <span className="bc-badge">{s.badge}</span>
            <h2 className="bc-title">{s.title}</h2>
            <p className="bc-sub">{s.subtitle}</p>
            <button
              className="bc-cta"
              style={{ '--cta-color': s.accent }}
              onClick={() => navigate(s.ctaLink)}
            >
              {s.cta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className="bc-image-wrap">
            <img src={s.image} alt={s.title} className="bc-image" loading="lazy" />
            <div className="bc-image-veil" style={{ background: s.bg }} />
          </div>

          {/* Accent blob */}
          <div className="bc-blob" style={{ background: s.accent }} />
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button className="bc-arrow bc-arrow--prev" onClick={prev} aria-label="السابق">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <button className="bc-arrow bc-arrow--next" onClick={next} aria-label="التالي">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="bc-dots" role="tablist" aria-label="اختر الشريحة">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === index}
            aria-label={`الشريحة ${i + 1}`}
            className={`bc-dot ${i === index ? 'bc-dot--active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="bc-progress">
        <div
          key={`${index}-${paused}`}
          className={`bc-progress-bar ${!paused ? 'bc-progress-bar--running' : ''}`}
          style={{ '--duration': '4.5s', background: slide.accent }}
        />
      </div>
    </section>
  )
}
