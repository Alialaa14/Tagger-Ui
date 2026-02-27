import React, { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import products from '../data/seed_products'
import ProductCard from '../components/ProductCard'

function useQuery(){
  return new URLSearchParams(useLocation().search)
}

export default function SearchResults(){
  const q = useQuery().get('q') || ''
  const term = q.trim().toLowerCase()

  const results = useMemo(()=>{
    if(!term) return []
    return products.filter(p => (p.name + ' ' + (p.description||'')).toLowerCase().includes(term))
  },[term])

  return (
    <div className="container">
      <h3>نتائج البحث عن "{q}"</h3>
      <p>{results.length} نتائج</p>
      <div className="products-grid">
        {results.map(r => <ProductCard key={r.name} product={r} />)}
      </div>
    </div>
  )
}
