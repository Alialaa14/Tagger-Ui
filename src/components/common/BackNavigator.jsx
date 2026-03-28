import React from 'react'
import { useNavigate } from 'react-router-dom'
import './BackNavigator.css'

/**
 * BackNavigator
 * A reusable component to go back to the previous page or a specific fallback URL.
 * Designed to fit the premium RTL aesthetic.
 * 
 * @param {string} fallback The URL to route to if there is no history. Defaults to '/' (Home).
 * @param {string} label The text to display on the button. Defaults to 'عودة'.
 * @param {string} className Extra CSS classes to apply.
 */
export default function BackNavigator({ fallback = '/', label = 'عودة', className = '' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button 
      type="button" 
      onClick={handleBack} 
      className={`back-navigator-btn ${className}`}
      aria-label="العودة للصفحة السابقة"
      dir="rtl"
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="back-navigator-icon"
      >
        {/* Right-pointing arrow for RTL */}
        <path d="M9 18l6-6-6-6" />
      </svg>
      <span className="back-navigator-label">{label}</span>
    </button>
  )
}
