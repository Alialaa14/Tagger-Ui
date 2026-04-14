import { createSlice } from "@reduxjs/toolkit";

const initialProducts = [];

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  company: "",
  discounts: [],
  image: null,
  previewUrl: "",
};

function toCategoryValue(category) {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category._id || category.id || "";
}

function toCompanyValue(company) {
  if (!company) return "";
  if (typeof company === "string") return company;
  return company._id || company.id || "";
}

function toDiscounts(discount) {
  if (!Array.isArray(discount)) return [];
  return discount.map((item) => ({
    quantity: item.quantity != null ? Number(item.quantity) : 0,
    discountValue: item.discountValue != null ? Number(item.discountValue) : 0,
  }));
}

function formFromProduct(product) {
  return {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price != null ? Number(product.price) : "",
    category: toCategoryValue(product?.category),
    company: toCompanyValue(product?.company),
    discounts: toDiscounts(product?.discount),
    image: null,
    previewUrl: product?.image?.url || "",
  };
}

const productAdminSlice = createSlice({
  name: "productAdmin",
  initialState: {
    categories: [],
    categoriesLoading: false,
    companies: [],
    companiesLoading: false,
    products: initialProducts,
    selectedProduct: null,
    showCreateForm: false,
    deletingProduct: null,
    isDeleting: false,
    isSubmitting: false,
    form: initialForm,
  },
  reducers: {
    setCategories(state, action) {
      state.categories = Array.isArray(action.payload) ? action.payload : [];
    },
    setCompanies(state, action) {
      state.companies = Array.isArray(action.payload) ? action.payload : [];
    },
    setProducts(state, action) {
      state.products = Array.isArray(action.payload) ? action.payload : [];
    },
    setCategoriesLoading(state, action) {
      state.categoriesLoading = Boolean(action.payload);
    },
    setCompaniesLoading(state, action) {
      state.companiesLoading = Boolean(action.payload);
    },
    openCreateProductForm(state) {
      state.showCreateForm = true;
      state.selectedProduct = null;
      state.isSubmitting = false;
      state.form = { ...initialForm };
    },
    closeCreateProductForm(state) {
      state.showCreateForm = false;
      state.isSubmitting = false;
      state.form = { ...initialForm };
    },
    openEditProductForm(state, action) {
      const product = action.payload;
      state.showCreateForm = false;
      state.selectedProduct = product || null;
      state.isSubmitting = false;
      state.form = formFromProduct(product);
    },
    closeEditProductForm(state) {
      state.selectedProduct = null;
      state.isSubmitting = false;
      state.form = { ...initialForm };
    },
    setDeletingProduct(state, action) {
      state.deletingProduct = action.payload || null;
    },
    setIsDeleting(state, action) {
      state.isDeleting = Boolean(action.payload);
    },
    setProductSubmitting(state, action) {
      state.isSubmitting = Boolean(action.payload);
    },
    removeProductById(state, action) {
      const productId = action.payload;
      state.products = state.products.filter(
        (product) => product._id !== productId,
      );
      if (state.selectedProduct?._id === productId) {
        state.selectedProduct = null;
        state.form = { ...initialForm };
      }
    },
    addProduct(state, action) {
      state.products.unshift(action.payload);
      state.showCreateForm = false;
      state.isSubmitting = false;
      state.form = { ...initialForm };
    },
    updateProduct(state, action) {
      const { productId, updatedProduct } = action.payload;
      state.products = state.products.map((product) =>
        product._id === productId ? updatedProduct : product,
      );
      state.selectedProduct = null;
      state.isSubmitting = false;
      state.form = { ...initialForm };
      console.log(state.products);
    },
    setProductFormField(state, action) {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    setProductFormImage(state, action) {
      const { file, previewUrl } = action.payload;
      state.form.image = file || null;
      state.form.previewUrl = previewUrl || "";
    },
    addProductDiscountRow(state) {
      state.form.discounts.push({ quantity: "", discountValue: "" });
    },
    removeProductDiscountRow(state, action) {
      const index = action.payload;
      state.form.discounts = state.form.discounts.filter((_, i) => i !== index);
    },
    updateProductDiscountRow(state, action) {
      const { index, field, value } = action.payload;
      state.form.discounts = state.form.discounts.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      );
    },
  },
});

export const {
  setCategories,
  setCompanies,
  setProducts,
  setCategoriesLoading,
  setCompaniesLoading,
  openCreateProductForm,
  closeCreateProductForm,
  openEditProductForm,
  closeEditProductForm,
  setDeletingProduct,
  setIsDeleting,
  setProductSubmitting,
  removeProductById,
  addProduct,
  updateProduct,
  setProductFormField,
  setProductFormImage,
  addProductDiscountRow,
  removeProductDiscountRow,
  updateProductDiscountRow,
} = productAdminSlice.actions;

export default productAdminSlice.reducer;
