import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <h4>صفحات عامة</h4>
          <nav>
            <Link to="/">الرئيسية</Link>
            <Link to="/category/الالكترونيات">الأقسام</Link>
            <Link to="/orders">الطلبات</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h4>السياسات</h4>
          <nav>
            <Link to="/privacy">سياسة الخصوصية</Link>
            <Link to="/terms">شروط الاستخدام</Link>
            <Link to="/returns">سياسة الإرجاع</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h4>الدعم</h4>
          <nav>
            <Link to="/forgot">نسيت كلمة المرور</Link>
            <Link to="/verify-otp">التحقق من الرمز</Link>
            <Link to="/reset-password">إعادة تعيين كلمة المرور</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h4>تواصل معنا</h4>
          <nav className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com" target="_blank" rel="noreferrer">X</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
          </nav>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 تاجر. جميع الحقوق محفوظة.</span>
        <div className="footer-mini-links">
          <Link to="/about">من نحن</Link>
          <Link to="/faq">الأسئلة الشائعة</Link>
          <Link to="/contact">اتصل بنا</Link>
        </div>
      </div>
    </footer>
  )
}
