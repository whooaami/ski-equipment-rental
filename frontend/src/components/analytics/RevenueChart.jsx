import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Empty } from 'antd'

function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return <Empty description="Немає даних для відображення" />
  }

  // Форматування дати для осі X
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  // Форматування грошей для tooltip
  const formatCurrency = (value) => {
    return `${value.toFixed(2)} грн`
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
        />
        <YAxis tickFormatter={(value) => `${value} грн`} />
        <Tooltip
          formatter={formatCurrency}
          labelFormatter={formatDate}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#1890ff"
          strokeWidth={2}
          name="Виручка"
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default RevenueChart
