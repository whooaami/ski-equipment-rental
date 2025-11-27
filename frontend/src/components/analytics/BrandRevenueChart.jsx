import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Empty } from 'antd'

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb']

function BrandRevenueChart({ data }) {
  if (!data || data.length === 0) {
    return <Empty description="Немає даних для відображення" />
  }

  // Відсортувати за виручкою від найбільшої до найменшої
  const sortedData = [...data].sort((a, b) => b.total_revenue - a.total_revenue)

  // Форматування грошей
  const formatCurrency = (value) => {
    return `${value.toFixed(2)} грн`
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={sortedData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickFormatter={(value) => `${value} грн`}
        />
        <YAxis
          type="category"
          dataKey="brand_name"
          width={90}
        />
        <Tooltip
          formatter={formatCurrency}
          cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
        />
        <Legend />
        <Bar
          dataKey="total_revenue"
          name="Виручка"
          radius={[0, 8, 8, 0]}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default BrandRevenueChart
