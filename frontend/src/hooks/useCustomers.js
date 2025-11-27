import { useState, useEffect } from 'react'
import { App } from 'antd'
import api from '../api/axios'

export const useCustomers = (searchQuery = '') => {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const fetchCustomers = (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    const params = {
      page,
      page_size: pageSize,
      ...(searchQuery ? { search: searchQuery } : {})
    }
    api.get('/customers', { params })
      .then(response => {
        setData(response.data.items)
        setPagination({
          current: response.data.page,
          pageSize: response.data.page_size,
          total: response.data.total
        })
      })
      .catch(error => {
        message.error('Не вдалося завантажити клієнтів')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCustomers(1, pagination.pageSize)
  }, [searchQuery])

  const createCustomer = (values) => {
    setSubmitLoading(true)
    // Виключаємо поля, які не потрібні для створення
    const { id, created_at, ...payload } = values || {}
    return api.post('/customers', payload)
      .then(() => {
        message.success('Клієнта успішно додано')
        fetchCustomers()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося додати клієнта'
        message.error(errorMsg)
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  const updateCustomer = (id, values) => {
    setSubmitLoading(true)
    // Виключаємо поля, які не потрібні для оновлення
    const { id: _, created_at, ...payload } = values || {}
    return api.put(`/customers/${id}`, payload)
      .then(() => {
        message.success('Клієнта оновлено')
        fetchCustomers()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося оновити клієнта'
        message.error(errorMsg)
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  const deleteCustomer = (id) => {
    return api.delete(`/customers/${id}`)
      .then(() => {
        message.success('Клієнта видалено')
        fetchCustomers()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося видалити клієнта'
        message.error(errorMsg)
        throw error
      })
  }

  return {
    data,
    loading,
    submitLoading,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
}
