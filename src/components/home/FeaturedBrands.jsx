import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { companyApi } from '../../utils/companyApi'
import './FeaturedBrands.css'

const DEFAULT_BRANDS = [
  { id: 1, name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 2, name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
  { id: 3, name: 'Sony', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sony_logo.svg' },
  { id: 4, name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { id: 5, name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
  { id: 6, name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_Logo.svg' },
  { id: 7, name: 'LG', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg' },
]

export default function FeaturedBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const data = await companyApi.getActiveCompanies()
        setBrands(data || [])
      } catch (err) {
        console.error('Failed to fetch brands:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBrands()
  }, [])

  const handleBrandClick = (brandId) => {
    // Navigate to categories with company filter
    navigate(`/categories?company=${brandId}`)
  }

  if (loading) return null // Or a skeleton
  if (brands.length === 0) return null

  // Double the array to create an infinite seamless loop effect
  const displayBrands = [...brands, ...brands, ...brands]

  return (
    <section className="brands-section" aria-labelledby="brands-title" dir="ltr">
      <div className="container">
        <h3 id="brands-title" className="sr-only">أشهر العلامات التجارية</h3>
        <p className="brands-subtitle" dir="rtl">تسوق من أشهر العلامات التجارية العالمية الموثوقة</p>
        
        <div className="brands-marquee-wrap">
          <div className="brands-marquee">
            {displayBrands.map((brand, idx) => (
              <div 
                key={`${brand._id || brand.id}-${idx}`} 
                className="brand-logo-item" 
                title={brand.name}
                onClick={() => handleBrandClick(brand._id || brand.id)}
                style={{ cursor: 'pointer' }}
              >
                <img src={brand.logo?.url || brand.logo} alt={brand.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
