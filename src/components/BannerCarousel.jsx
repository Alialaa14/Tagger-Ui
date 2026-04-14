import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { bannerApi } from '../utils/bannerApi'

const DEFAULT_BG = 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)';
const DEFAULT_ACCENT = '#4ade80';


export default function BannerCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [animDir, setAnimDir] = useState('next')
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const data = await bannerApi.getActiveBanners()
      console.log(data)

      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((b, idx) => ({
          id: b._id,
          // Use distinct gradients based on index for a premium feel if not in DB
          bg: idx % 3 === 0 ? 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)' :
            idx % 3 === 1 ? 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)' :
              'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
          badge: b.isActive ? '⚡ عرض مباشر' : 'إعلان',
          title: b.title,
          subtitle: b.subtitle,
          cta: b.buttonText || 'تسوق الآن',
          ctaLink: b.buttonLink || '/',
          image: b.imageUrl?.url || b.image,
          accent: idx % 3 === 0 ? '#4ade80' : idx % 3 === 1 ? '#60a5fa' : '#fb923c',
        }))
        setSlides(mapped)
      } else {
        setSlides(FALLBACK_SLIDES)
      }
    } catch (e) {
      setSlides(FALLBACK_SLIDES)
    } finally {
      setLoading(false)
    }
  }

  const goTo = useCallback((i, dir = 'next') => {
    setAnimDir(dir)
    setIndex(i)
  }, [])

  const next = useCallback(() => goTo((index + 1) % slides.length, 'next'), [index, slides.length, goTo])
  const prev = useCallback(() => goTo((index - 1 + slides.length) % slides.length, 'prev'), [index, slides.length, goTo])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 4500)
    return () => clearInterval(id)
  }, [paused, next])

  if (loading) {
    return (
      <section className="bc-root" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader">جاري التحميل...</div>
      </section>
    )
  }

  if (!slides || slides.length === 0) return null

  const slide = slides[index] || slides[0]

  return (
    <section
      className="bc-root"
      aria-label="شرائح إعلانية"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id || i}
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
        {slides.map((s, i) => (
          <button
            key={s.id || i}
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
