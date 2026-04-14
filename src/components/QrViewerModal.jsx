// QrViewerModal.jsx
// Full-size QR code viewer modal with download button

import QrCodeCanvas from './QrCodeCanvas'

export default function QrViewerModal({ item, onClose }) {
  if (!item) return null

  const p = item.source === 'platform' ? item.productId : item.customProduct
  const name = p?.name || 'المنتج'

  // Resolve the src once so we can reuse it for download
  const qrSrc = item.qrCode.startsWith('data:')
    ? item.qrCode
    : `data:image/png;base64,${item.qrCode}`

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = qrSrc
    a.download = `qr-${name.replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <div
      className="tmp-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="inventory-modal"
        dir="rtl"
        style={{
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          padding: '32px 28px',
          borderRadius: '20px',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          className="tmp-modal-close"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', left: '16px' }}
          aria-label="إغلاق"
        >
          ✕
        </button>

        {/* Header */}
        <h3 style={{ marginBottom: '4px', fontSize: '18px' }}>رمز QR للمنتج</h3>
        <p className="admin-muted" style={{ marginBottom: '24px', fontSize: '13px' }}>
          {name}
        </p>

        {/* QR image — large */}
        <div
          style={{
            display: 'inline-flex',
            padding: '16px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            marginBottom: '24px',
          }}
        >
          <QrCodeCanvas value={item.qrCode} size={240} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleDownload}
            style={{ padding: '0 28px' }}
          >
            ⬇️ تحميل
          </button>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
