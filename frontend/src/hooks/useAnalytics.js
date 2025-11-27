import { useState, useEffect } from 'react'
import { App } from 'antd'
import api from '../api/axios'

export const useDashboardStats = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = () => {
    setLoading(true)
    api.get('/analytics/dashboard')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити статистику')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { data, loading, refetch: fetchStats }
}

export const usePopularEquipment = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/equipment/popular')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити дані спорядження')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useTopCustomers = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/customers/top')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити дані клієнтів')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useRevenueData = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/revenue')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити дані виручки')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useOverdueRentals = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/overdue')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити прострочені оренди')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useBrandAnalytics = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/brands/performance')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити аналітику брендів')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useTimePatterns = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/rentals/time-patterns')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити часові паттерни')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useIdleEquipment = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/equipment/idle')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити дані про простоюче спорядження')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useCustomerSegmentation = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/customers/segmentation')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити сегментацію клієнтів')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}

export const useProblematicCustomers = () => {
  const { message } = App.useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    api.get('/analytics/customers/problematic')
      .then(response => {
        setData(response.data)
      })
      .catch(error => {
        message.error('Не вдалося завантажити проблемних клієнтів')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { data, loading, refetch: fetchData }
}
