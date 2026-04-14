import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './ScanPage.css'

// ── States: loading | success | error ─────────────────────────

export default function ScanPage() {
  const { userId, productId } = useParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [data, setData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const sell = async () => {
      try {
        // Connect your real sell / decrement endpoint here.
        // Expected response shape: { data: { productName, quantity, income } }
        const res = await axios.post(
          `/api/v1/inventory/scan/${userId}/${productId}`,
          {},
          { withCredentials: true },
        )
        const payload = res?.data?.data ?? res?.data ?? {}
        setData(payload)
        setStatus('success')
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'حدث خطأ غير متوقع'
        setErrorMsg(msg)
        setStatus('error')
      }
    }

    sell()
  }, [userId, productId])

  return (
    <div className="scan-root">
      {/* Ambient blobs */}
      <span className="scan-blob scan-blob--a" aria-hidden="true" />
      <span className="scan-blob scan-blob--b" aria-hidden="true" />

      <div className="scan-card" role="main">
        {status === 'loading' && <LoadingState />}
        {status === 'success' && <SuccessState data={data} />}
        {status === 'error' && <ErrorState message={errorMsg} />}
      </div>
    </div>
  )
}

// ── Loading ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="scan-state scan-state--loading">
      <div className="scan-spinner" aria-label="جاري المعالجة">
        <span /><span /><span /><span />
      </div>
      <p className="scan-loading-title">جاري تسجيل البيع…</p>
      <p className="scan-loading-sub">يرجى الانتظار، لا تغلق هذه الصفحة</p>
    </div>
  )
}

// ── Success ────────────────────────────────────────────────────

function SuccessState({ data }) {
  return (
    <div className="scan-state scan-state--success">
      {/* Animated check */}
      <div className="scan-check-wrap" aria-hidden="true">
        <svg className="scan-check-svg" viewBox="0 0 56 56" fill="none">
          <circle className="scan-check-ring" cx="28" cy="28" r="26"
            stroke="currentColor" strokeWidth="2.5" />
          <polyline className="scan-check-tick" points="16,29 24,37 40,20"
            stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="scan-success-title">تم البيع بنجاح</h1>
      <p className="scan-success-sub">تم تحديث المخزون وتسجيل العملية</p>

      {data && (
        <div className="scan-meta-grid">
          {data.productName && (
            <MetaItem label="المنتج" value={data.productName} />
          )}
          {data.quantity != null && (
            <MetaItem label="الكمية المتبقية" value={data.quantity} highlight />
          )}
          {data.income != null && (
            <MetaItem label="الإيراد" value={`${data.income} ج.م`} />
          )}
        </div>
      )}

      <div className="scan-done-badge">✓ العملية مكتملة</div>
    </div>
  )
}

function MetaItem({ label, value, highlight }) {
  return (
    <div className={`scan-meta-item${highlight ? ' is-highlight' : ''}`}>
      <span className="scan-meta-label">{label}</span>
      <strong className="scan-meta-value">{value}</strong>
    </div>
  )
}

// ── Error ──────────────────────────────────────────────────────

function ErrorState({ message }) {
  return (
    <div className="scan-state scan-state--error">
      <div className="scan-x-wrap" aria-hidden="true">
        <svg className="scan-x-svg" viewBox="0 0 56 56" fill="none">
          <circle className="scan-x-ring" cx="28" cy="28" r="26"
            stroke="currentColor" strokeWidth="2.5" />
          <line className="scan-x-line1" x1="18" y1="18" x2="38" y2="38"
            stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" />
          <line className="scan-x-line2" x1="38" y1="18" x2="18" y2="38"
            stroke="currentColor" strokeWidth="3"
            strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="scan-error-title">فشلت العملية</h1>
      <p className="scan-error-msg">{message}</p>

      <button
        className="scan-retry-btn"
        onClick={() => window.location.reload()}
      >
        إعادة المحاولة
      </button>
    </div>
  )
}
