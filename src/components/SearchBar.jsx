import React from 'react'

export default function SearchBar({ value, onChange, onSubmit }){
  return (
    <form className="searchbar" onSubmit={(e)=>{e.preventDefault(); onSubmit && onSubmit(value)}}>
      <input
        aria-label="ابحث عن المنتجات"
        className="search-input"
        placeholder="ابحث عن المنتجات أو العلامات أو الأقسام"
        value={value}
        onChange={(e)=>onChange && onChange(e.target.value)}
      />
      <button type="submit" className="search-btn">بحث</button>
    </form>
  )
}
