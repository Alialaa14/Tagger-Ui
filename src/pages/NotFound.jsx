import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="auth-page">
      <div className="card">
        <div className="header">
          <div className="h-title">404 - Page Not Found</div>
          <div className="h-sub">The route you requested does not exist.</div>
        </div>
        <div className="row">
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
            Go to Home
          </Link>
          <Link to="/login" className="btn btn-ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
            Go to Login
          </Link>
        </div>
      </div>
    </section>
  )
}
