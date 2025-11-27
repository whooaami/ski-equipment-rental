import { useState, useEffect } from 'react'
import { App } from 'antd'
import api from '../api/axios'

export const useRentals = (statusFilter = 'all') => {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const fetchRentals = (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true)
    const params = {
      page,
      page_size: pageSize,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {})
    }
    api.get('/rentals', { params })
      .then(response => {
        setData(response.data.items)
        setPagination({
          current: response.data.page,
          pageSize: response.data.page_size,
          total: response.data.total
        })
      })
      .catch(error => {
        message.error('Не вдалося завантажити оренди')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchRentals(1, pagination.pageSize)
  }, [statusFilter])

  const createRental = (values) => {
    setSubmitLoading(true)
    // Виключаємо поля, які не потрібні для створення
    const { id, created_at, ...payload } = values || {}
    return api.post('/rentals', payload)
      .then(() => {
        message.success('Оренду успішно створено')
        fetchRentals()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося створити оренду'
        message.error(errorMsg)
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  const returnRental = (id, values) => {
    setSubmitLoading(true)
    return api.post(`/rentals/${id}/return`, values)
      .then(() => {
        message.success('Спорядження успішно повернуто')
        fetchRentals()
      })
      .catch(error => {
        const errorMsg = error.response?.data?.detail || 'Не вдалося повернути спорядження'
        message.error(errorMsg)
        throw error
      })
      .finally(() => {
        setSubmitLoading(false)
      })
  }

  return {
    data,
    loading,
    submitLoading,
    pagination,
    fetchRentals,
    createRental,
    returnRental
  }
}
