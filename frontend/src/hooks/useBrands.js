import { useState, useEffect } from 'react'
import { App } from 'antd'
import api from '../api/axios'

export const useBrands = () => {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const fetchBrands = (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    const params = {
      page,
      page_size: pageSize
    }
    api.get('/brands', { params })
      .then(response => {
        setData(response.data.items)
        setPagination({
          current: response.data.page,
          pageSize: response.data.page_size,
          total: response.data.total
        })
      })
      .catch(error => {
        message.error('Не вдалося завантажити бренди')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const createBrand = (values) => {
    setSubmitLoading(true)
    // Виключаємо поля, які не потрібні для створення
    const { id, created_at, ...payload } = values || {}
    return api.post('/brands', payload)
      .then(() => {
        message.success('Бренд успішно додано')
        fetchBrands()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося додати бренд'
        message.error(errorMsg)
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  const updateBrand = (id, values) => {
    setSubmitLoading(true)
    // Виключаємо поля, які не потрібні для оновлення
    const { id: _, created_at, ...payload } = values || {}
    return api.put(`/brands/${id}`, payload)
      .then(() => {
        message.success('Бренд оновлено')
        fetchBrands()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося оновити бренд'
        message.error(errorMsg)
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  const deleteBrand = (id) => {
    return api.delete(`/brands/${id}`)
      .then(() => {
        message.success('Бренд видалено')
        fetchBrands()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося видалити бренд'
        message.error(errorMsg)
        throw error
      })
  }

  return {
    data,
    loading,
    submitLoading,
    pagination,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand
  }
}
