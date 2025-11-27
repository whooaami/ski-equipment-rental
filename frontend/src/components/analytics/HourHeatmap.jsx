import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Empty } from 'antd'

function HourHeatmap({ data }) {
  if (!data || data.length === 0) {
    return <Empty description="Немає даних для відображення" />
  }

  // Знайти максимальне значення для колірної шкали
  const maxCount = Math.max(...data.map(d => d.rental_count))

  // Функція для визначення кольору на основі інтенсивності
  const getColor = (count) => {
    const intensity = count / maxCount
    if (intensity >= 0.8) return '#d32f2f' // Дуже активно (червоний)
    if (intensity >= 0.6) return '#f57c00' // Активно (помаранчевий)
    if (intensity >= 0.4) return '#fbc02d' // Помірно (жовтий)
    if (intensity >= 0.2) return '#7cb342' // Низька активність (зелений)
    return '#64b5f6' // Мінімальна активність (блакитний)
  }

  const formatHour = (hour) => {
    return `${hour}:00`
  }

  const formatCurrency = (value) => {
    return `${value.toFixed(2)} грн`
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hour"
          tickFormatter={formatHour}
          label={{ value: 'Година доби', position: 'insideBottom', offset: -5 }}
        />
        <YAxis label={{ value: 'Кількість орend', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'Виручка') return formatCurrency(value)
            return value
          }}
          labelFormatter={formatHour}
        />
        <Bar dataKey="rental_count" name="Кількість орend" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.rental_count)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default HourHeatmap
