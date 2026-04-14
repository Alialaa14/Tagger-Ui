import React from 'react'

export default function CategoryCard({ category, onEdit, onDelete }) {
  return (
    <article className="category-card">
      <img
        src={category?.image?.url || ''}
        alt={category?.name}
        className="category-card-image"
      />

      <div className="category-card-body">
        <h3>{category?.name}</h3>
        <p className="line-clamp-2">{category?.description}</p>

        <div className="table-actions">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onEdit(category)}>
            ?????
          </button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={() => onDelete(category)}>
            ???
          </button>
        </div>
      </div>
    </article>
  )
}
