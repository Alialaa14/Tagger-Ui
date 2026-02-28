import React from 'react'

export default function CategorySkeleton() {
  return (
    <article className="home-category-card home-category-skeleton" aria-hidden="true">
      <div className="home-category-image-wrap shimmer" />
      <div className="home-category-body">
        <div className="s-line s-lg shimmer" />
        <div className="s-line shimmer" />
      </div>
    </article>
  )
}
