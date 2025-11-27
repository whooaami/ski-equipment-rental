import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Empty } from 'antd'

function DayOfWeekChart({ data }) {
  if (!data || data.length === 0) {
    return <Empty description="Немає даних для відображення" />
  }

  // Сортувати дані по дню тижня (Понеділок першим)
  // PostgreSQL: 0=Sunday, 1=Monday, ..., 6=Saturday
  // Переробляємо так щоб 1=Monday був першим
  const sortedData = [...data].sort((a, b) => {
    const dayA = a.day_of_week === 0 ? 7 : a.day_of_week // Sunday в кінець
    const dayB = b.day_of_week === 0 ? 7 : b.day_of_week
    return dayA - dayB
  })

  const formatCurrency = (value) => {
    return `${value.toFixed(2)} грн`
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day_name"
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis yAxisId="left" orientation="left" stroke="#1890ff" />
        <YAxis yAxisId="right" orientation="right" stroke="#52c41a" />
        <Tooltip formatter={(value, name) => {
          if (name === 'Виручка') return formatCurrency(value)
          return value
        }} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="rental_count"
          fill="#1890ff"
          name="Кількість орend"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="revenue"
          fill="#52c41a"
          name="Виручка"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default DayOfWeekChart
