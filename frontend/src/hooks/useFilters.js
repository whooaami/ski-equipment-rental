import { useState, useMemo } from 'react'

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters)

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters(initialFilters)
  }

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== null && value !== undefined && value !== '')
  }, [filters])

  return {
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters
  }
}
