import React from 'react'
import CategoryCard from './CategoryCard'

export default function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <div className="category-grid">
      {categories?.map((category) => (
        <CategoryCard
          key={category._id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
