import React from 'react'
import "./HowItWorks.css"

const STEPS = [
  {
    step: '01',
    icon: '🔍',
    title: 'تصفح المنتجات',
    desc: 'استعرض الفئات واختر ما يناسبك من آلاف المنتجات المتاحة.',
  },
  {
    step: '02',
    icon: '🛒',
    title: 'أضف إلى السلة',
    desc: 'أضف المنتجات لسلتك واستفد من الخصومات التلقائية عند زيادة الكمية.',
  },
  {
    step: '03',
    icon: '🏷️',
    title: 'طبّق كوبون الخصم',
    desc: 'أدخل كود الكوبون للحصول على خصم إضافي قبل إتمام الطلب.',
  },
  {
    step: '04',
    icon: '📦',
    title: 'استلم طلبك',
    desc: 'أكمل الطلب وانتظر وصوله إليك بشحن سريع وآمن.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-section section container" dir="rtl">
      <header className="how-header">
        <h3 className="how-title">كيف يعمل المتجر؟</h3>
        <span className="home-category-accent" />
        <p className="how-subtitle">أربع خطوات بسيطة للحصول على ما تحتاجه</p>
      </header>

      <div className="how-steps">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.step}>
            <div className="how-step-card">
              <div className="how-step-number">{s.step}</div>
              <div className="how-step-icon">{s.icon}</div>
              <h4 className="how-step-title">{s.title}</h4>
              <p className="how-step-desc">{s.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="how-step-arrow" aria-hidden="true">←</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  )
}
