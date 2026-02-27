import { useState, useEffect } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, className = "w-5 h-5", stroke = 2, fill = "none" }) => (
  <svg className={className} fill={fill} stroke="currentColor" strokeWidth={stroke} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const ICONS = {
  menu:   "M4 6h16M4 12h16M4 18h16",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  bell:   "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  cart:   "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  close:  "M6 18L18 6M6 6l12 12",
  plus:   "M12 4v16m8-8H4",
  minus:  "M20 12H4",
  trash:  "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  check:  "M5 13l4 4L19 7",
  heart:  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  home:   "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  box:    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  tag:    "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
  chart:  "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  cog:    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  eye:    "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  chevron:"M9 5l7 7-7 7",
  star:   "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 1, icon: "home",  label: "الرئيسية",   badge: null },
  { id: 2, icon: "box",   label: "المنتجات",   badge: "جديد" },
  { id: 3, icon: "tag",   label: "العروض",     badge: "12" },
  { id: 4, icon: "heart", label: "المفضلة",    badge: null },
  { id: 5, icon: "chart", label: "الإحصائيات", badge: null },
  { id: 6, icon: "cog",   label: "الإعدادات",  badge: null },
];

const PRODUCTS = [
  { id: 1, name: "سماعات Nova Pro اللاسلكية",  price: 299,  oldPrice: 399,  cat: "إلكترونيات", rating: 4.8, reviews: 312, badge: "الأكثر مبيعاً", badgeColor: "#0b6ef6", accent: "#0b6ef6", emoji: "🎧" },
  { id: 2, name: "ساعة ذكية Apex Series 5",    price: 549,  oldPrice: 699,  cat: "إلكترونيات", rating: 4.6, reviews: 189, badge: "جديد",          badgeColor: "#7c3aed", accent: "#7c3aed", emoji: "⌚" },
  { id: 3, name: "حقيبة جلدية فاخرة Luxe",    price: 189,  oldPrice: null, cat: "أزياء",      rating: 4.9, reviews: 76,  badge: null,            badgeColor: null,      accent: "#92400e", emoji: "👜" },
  { id: 4, name: "نظارة شمسية Classic UV",     price: 125,  oldPrice: 165,  cat: "أزياء",      rating: 4.5, reviews: 410, badge: "خصم 25%",       badgeColor: "#dc2626", accent: "#059669", emoji: "🕶️" },
  { id: 5, name: "كاميرا Viso 4K Ultra",      price: 1299, oldPrice: 1599, cat: "إلكترونيات", rating: 4.7, reviews: 63,  badge: null,            badgeColor: null,      accent: "#dc2626", emoji: "📷" },
  { id: 6, name: "حذاء Air Runner Pro",        price: 219,  oldPrice: 279,  cat: "أحذية",      rating: 4.4, reviews: 278, badge: "محدود",         badgeColor: "#d97706", accent: "#0891b2", emoji: "👟" },
  { id: 7, name: "عطر Ocean Breeze 100ml",     price: 189,  oldPrice: 230,  cat: "عطور",       rating: 4.7, reviews: 524, badge: null,            badgeColor: null,      accent: "#0891b2", emoji: "🌊" },
  { id: 8, name: "لابتوب UltraBook Slim 14",   price: 3299, oldPrice: null, cat: "إلكترونيات", rating: 4.9, reviews: 92,  badge: "حصري",          badgeColor: "#059669", accent: "#1e40af", emoji: "💻" },
];

const STATS = [
  { label: "إجمالي المبيعات", value: "142,500", unit: "ر.س",  icon: "💰", color: "#0b6ef6", bg: "#eff6ff" },
  { label: "الطلبات اليوم",   value: "1,284",   unit: "طلب",  icon: "📦", color: "#7c3aed", bg: "#f5f3ff" },
  { label: "العملاء النشطين", value: "5,621",   unit: "عميل", icon: "👥", color: "#059669", bg: "#f0fdf4" },
  { label: "متوسط التقييم",   value: "4.8",     unit: "/ 5",  icon: "⭐", color: "#d97706", bg: "#fffbeb" },
];

// ─── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAdd }) {
  const [added,   setAdded]   = useState(false);
  const [liked,   setLiked]   = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl overflow-hidden border flex flex-col transition-all duration-300"
      style={{
        borderColor: hovered ? `${product.accent}50` : "#f1f5f9",
        boxShadow:   hovered ? `0 20px 40px -12px ${product.accent}28` : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Image area */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${product.accent}0e, ${product.accent}20)` }}
      >
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 400 50" preserveAspectRatio="none">
          <path d="M0 25 Q100 5 200 25 Q300 45 400 25 L400 50 L0 50Z" fill={product.accent} />
        </svg>

        <span
          className="text-7xl relative z-10 transition-transform duration-500 select-none"
          style={{ transform: hovered ? "scale(1.12) translateY(-4px)" : "scale(1)" }}
        >
          {product.emoji}
        </span>

        {/* Like btn */}
        <button
          onClick={() => setLiked(l => !l)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10"
        >
          <svg
            className={`w-4 h-4 transition-colors ${liked ? "text-red-500" : "text-gray-400"}`}
            fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.heart} />
          </svg>
        </button>

        {/* Quick view pill */}
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm z-10 transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(8px)" }}
        >
          <Icon d={ICONS.eye} className="w-3.5 h-3.5" />
          عرض سريع
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white leading-none" style={{ background: product.badgeColor }}>
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white leading-none">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: product.accent }}>
          {product.cat}
        </span>
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2 flex-1 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <Stars rating={product.rating} />
          <span className="text-xs font-semibold text-gray-600">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString("ar-SA")})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-gray-900">{product.price}</span>
            <span className="text-xs text-gray-500 font-semibold">ر.س</span>
          </div>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">{product.oldPrice} ر.س</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
          style={added
            ? { background: "#22c55e", color: "#fff" }
            : { background: `linear-gradient(135deg, ${product.accent}, ${product.accent}cc)`, color: "#fff" }
          }
        >
          {added
            ? <><Icon d={ICONS.check} className="w-4 h-4" stroke={2.5} /> تمت الإضافة!</>
            : <><Icon d={ICONS.cart}  className="w-4 h-4" /> أضف للسلة</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Cart Item ────────────────────────────────────────────────────────────────
function CartItem({ item, onRemove, onQty }) {
  return (
    <div className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50/50 transition-colors">
      <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl" style={{ background: `${item.accent}16` }}>
        {item.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: item.accent }}>{item.price} ر.س</p>
        <div className="flex items-center gap-2 mt-2" dir="ltr">
          <button onClick={() => onQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-lg border border-gray-200 bg-white hover:border-red-300 hover:text-red-500 flex items-center justify-center transition-colors">
            <Icon d={ICONS.minus} className="w-3 h-3" stroke={2.5} />
          </button>
          <span className="text-sm font-black text-gray-800 w-5 text-center tabular-nums">{item.qty}</span>
          <button onClick={() => onQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors">
            <Icon d={ICONS.plus} className="w-3 h-3 text-white" stroke={2.5} />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-sm font-black text-gray-900 tabular-nums">{(item.price * item.qty).toLocaleString("ar-SA")} ر.س</span>
        <button
          onClick={() => onRemove(item.id)}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        >
          <Icon d={ICONS.trash} className="w-3.5 h-3.5 text-red-500" stroke={1.8} />
        </button>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, items, onRemove, onQty }) {
  const total   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count   = items.reduce((s, i) => s + i.qty, 0);
  const savings = items.reduce((s, i) => s + (i.oldPrice ? (i.oldPrice - i.price) * i.qty : 0), 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? "bg-black/40 backdrop-blur-[2px]" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        dir="rtl"
        className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="relative px-5 py-4 flex items-center justify-between overflow-hidden" style={{ background: "linear-gradient(135deg, #0b6ef6 0%, #1e40af 100%)" }}>
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon d={ICONS.cart} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-base leading-tight">سلة المشتريات</h2>
              <p className="text-blue-200 text-xs mt-0.5">{count} قطعة · {items.length} منتج</p>
            </div>
          </div>

          <button onClick={onClose} className="relative z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <Icon d={ICONS.close} className="w-4 h-4 text-white" stroke={2.5} />
          </button>
        </div>

        {/* Savings pill */}
        {savings > 0 && (
          <div className="mx-4 mt-4 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 flex items-center gap-2">
            <span className="text-base">🎉</span>
            <p className="text-xs font-semibold text-green-700">
              وفّرت <span className="font-black">{savings} ر.س</span> في هذا الطلب!
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 pb-16">
              <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center">
                <span className="text-5xl opacity-40">🛒</span>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700 text-base">السلة فارغة</p>
                <p className="text-gray-400 text-sm mt-1">أضف منتجات لتبدأ التسوق</p>
              </div>
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-colors hover:opacity-90" style={{ background: "linear-gradient(135deg, #0b6ef6, #2563eb)" }}>
                تصفح المنتجات
              </button>
            </div>
          ) : items.map(item => (
            <CartItem key={item.id} item={item} onRemove={onRemove} onQty={onQty} />
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/80 space-y-3">
            {/* Coupon */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🏷️  كود الخصم"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-sm font-bold text-gray-700 transition-colors">
                تطبيق
              </button>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>المجموع الفرعي</span>
                <span className="font-semibold text-gray-700">{total.toLocaleString("ar-SA")} ر.س</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>رسوم الشحن</span>
                <span className="font-semibold text-green-600">مجاني ✓</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>الخصومات</span>
                  <span className="font-semibold text-red-500">-{savings} ر.س</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>الإجمالي</span>
                <span className="text-xl text-blue-600">{total.toLocaleString("ar-SA")} ر.س</span>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-blue-200" style={{ background: "linear-gradient(135deg, #0b6ef6, #1e40af)" }}>
              إتمام الشراء
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Trust */}
            <div className="flex justify-center gap-4">
              {["🔒 دفع آمن", "↩️ إرجاع مجاني", "🚀 شحن سريع"].map(t => (
                <span key={t} className="text-[10px] text-gray-400 font-medium">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose }) {
  const [active, setActive] = useState(2);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />}

      <aside
        dir="rtl"
        className={`
          fixed top-0 right-0 h-full z-30 bg-white border-l border-gray-100 flex flex-col
          transition-all duration-300 ease-in-out
          ${open ? "w-60 shadow-2xl" : "w-0 overflow-hidden lg:w-[72px] lg:overflow-visible"}
          lg:relative lg:right-auto lg:shadow-none
        `}
      >
        {/* Brand */}
        <div className={`h-16 border-b border-gray-100 flex items-center flex-shrink-0 gap-3 ${open ? "px-4" : "lg:justify-center lg:px-0 px-4"}`}>
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-lg" style={{ background: "linear-gradient(135deg, #0b6ef6, #1e40af)" }}>
            ت
          </div>
          <div className={`overflow-hidden transition-all duration-200 ${open ? "opacity-100" : "opacity-0 w-0"}`}>
            <p className="font-black text-gray-900 text-base whitespace-nowrap leading-tight">تاجر</p>
            <p className="text-[10px] text-gray-400 whitespace-nowrap">لوحة التحكم</p>
          </div>
        </div>

        {/* Section label */}
        <div className={`px-3 pt-5 pb-1.5 overflow-hidden transition-all ${open ? "opacity-100 h-auto" : "opacity-0 h-0"}`}>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase px-1">القائمة</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-1 space-y-0.5 overflow-hidden">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                relative w-full flex items-center rounded-xl transition-all duration-150 group
                ${open ? "gap-3 px-3 py-2.5" : "justify-center py-3 lg:py-3"}
                ${active === item.id
                  ? "text-white shadow-lg shadow-blue-200/50"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"}
              `}
              style={active === item.id ? { background: "linear-gradient(135deg, #0b6ef6, #2563eb)" } : {}}
            >
              {active === item.id && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-5 rounded-l-full bg-blue-600 hidden lg:block" />
              )}

              <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[item.icon]} />
              </svg>

              <span className={`text-sm font-semibold whitespace-nowrap flex-1 text-right transition-all duration-200 ${open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                {item.label}
              </span>

              {item.badge && open && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${active === item.id ? "bg-white/25 text-white" : "bg-blue-100 text-blue-600"}`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed desktop */}
              {!open && (
                <div className="absolute right-full mr-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl hidden lg:block">
                  {item.label}
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User card */}
        <div className={`m-2 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors flex-shrink-0 ${!open && "justify-center"}`}
          style={open ? { background: "linear-gradient(135deg, #eff6ff, #dbeafe50)" } : {}}>
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
            أ
          </div>
          <div className={`overflow-hidden transition-all duration-200 flex-1 min-w-0 ${open ? "opacity-100" : "opacity-0 w-0"}`}>
            <p className="text-sm font-bold text-gray-800 truncate whitespace-nowrap">أحمد العمري</p>
            <p className="text-[10px] text-gray-400 whitespace-nowrap">مدير المتجر</p>
          </div>
          {open && <Icon d={ICONS.chevron} className="w-4 h-4 text-gray-400 flex-shrink-0 rotate-180" stroke={2} />}
        </div>
      </aside>
    </>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onToggle, cartCount, onCart }) {
  const [q, setQ]             = useState("");
  const [focused, setFocused] = useState(false);
  const [notifOpen, setNotif] = useState(false);

  const NOTIFS = [
    { id: 1, text: "طلب جديد #1042 بانتظار الموافقة", time: "منذ 5 د",  dot: "bg-blue-500" },
    { id: 2, text: "المنتج 'سماعات Nova' نفد من المخزون", time: "منذ 22 د", dot: "bg-red-500" },
    { id: 3, text: "تقييم جديد ⭐⭐⭐⭐⭐ من عميل",         time: "منذ 1 س",  dot: "bg-green-500" },
  ];

  return (
    <header dir="rtl" className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-10 flex-shrink-0">
      {/* Hamburger */}
      <button onClick={onToggle} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0">
        <Icon d={ICONS.menu} className="w-5 h-5 text-gray-600" />
      </button>

      {/* Search */}
      <div className={`relative transition-all duration-300 ${focused ? "flex-[2]" : "flex-1"} max-w-sm`}>
        <Icon d={ICONS.search} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="ابحث عن منتج..."
          className="w-full h-9 pr-9 pl-4 rounded-xl bg-gray-50 border border-transparent focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-50 text-sm outline-none transition-all"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <Icon d={ICONS.close} className="w-3.5 h-3.5" stroke={2.5} />
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotif(v => !v)}
            className="relative w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <Icon d={ICONS.bell} className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {notifOpen && (
            <div dir="rtl" className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="font-bold text-gray-800 text-sm">الإشعارات</p>
                <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">3 جديد</span>
              </div>
              {NOTIFS.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 border-b border-gray-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5">
                <button className="w-full text-xs font-semibold text-blue-600 hover:text-blue-800">عرض كل الإشعارات</button>
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <button
          onClick={onCart}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:shadow-md hover:shadow-blue-200 active:scale-95"
          style={{ background: "linear-gradient(135deg, #0b6ef6, #2563eb)" }}
        >
          <Icon d={ICONS.cart} className="w-5 h-5 text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white animate-bounce">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-gray-200 mx-0.5" />

        {/* User */}
        <button className="flex items-center gap-2 px-2 h-9 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
            أ
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">أحمد</span>
          <Icon d={ICONS.chevron} className="w-3.5 h-3.5 text-gray-400 rotate-90" stroke={2} />
        </button>
      </div>
    </header>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [cart,        setCart]        = useState([]);
  const [catFilter,   setCatFilter]   = useState("الكل");
  const [sortBy,      setSortBy]      = useState("افتراضي");

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const addToCart = product => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      return ex
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = id => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cats = ["الكل", ...new Set(PRODUCTS.map(p => p.cat))];

  let filtered = catFilter === "الكل" ? PRODUCTS : PRODUCTS.filter(p => p.cat === catFilter);
  if (sortBy === "السعر: الأقل")  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "السعر: الأعلى") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "التقييم")        filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div dir="rtl" className="flex h-screen bg-[#f5f7fb] overflow-hidden" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onToggle={() => setSidebarOpen(v => !v)}
          cartCount={cartCount}
          onCart={() => setCartOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-5 sm:px-6 pt-6 pb-4">

            {/* Page header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">مرحباً، أحمد 👋</h1>
                <p className="text-sm text-gray-400 mt-0.5">إليك ملخص متجرك اليوم</p>
              </div>
              <button className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95" style={{ background: "linear-gradient(135deg, #0b6ef6, #2563eb)" }}>
                + إضافة منتج
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {STATS.map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 cursor-default group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform" style={{ background: s.bg }}>
                      {s.icon}
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">↑ 12%</span>
                  </div>
                  <p className="font-black tabular-nums leading-none" style={{ color: s.color }}>
                    <span className="text-xl sm:text-2xl">{s.value}</span>
                    <span className="text-sm font-bold mr-1 text-gray-400">{s.unit}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter + Sort bar */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                {cats.map(c => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(c)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                      catFilter === c
                        ? "text-white shadow-md shadow-blue-200"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                    style={catFilter === c ? { background: "linear-gradient(135deg, #0b6ef6, #2563eb)" } : {}}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 outline-none focus:border-blue-400 cursor-pointer"
              >
                {["افتراضي", "السعر: الأقل", "السعر: الأعلى", "التقييم"].map(o => <option key={o}>{o}</option>)}
              </select>

              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{filtered.length} منتج</span>
            </div>
          </div>

          {/* Products grid */}
          <div className="px-5 sm:px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
          </div>
        </main>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onRemove={removeFromCart} onQty={updateQty} />
    </div>
  );
}
