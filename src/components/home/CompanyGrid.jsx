import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { companyApi } from '../../utils/companyApi'
import './CompanyGrid.css'

export default function CompanyGrid() {
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companyApi.getActiveCompanies()
        setCompanies(data || [])
      } catch (err) {
        console.error('Failed to load companies:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  if (isLoading) {
    return (
      <section className="company-grid-section section container" dir="rtl">
        <h3 className="section-title">تسوق حسب العلامة التجارية</h3>
        <div className="company-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="company-card skeleton" style={{ height: '120px', borderRadius: '12px' }} />
          ))}
        </div>
      </section>
    )
  }

  if (companies.length === 0) return null

  return (
    <section className="company-grid-section section container" dir="rtl">
      <div className="section-head">
        <h3>تسوق حسب العلامة التجارية</h3>
        <p>اختر علامتك التجارية المفضلة واستعرض منتجاتها الحصرية.</p>
      </div>

      <div className="company-grid">
        {companies.map((company) => (
          <button
            key={company._id}
            type="button"
            className="company-card"
            onClick={() => navigate(`/products?company=${company._id}`)}
          >
            <div className="company-card__logo">
              <img src={company.logo?.url || ''} alt={company.name} loading="lazy" />
            </div>
            <span className="company-card__name">{company.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
