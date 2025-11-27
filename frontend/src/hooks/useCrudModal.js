import { useState } from 'react'
import { Form } from 'antd'

export const useCrudModal = () => {
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const openCreateModal = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const openEditModal = (record) => {
    setEditingItem(record)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingItem(null)
  }

  return {
    form,
    isModalOpen,
    editingItem,
    openCreateModal,
    openEditModal,
    closeModal
  }
}
