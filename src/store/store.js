import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import productAdminReducer from "./productAdminSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    productAdmin: productAdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["productAdmin.form.image"],
        ignoredActions: ["productAdmin/setProductFormImage"],
      },
    }),
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
