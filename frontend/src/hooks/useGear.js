import { useState, useEffect } from 'react'
import { App } from 'antd'
import api from '../api/axios'

export const useGear = (filters = {}) => {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const fetchGear = (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    const params = {
      page,
      page_size: pageSize,
      ...filters
    }
    api.get('/gear', { params })
      .then(response => {
        setData(response.data.items)
        setPagination({
          current: response.data.page,
          pageSize: response.data.page_size,
          total: response.data.total
        })
      })
      .catch(error => {
        message.error('Не вдалося завантажити спорядження')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchGear(1, pagination.pageSize)
  }, [filters.type, filters.status])

  const createGear = (values) => {
    setSubmitLoading(true)
    // Виключаємо поля, які не потрібні для створення
    const { id, status, created_at, ...payload } = values || {}
    return api.post('/gear', payload)
      .then(() => {
        message.success('Спорядження успішно додано')
        fetchGear()
      })
      .catch(error => {
        message.error('Не вдалося додати спорядження')
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  const updateGear = (id, values) => {
    setSubmitLoading(true)
    // Виключаємо поля, які не потрібні для оновлення
    const { id: _, status, created_at, ...payload } = values || {}
    return api.put(`/gear/${id}`, payload)
      .then(() => {
        message.success('Спорядження оновлено')
        fetchGear()
      })
      .catch(error => {
        message.error('Не вдалося оновити спорядження')
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  const deleteGear = (id) => {
    return api.delete(`/gear/${id}`)
      .then(() => {
        message.success('Спорядження видалено')
        fetchGear()
      })
      .catch(error => {
        message.error('Не вдалося видалити спорядження')
        throw error
      })
  }

  return {
    data,
    loading,
    submitLoading,
    pagination,
    fetchGear,
    createGear,
    updateGear,
    deleteGear
  }
}
