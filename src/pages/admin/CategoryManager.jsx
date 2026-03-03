import React, { useEffect, useState } from 'react'
import CategoryTable from '../../components/admin/CategoryTable'
import DeleteCategoryModal from '../../components/admin/DeleteCategoryModal'
import CategoryFormModal from '../../components/admin/CategoryFormModal'
import CategoryForm from './CategoryForm'
import axios from 'axios'
import toast from "../../utils/toast"

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [isLoading , setIsLoading] = useState(true)
  const [formMode, setFormMode] = useState('create')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenCreate = () => {
    setFormMode('create')
    setSelectedCategory(null)
    setShowForm(true)
  }

  const handleEditCategory = (category) => {
    setFormMode('edit')
    setSelectedCategory(category)
    setShowForm(true)
  }

  const handleDeleteCategory = async(categoryId) => {
    try {
      const deletedCategory = await axios.delete(`http://localhost:3000/api/v1/category/${categoryId}`, {withCredentials: true})
      if (!deletedCategory) {
        toast("فشل حذف القسم", "error")
        return
      }
      toast("تم حذف القسم", "success")
      setCategories((prev) => prev.filter((item) => item._id !== categoryId))
    } catch (error) {
      console.log(error.message)
      toast("فشل حذف القسم", "error")
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return
    setIsDeleting(true)
    try {
      handleDeleteCategory(deletingCategory._id)
    } finally {
      setIsDeleting(false)
      setDeletingCategory(null)
    }
  }

  const createCategory = async (formData) => {
    // Prepare required create payload based on API multipart form-data contract.
    try {
      const categoryData = new FormData()
      categoryData.append('name', formData.name)
      categoryData.append('description', formData.description)
      if (formData.image instanceof File) {
        categoryData.append('image', formData.image)
      }

      console.log(formData)

      const category = await axios.post(
        'http://localhost:3000/api/v1/category',
        categoryData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } },
      )
      const createdCategory = category?.data?.data
      if (createdCategory) {
        setCategories((prev) => [ ...prev , createdCategory])
      }
      setShowForm(false)
    } catch (error) {
      console.log(error.message)
    }
  }

  const updateCategory = async (formData) => {
    // Prepare required update payload based on API multipart form-data contract.
    if (!selectedCategory?._id) return

    try {
      const categoryData = new FormData()
      categoryData.append('name', formData.name)
      categoryData.append('description', formData.description)

      if (formData.image instanceof File ) {
        categoryData.append('image', formData.image)
      } 

      const updated = await axios.patch(
        `http://localhost:3000/api/v1/category/${selectedCategory._id}`,
        categoryData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } },
      )
      const updatedCategory = updated?.data?.data
      if (updatedCategory) {
        setCategories((prev) =>
          prev.map((item) => (item._id === selectedCategory._id ? updatedCategory : item)),
        )
      }
      setShowForm(false)
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      // Fetch Get Request to get all categories
      try {
        const categories = await axios.get('http://localhost:3000/api/v1/category', { withCredentials: true })
        if (!categories) {
          setIsLoading(false)
        }
        else {
        setCategories(categories.data.data)
        setIsLoading(false)}
      } catch (error) {
        console.log(error.message)
        setIsLoading(false)
      }
    }
    fetchCategories()
  } , [])

  return (
    <section className="admin-stack">
      <div className="admin-card">
        <div className="category-manager-head">
          <div>
            <h2>إدارة الفئات</h2>
            <p className="admin-muted">إدارة بيانات الفئات طبقًا للمخطط المطلوب.</p>
          </div>

          <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenCreate}>
            + إضافة فئة جديدة
          </button>
        </div>

      
        {isLoading ? (
          <div className="category-loading-placeholder">جاري تحميل الفئات...</div>
        ) : (
          <CategoryTable
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={setDeletingCategory}
          />
        )}

          {categories.length === 0  && !isLoading && (
          <div className="category-empty-placeholder ">
            لا توجد فئات متاحة حاليا.
          </div>
        )}
      </div>

      <CategoryFormModal
        isOpen={showForm}
        title={formMode === 'edit' ? 'تعديل الفئة' : 'إنشاء فئة جديدة'}
        onClose={() => setShowForm(false)}
      >
        <CategoryForm
          mode={formMode}
          category={selectedCategory}
          onCreate={createCategory}
          onUpdate={updateCategory}
          onCancel={() => setShowForm(false)}
        />
      </CategoryFormModal>

      <DeleteCategoryModal
        isOpen={Boolean(deletingCategory)}
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        pending={isDeleting}
      />
    </section>
  )
}
