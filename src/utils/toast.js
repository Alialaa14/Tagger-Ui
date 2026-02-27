// Simple DOM-based toast utility (no external deps)
const CONTAINER_ID = "app-toast-container";

function ensureContainer() {
  let c = document.getElementById(CONTAINER_ID);
  if (!c) {
    c = document.createElement("div");
    c.id = CONTAINER_ID;
    c.className = "toast-container";
    document.body.appendChild(c);
  }
  return c;
}

export function toast(message, type = "error", ttl = 4000) {
  if (typeof document === "undefined") return;
  const c = ensureContainer();
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  c.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
  }, ttl - 300);
  setTimeout(() => el.remove(), ttl);
}

export default toast;
