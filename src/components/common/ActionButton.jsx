import React from 'react'

export default function ActionButton({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading
  const base = 'btn action-btn'
  const styleClass = variant === 'outline' ? 'action-btn-outline' : 'action-btn-primary'

  return (
    <button className={`${base} ${styleClass} ${className}`.trim()} disabled={isDisabled} {...props}>
      {loading ? <span className="action-btn-spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  )
}
