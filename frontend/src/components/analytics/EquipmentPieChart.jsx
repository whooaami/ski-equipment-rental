import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Empty } from 'antd'

const COLORS = {
  ski: '#1890ff',
  skate: '#52c41a',
  sled: '#fa8c16'
}

const TYPE_LABELS = {
  ski: 'Лижі',
  skate: 'Ковзани',
  sled: 'Санки'
}

function EquipmentPieChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <Empty description="Немає даних для відображення" />
  }

  // Перетворити об'єкт {ski: 20, skate: 20, sled: 20} в масив для Pie
  const chartData = Object.entries(data).map(([type, count]) => ({
    name: TYPE_LABELS[type] || type,
    value: count,
    type: type
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.type] || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default EquipmentPieChart
