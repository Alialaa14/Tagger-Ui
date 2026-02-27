import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

const store = configureStore({
  reducer: { cart: cartReducer },
});

// persist to localStorage on changes
store.subscribe(() => {
  try {
    const state = store.getState().cart;
    localStorage.setItem("cart_state", JSON.stringify(state));
  } catch (e) {
    /* ignore */
  }
});

export default store;
