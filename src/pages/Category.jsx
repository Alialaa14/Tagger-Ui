import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import categories from '../data/seed_categories'
import products from '../data/seed_products'
import ProductCard from '../components/ProductCard'

export default function Category(){
  const { name } = useParams()
  const decoded = decodeURIComponent(name || '')
  const category = categories.find(c => c.name === decoded)

  const categoryProducts = useMemo(()=>{
    if(!category) return []
    return products.filter(p => p.category === category._id)
  },[category])

  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [hasDiscount, setHasDiscount] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [bestSelling, setBestSelling] = useState(false)
  const [hasCoupons, setHasCoupons] = useState(false)

  const manufacturers = Array.from(new Set(categoryProducts.map(p => p.manufacturer).filter(Boolean)))

  const filtered = categoryProducts.filter(p => {
    if(searchTerm && !( (p.name||'').toLowerCase().includes(searchTerm.toLowerCase()) || (p.description||'').toLowerCase().includes(searchTerm.toLowerCase()) )) return false
    if(min && p.price < Number(min)) return false
    if(max && p.price > Number(max)) return false
    if(hasDiscount && (!p.discount || p.discount.length === 0)) return false
    if(manufacturer && p.manufacturer !== manufacturer) return false
    if(bestSelling && !(p.sales && p.sales >= 300)) return false
    if(hasCoupons && !(p.coupons && p.coupons.length > 0)) return false
    return true
  })

  if(!category) return (
    <div className="container"><p>الفئة غير موجودة</p></div>
  )

  return (
    <div className="category-page">
      <section className="category-banner" style={{backgroundImage:`url(${category.image.url})`}}>
        <div className="category-banner-inner">
          <h2>{category.name}</h2>
          <p>{category.description}</p>
        </div>
      </section>

      <div className="container category-layout">
        <aside className="category-aside">
          <h4>تصفية المنتجات</h4>
          <label>بحث</label>
          <input type="text" placeholder="ابحث عن منتج" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          <label>الحد الأدنى للسعر</label>
          <input type="number" value={min} onChange={e=>setMin(e.target.value)} />
          <label>الحد الأقصى للسعر</label>
          <input type="number" value={max} onChange={e=>setMax(e.target.value)} />

          <label>الشركة المصنعة</label>
          <select value={manufacturer} onChange={e=>setManufacturer(e.target.value)}>
            <option value="">الكل</option>
            {manufacturers.map(m=> <option key={m} value={m}>{m}</option>)}
          </select>

          <label className="checkbox-row">
            <input type="checkbox" checked={bestSelling} onChange={e=>setBestSelling(e.target.checked)} />
            <span>الأكثر مبيعاً</span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={hasDiscount} onChange={e=>setHasDiscount(e.target.checked)} />
            <span>منتجات بها خصم</span>
          </label>

          <label className="checkbox-row">
            <input type="checkbox" checked={hasCoupons} onChange={e=>setHasCoupons(e.target.checked)} />
            <span>متوفرة بكوبونات</span>
          </label>
          <div className="aside-actions">
            <button className="btn btn-primary" onClick={()=>{}}>تطبيق</button>
            <button className="btn btn-ghost" onClick={()=>{setMin('');setMax('');setHasDiscount(false);setSearchTerm('');setManufacturer('');setBestSelling(false);setHasCoupons(false)}}>مسح</button>
          </div>
        </aside>

        <section className="category-main">
          <div className="category-meta">
            <strong>{filtered.length}</strong>
            <span>منتج/منتجات في هذه الفئة</span>
          </div>

          <div className="products-grid">
            {filtered.map(p => <ProductCard key={p.name} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
