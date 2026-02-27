import { createSlice } from "@reduxjs/toolkit";
import productsSeed from "../data/seed_products";

const loadState = () => {
  try {
    const s = localStorage.getItem("cart_state");
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
};

const initialState = loadState() || {
  open: false,
  items: [],
  note: "",
  coupon: null,
};

const findByName = (items, name) => items.find((i) => i.product.name === name);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggle(state) {
      state.open = !state.open;
    },
    open(state) {
      state.open = true;
    },
    close(state) {
      state.open = false;
    },
    add(state, action) {
      const prod = action.payload.product;
      const quantity = action.payload.quantity || 1;
      const existing = findByName(state.items, prod.name);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.unshift({ product: prod, quantity });
      }
      state.open = true;
    },
    increment(state, action) {
      const name = action.payload;
      const item = findByName(state.items, name);
      if (item) item.quantity += 1;
    },
    decrement(state, action) {
      const name = action.payload;
      const item = findByName(state.items, name);
      if (item) item.quantity = Math.max(1, item.quantity - 1);
    },
    remove(state, action) {
      const name = action.payload;
      state.items = state.items.filter((i) => i.product.name !== name);
    },
    setNote(state, action) {
      state.note = action.payload;
    },
    applyCoupon(state, action) {
      state.coupon = action.payload;
    },
    clear(state) {
      state.open = false;
      state.items = [];
      state.note = "";
      state.coupon = null;
    },
  },
});

export const {
  toggle,
  open,
  close,
  add,
  increment,
  decrement,
  remove,
  setNote,
  applyCoupon,
  clear,
} = cartSlice.actions;

export function selectCart(state) {
  const items = state.cart.items || [];
  const totals = items.reduce(
    (acc, i) => {
      acc.totalQuantity += i.quantity;
      acc.totalPrice += (i.product.price || 0) * i.quantity;
      return acc;
    },
    { totalQuantity: 0, totalPrice: 0 },
  );
  const finalPrice = state.cart.coupon
    ? Math.max(0, totals.totalPrice - (state.cart.coupon.value || 0))
    : totals.totalPrice;
  return { ...state.cart, totals: { ...totals, finalPrice } };
}

export default cartSlice.reducer;
