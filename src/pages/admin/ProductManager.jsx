import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from "../../utils/toast"
import axios from 'axios'
import ProductTable from '../../components/admin/ProductTable'
import ProductFilters, { filterAndSortProducts, initialProductFilters } from '../../components/admin/ProductFilters'
import ProductPagination from '../../components/admin/ProductPagination'
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal'
import CategoryFormModal from '../../components/admin/CategoryFormModal'
import ProductForm from './ProductForm'
import {
  addProduct,
  closeCreateProductForm,
  closeEditProductForm,
  openCreateProductForm,
  openEditProductForm,
  removeProductById,
  setCategories,
  setCompanies,
  setProducts,
  setCategoriesLoading,
  setCompaniesLoading,
  setDeletingProduct,
  setIsDeleting,
  updateProduct,
} from '../../store/productAdminSlice'
import { companyApi } from '../../utils/companyApi'

export default function ProductManager() {
  const dispatch = useDispatch()
  const {
    categories,
    categoriesLoading,
    companies,
    companiesLoading,
    products,
    selectedProduct,
    showCreateForm,
    deletingProduct,
    isDeleting,
  } = useSelector((state) => state.productAdmin)

  const [filters, setFilters] = useState(initialProductFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)






  const handleDelete = async (productId) => {
    // Placeholder only: integrate real API delete request in your data layer.
    try {
      const deleteProduct = await axios.delete(`/api/v1/product/${productId}`, {
        withCredentials: true,
      })
      if (!deleteProduct?.data?.data) {
        toast('فشل حذف المنتج', 'error')
        return
      }
      setTotalItems((prev) => prev - 1)
      toast('تم حذف المنتج', 'success')
      dispatch(removeProductById(productId))
    } catch (error) {
      console.log(error.message)
      toast('فشل حذف المنتج', 'error')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return
    dispatch(setIsDeleting(true))
    try {
      handleDelete(deletingProduct._id)
    } finally {
      dispatch(setIsDeleting(false))
      dispatch(setDeletingProduct(null))
    }
  }

  const handleCreateProduct = async (formData) => {
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('category', formData.category)
      data.append('company', formData.company)
      data.append('price', String(formData.price))

      if (formData.image instanceof File) {
        data.append('image', formData.image)
      }

      const created = await axios.post('/api/v1/product', data, {
        withCredentials: true,
      })
      const createdProduct = created?.data?.data
      if (!createdProduct) {
        toast('فشل انشاء المنتج', 'error')
        dispatch(closeCreateProductForm())
        return
      }
      setTotalItems((prev) => prev + 1)
      dispatch(addProduct(createdProduct))
      toast('تم انشاء المنتج', 'success')
      if (showCreateForm) dispatch(closeCreateProductForm())
    } catch (error) {
      console.log(error)
    }
  }

  const handleUpdateProduct = async (formData) => {
    // Placeholder only: integrate real API update request in your data layer.
    if (!selectedProduct?._id) return

    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    data.append('category', formData.category)
    data.append('company', formData.company)
    data.append('price', String(formData.price))
    if (formData.image instanceof File) {
      data.append('image', formData.image)
    }

    const updatedProduct = await axios.patch(
      `/api/v1/product/${selectedProduct._id}`,
      data,
      { withCredentials: true }
    )

    if (!updatedProduct?.data?.data) {
      toast('فشل تحديث المنتج', 'error')
      dispatch(closeEditProductForm())
      return
    }

    toast('تم تحديث المنتج', 'success')
    dispatch(closeEditProductForm())

    const nextProduct = updatedProduct.data.data
    dispatch(updateProduct({ productId: selectedProduct._id, updatedProduct: nextProduct }))
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        dispatch(setCategoriesLoading(true))
        const categoriesRes = await axios.get('/api/v1/category', { withCredentials: true })
        dispatch(setCategories(categoriesRes?.data?.data || []))
      } catch (error) {
        console.log(error.message)
        dispatch(setCategories([]))
      } finally {
        dispatch(setCategoriesLoading(false))
      }
    }

    const fetchCompanies = async () => {
      try {
        dispatch(setCompaniesLoading(true))
        const companies = await companyApi.getAllCompanies()
        dispatch(setCompanies(companies || []))
      } catch (error) {
        console.log(error.message)
        dispatch(setCompanies([]))
      } finally {
        dispatch(setCompaniesLoading(false))
      }
    }

    fetchCategories()
    fetchCompanies()
  }, [dispatch])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams()

        params.set('page', String(Math.max(1, Number(page) || 1)))
        params.set('limit', String(Number(pageSize) || 5))

        if (filters.minPrice !== '') params.set('minPrice', String(filters.minPrice))
        if (filters.maxPrice !== '') params.set('maxPrice', String(filters.maxPrice))
        if (filters.sortBy) params.set('sortBy', String(filters.sortBy))
        if (filters.sortOrder) params.set('sortOrder', String(filters.sortOrder))

        // Backend expects category to be a Mongo ObjectId when present.
        if (filters.categoryId) params.set('category', String(filters.categoryId))

        const productsRes = await axios.get(`/api/v1/product/?${params.toString()}`, {
          withCredentials: true,
        })

        const payload = productsRes?.data?.data

        // Support common response shapes:
        // 1) { data: { products: [], count: number } }
        // 2) { data: { data: [], count: number } }
        // 3) { data: [] }
        const fetchedProducts = Array.isArray(payload) ? payload : payload?.products || payload?.data || []
        const nextCount = payload?.count || 0
        dispatch(setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []))
        setTotalItems(nextCount)
        setTotalPages(Math.max(1, Math.ceil(nextCount / (Number(pageSize) || 5))))

      } catch (error) {
        console.log(error.message)
        dispatch(setProducts([]))
        setTotalItems(0)
        setTotalPages(1)
      }
    }

    fetchProducts()
  }, [dispatch, page, pageSize, filters])

  useEffect(() => {
    setPage(1)
  }, [filters, pageSize])




  return (
    <section className="admin-stack">
      <div className="admin-card">
        <div className="product-manager-head">
          <div className="admin-section-head">
            <h2>إدارة المنتجات</h2>
            <p className="admin-muted">عرض جميع المنتجات مع خيارات التعديل والحذف.</p>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              if (showCreateForm) {
                dispatch(closeCreateProductForm())
              } else {
                dispatch(openCreateProductForm())
              }
            }}
          >
            {showCreateForm ? 'إخفاء نموذج الإضافة' : '+ إضافة منتج جديد'}
          </button>
        </div>

        {categoriesLoading ? (
          <div className="category-loading-placeholder">جاري تحميل التصنيفات...</div>
        ) : null}

        <ProductFilters
          categories={categories}
          value={filters}
          onChange={setFilters}
          onReset={() => setFilters(initialProductFilters)}
        />

        <ProductTable
          products={products}
          categories={categories}
          onEdit={(product) => dispatch(openEditProductForm(product))}
          onDelete={(product) => dispatch(setDeletingProduct(product))}
        />

        <ProductPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <CategoryFormModal
        isOpen={showCreateForm}
        title="إضافة منتج جديد"
        onClose={() => dispatch(closeCreateProductForm())}
      >
        <ProductForm
          mode="create"
          product={null}
          categories={categories}
          companies={companies}
          onSubmit={handleCreateProduct}
          onCancel={() => dispatch(closeCreateProductForm())}
        />
      </CategoryFormModal>

      <CategoryFormModal
        isOpen={Boolean(selectedProduct)}
        title="تعديل المنتج"
        onClose={() => dispatch(closeEditProductForm())}
      >
        <ProductForm
          mode="edit"
          product={selectedProduct}
          categories={categories}
          companies={companies}
          onSubmit={handleUpdateProduct}
          onCancel={() => dispatch(closeEditProductForm())}
        />
      </CategoryFormModal>

      <DeleteConfirmModal
        isOpen={Boolean(deletingProduct)}
        onCancel={() => dispatch(setDeletingProduct(null))}
        onConfirm={handleConfirmDelete}
        pending={isDeleting}
      />
    </section>
  )
}
