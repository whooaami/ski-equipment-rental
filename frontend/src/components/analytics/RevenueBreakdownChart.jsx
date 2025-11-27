import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Empty, Row, Col, Statistic, Card } from 'antd'

const COLORS = {
  hourly: '#1890ff',
  daily: '#52c41a'
}

const LABELS = {
  hourly: 'Погодинна оренда',
  daily: 'Денна оренда'
}

function RevenueBreakdownChart({ data }) {
  if (!data || !data.by_rental_type) {
    return <Empty description="Немає даних для відображення" />
  }

  const { hourly, daily } = data.by_rental_type

  const chartData = []
  if (hourly && hourly.revenue > 0) {
    chartData.push({
      name: LABELS.hourly,
      value: hourly.revenue,
      count: hourly.count,
      type: 'hourly'
    })
  }
  if (daily && daily.revenue > 0) {
    chartData.push({
      name: LABELS.daily,
      value: daily.revenue,
      count: daily.count,
      type: 'daily'
    })
  }

  if (chartData.length === 0) {
    return <Empty description="Немає даних для відображення" />
  }

  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0)

  const formatCurrency = (value) => `${value.toFixed(2)} грн`

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card size="small">
            <Statistic
              title="Погодинна оренда"
              value={hourly?.revenue || 0}
              precision={2}
              suffix="грн"
              valueStyle={{ color: COLORS.hourly }}
              prefix={`${hourly?.count || 0} споряджень /`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small">
            <Statistic
              title="Денна оренда"
              value={daily?.revenue || 0}
              precision={2}
              suffix="грн"
              valueStyle={{ color: COLORS.daily }}
              prefix={`${daily?.count || 0} споряджень /`}
            />
          </Card>
        </Col>
      </Row>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            label={({ name, percent }) => {
              const label = name.split(' ')[0]
              return `${label}: ${(percent * 100).toFixed(1)}%`
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${formatCurrency(value)} (${props.payload.count} споряджень)`,
              name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}

export default RevenueBreakdownChart
