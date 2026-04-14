import React from 'react'

function getCategoryName(category, categories = []) {
  if (!category) return '-'

  if (typeof category === 'string') {
    const matchedCategory = categories.find((item) => item?._id === category)
    return matchedCategory?.name || category
  }

  return category.name || category.title || '-'
}

function getCompanyName(company) {
  if (!company) return '-'
  return company.name || '-'
}

function hasDiscount(discount) {
  return Array.isArray(discount) && discount.length > 0
}

export default function ProductTable({ products, categories = [], onEdit, onDelete }) {
  return (
    <div className="product-table-wrap">
      <div className="product-table-desktop">
        <table className="product-table">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>الاسم</th>
              <th>السعر</th>
              <th>الفئة</th>
              <th>الشركة</th>
              <th>الخصم</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product?._id}>
                <td>
                  <img src={product?.image?.url || ''} alt={product?.name} className="product-thumb" />
                </td>
                <td>{product?.name}</td>
                <td>{product?.price} ج.م</td>
                <td>{getCategoryName(product?.category, categories)}</td>
                <td>{getCompanyName(product?.company)}</td>
                <td>
                  {hasDiscount(product?.discount) ? (
                    <span className="discount-pill">يوجد خصم</span>
                  ) : (
                    <span className="discount-pill is-muted">بدون خصم</span>
                  )}
                </td>
                <td>
                  <div className="table-actions product-table-actions">
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onEdit(product)}>
                      تعديل
                    </button>
                    <button type="button" className="admin-btn admin-btn-danger" onClick={() => onDelete(product)}>
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="product-cards-mobile">
        {products.map((product) => (
          <article key={product._id} className="product-mobile-card">
            <img src={product.image?.url || ''} alt={product.name} className="product-mobile-thumb" />
            <div className="product-mobile-body">
              <h3>{product.name}</h3>
              <p>{product.price} ج.م</p>
              <p>الفئة: {getCategoryName(product.category, categories)}</p>
              <p>الشركة: {getCompanyName(product.company)}</p>
              <span className={`discount-pill ${hasDiscount(product.discount) ? '' : 'is-muted'}`}>
                {hasDiscount(product.discount) ? 'يوجد خصم' : 'بدون خصم'}
              </span>
              <div className="table-actions product-table-actions">
                <button type="button" className="admin-btn admin-btn-danger" onClick={() => onDelete(product)}>
                  حذف
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
