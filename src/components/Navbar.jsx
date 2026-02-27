import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'
import { useCart } from '../context/CartContext'
import Cart from './Cart'

export default function Navbar(){
  const navigate = useNavigate()
  const [q,setQ] = useState('')
  const { items, toggle } = useCart()

  const handleSubmit = (value)=>{
    const query = (value || q || '').trim()
    if(!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link to="/" className="brand">تاجر</Link>
        <SearchBar value={q} onChange={setQ} onSubmit={handleSubmit} />
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={()=>navigate('/login')}>تسجيل الدخول</button>
          <button className="btn" onClick={()=>toggle()}>
            سلة (<span className="cart-count">{items.length}</span>)
          </button>
        </div>
        <Cart />
      </div>
    </header>
  )
}

// Navbar uses Cart context above
