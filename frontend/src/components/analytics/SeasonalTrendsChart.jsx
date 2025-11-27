import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts'
import { Empty } from 'antd'

function SeasonalTrendsChart({ data }) {
  if (!data || data.length === 0) {
    return <Empty description="Немає даних для відображення" />
  }

  const formatCurrency = (value) => {
    return `${value.toFixed(2)} грн`
  }

  // Формат для відображення місяця
  const formatMonth = (monthKey) => {
    return monthKey
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#52c41a" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month_key"
          tickFormatter={(value) => {
            const parts = value.split('-')
            return `${parts[1]}/${parts[0].slice(2)}`
          }}
          label={{ value: 'Місяць', position: 'insideBottom', offset: -5 }}
        />
        <YAxis yAxisId="left" orientation="left" stroke="#1890ff" />
        <YAxis yAxisId="right" orientation="right" stroke="#52c41a" />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'Виручка') return formatCurrency(value)
            return value
          }}
          labelFormatter={(label) => {
            const item = data.find(d => d.month_key === label)
            return item ? `${item.month_name} ${item.year}` : label
          }}
        />
        <Legend />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          fill="url(#colorRevenue)"
          stroke="#52c41a"
          strokeWidth={2}
          name="Виручка"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="rental_count"
          stroke="#1890ff"
          strokeWidth={2}
          name="Кількість орend"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default SeasonalTrendsChart
