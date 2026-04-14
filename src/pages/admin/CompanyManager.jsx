import React, { useEffect, useState } from 'react'
import CompanyTable from '../../components/admin/CompanyTable'
import CompanyFormModal from '../../components/admin/CompanyFormModal'
import { companyApi } from '../../utils/companyApi'
import toast from '../../utils/toast'

export default function CompanyManager() {
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const data = await companyApi.getAllCompanies()
      setCompanies(data || [])
    } catch (error) {
      toast('فشل تحميل الشركات', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCompany(null)
    setShowModal(true)
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    setShowModal(true)
  }

  const handleSave = async (formData) => {
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      if (formData.logoFile) {
        data.append('logo', formData.logoFile)
      }

      if (editingCompany) {
        await companyApi.updateCompany(editingCompany._id, data)
        toast('تم تحديث الشركة بنجاح', 'success')
      } else {
        await companyApi.createCompany(data)
        toast('تم إضافة الشركة بنجاح', 'success')
      }
      setShowModal(false)
      fetchCompanies()
    } catch (error) {
      toast(editingCompany ? 'فشل التحديث' : 'فشل إضافة الشركة', 'error')
    }
  }

  const handleToggle = async (id) => {
    try {
      await companyApi.toggleCompany(id)
      setCompanies(prev => prev.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c))
      toast('تم تغيير الحالة', 'success')
    } catch (error) {
      toast('فشل تغيير الحالة', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشركة؟')) return
    try {
      await companyApi.deleteCompany(id)
      setCompanies(prev => prev.filter(c => c._id !== id))
      toast('تم حذف الشركة بنجاح', 'success')
    } catch (error) {
      toast('فشل حذف الشركة', 'error')
    }
  }

  return (
    <section className="admin-stack">
      <div className="admin-card">
        <div className="category-manager-head">
          <div>
            <h2>إدارة الشركات (Brands)</h2>
            <p className="admin-muted">إضافة وإدارة العلامات التجارية لتصنيف المنتجات.</p>
          </div>

          <button type="button" className="admin-btn admin-btn-primary" onClick={handleCreate}>
            + إضافة شركة جديدة
          </button>
        </div>

        {isLoading ? (
          <div className="category-loading-placeholder">جاري تحميل البيانات...</div>
        ) : (
          <CompanyTable
            companies={companies}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        )}

        {companies.length === 0 && !isLoading && (
          <div className="category-empty-placeholder">
            لا توجد شركات مضافة حالياً.
          </div>
        )}
      </div>

      <CompanyFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editingCompany}
      />
    </section>
  )
}
