import React from 'react'
import { useCart } from '../context/CartContext'

export default function ProductCard({product}){
  const { addToCart } = useCart()

  return (
    <article className="product-card">
      <div className="product-media" style={{backgroundImage:`url(${product.image?.url || product.image || ''})`}} />
      <div className="product-body">
        <div className="product-title">{product.name}</div>
        <div className="product-price">{product.price ? `$${product.price.toFixed(2)}` : ''}</div>
        <div className="product-actions">
          <button className="btn btn-primary" onClick={()=>addToCart(product)}>أضف إلى السلة</button>
          <button className="btn btn-ghost">تحقق من التوفر</button>
        </div>
      </div>
    </article>
  )
}
