// QrCodeCanvas.jsx
// Renders a base64 QR code image with an optional branded print button

export default function QrCodeCanvas({ value, size = 64, className = '', productName = '', showPrint = true }) {
  if (!value) return null

  const src = typeof value === 'string'
    ? (value.startsWith('data:') ? value : `data:image/png;base64,${value.trim()}`)
    : null

  if (!src) return null

  const handlePrint = () => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none'
    document.body.appendChild(iframe)

    iframe.contentDocument.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }

          @page {
            size: 80mm 60mm;
            margin: 0;
          }

          body {
            width: 80mm;
            height: 60mm;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #fff;
          }

          .card {
            width: 74mm;
            height: 54mm;
            border: 1.5px solid #16a34a;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 4mm 4mm 3mm;
            position: relative;
            overflow: hidden;
          }

          .card::before {
            content: '';
            position: absolute;
            top: 0; right: 0;
            width: 14mm; height: 14mm;
            background: #16a34a;
            clip-path: polygon(100% 0, 0 0, 100% 100%);
          }

          .brand {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .brand-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #16a34a;
            flex-shrink: 0;
          }

          .brand-name {
            font-size: 9pt;
            font-weight: 800;
            color: #16a34a;
            letter-spacing: .5px;
            text-transform: uppercase;
          }

          .brand-tagline {
            font-size: 6pt;
            color: #94a3b8;
            margin-right: auto;
          }

          .qr-wrap {
            padding: 3mm;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            line-height: 0;
          }

          .qr-wrap img {
            width: 28mm;
            height: 28mm;
            image-rendering: pixelated;
            display: block;
          }

          .product-name {
            font-size: 8pt;
            font-weight: 700;
            color: #0f172a;
            text-align: center;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .footer {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-top: 1px dashed #e2e8f0;
            padding-top: 2mm;
          }

          .footer-text {
            font-size: 6pt;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">
            <div class="brand-dot"></div>
            <span class="brand-name">Tagger</span>
            <span class="brand-tagline">نظام إدارة المخزون</span>
          </div>

          <div class="qr-wrap">
            <img src="${src}" alt="QR Code" />
          </div>

          <div class="product-name">${productName || 'منتج'}</div>

          <div class="footer">
            <span class="footer-text">امسح الكود للتحقق من المنتج</span>
          </div>
        </div>
      </body>
      </html>
    `)

    iframe.contentDocument.close()
    iframe.contentWindow.focus()

    // Wait for image inside iframe to load before printing
    setTimeout(() => {
      iframe.contentWindow.print()
      setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe)
      }, 1500)
    }, 500)
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <img
        src={src}
        alt="QR Code"
        width={size}
        height={size}
        className={className}
        style={{ imageRendering: 'pixelated', display: 'block' }}
        draggable={false}
      />

      {showPrint && (
        <button
          onClick={handlePrint}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 7,
            border: '1.5px solid rgba(22,163,74,.25)',
            background: '#f0fdf4', color: '#16a34a',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = 'rgba(22,163,74,.5)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = 'rgba(22,163,74,.25)' }}
        >
          🖨 طباعة
        </button>
      )}
    </div>
  )
}
