import React, { useEffect, useState } from 'react'
import products from '../data/products'

const slides = products.map((p, idx) => ({
  title: p.name,
  subtitle: idx === 0 ? 'منتج مميز لهذا الأسبوع' : 'الأكثر طلبا لدى العملاء',
  image: p.image,
}))

export default function BannerCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="banner-carousel" aria-label="عروض المنتجات">
      {slides.map((s, i) => (
        <div key={i} className={`banner-slide ${i === index ? 'active' : ''}`}>
          <img className="banner-img" src={s.image} alt={s.title} />
          <div className="banner-overlay">
            <span className="banner-pill">عرض مميز</span>
            <h2>{s.title}</h2>
            <p>{s.subtitle}</p>
          </div>
        </div>
      ))}
      <div className="banner-dots">
        {slides.map((_, i) => (
          <button key={i} className={i === index ? 'dot active' : 'dot'} onClick={() => setIndex(i)} aria-label={`انتقال إلى الشريحة ${i + 1}`}></button>
        ))}
      </div>
    </section>
  )
}
