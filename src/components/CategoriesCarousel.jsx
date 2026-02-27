import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import categories from '../data/categories'

export default function CategoriesCarousel(){
  const sc = useRef(null)

  const scroll = (dir)=>{
    if(!sc.current) return
    sc.current.scrollBy({left: dir * 300, behavior: 'smooth'})
  }

  return (
    <section className="categories-section">
      <div className="section-head">
        <h3>Categories</h3>
        <div className="controls">
          <button onClick={()=>scroll(-1)} className="ctrl">‹</button>
          <button onClick={()=>scroll(1)} className="ctrl">›</button>
        </div>
      </div>

      <div className="categories-row" ref={sc}>
        {categories.map(cat=> (
          <Link to={`/category/${encodeURIComponent(cat.name)}`} key={cat.name} className="category-card">
            <div className="cat-image" style={{backgroundImage:`url(${cat.image})`}} />
            <div className="cat-info">
              <strong>{cat.name}</strong>
              <p>{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
