import React from 'react'

export default function CompanyTable({ companies, onEdit, onDelete, onToggle }) {
  return (
    <div className="product-table-wrap">
      <div className="product-table-desktop">
        <table className="product-table">
          <thead>
            <tr>
              <th>الشعار</th>
              <th>الاسم</th>
              <th>الوصف</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {companies?.map((company) => (
              <tr key={company._id}>
                <td>
                  <img 
                    src={company.logo?.url || ''} 
                    alt={company.name} 
                    className="product-thumb" 
                    style={{ objectFit: 'contain', background: '#f8fafc' }}
                  />
                </td>
                <td style={{ fontWeight: 700, color: 'var(--grey-900)' }}>{company.name}</td>
                <td style={{ maxWidth: '300px', fontSize: '13px', color: 'var(--grey-500)' }}>
                  {company.description || '-'}
                </td>
                <td>
                  <button 
                    onClick={() => onToggle(company._id)}
                    style={{ 
                        background: company.isActive ? 'var(--green-100)' : 'var(--grey-100)', 
                        color: company.isActive ? 'var(--green-700)' : 'var(--grey-500)',
                        border: 'none', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 800, cursor: 'pointer', transition: 'all var(--transition)'
                    }}
                  >
                    {company.isActive ? 'نشط' : 'معطل'}
                  </button>
                </td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onEdit(company)}>
                      تعديل
                    </button>
                    <button type="button" className="admin-btn admin-btn-danger" onClick={() => onDelete(company._id)}>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="product-cards-mobile" style={{ gap: '16px' }}>
        {companies.map((company) => (
          <article key={company._id} className="product-mobile-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={company.logo?.url || ''} alt={company.name} className="product-mobile-thumb" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--grey-900)' }}>{company.name}</h3>
                    <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--grey-500)' }}>{company.description || 'لا يوجد وصف'}</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button 
                    onClick={() => onToggle(company._id)}
                    style={{ 
                        background: company.isActive ? 'var(--green-100)' : 'var(--grey-100)', 
                        color: company.isActive ? 'var(--green-700)' : 'var(--grey-500)',
                        border: 'none', padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 800
                    }}
                >
                    {company.isActive ? 'نشط' : 'معطل'}
                </button>

                <div className="table-actions" style={{ margin: 0 }}>
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onEdit(company)}>تعديل</button>
                    <button type="button" className="admin-btn admin-btn-danger" onClick={() => onDelete(company._id)}>حذف</button>
                </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
