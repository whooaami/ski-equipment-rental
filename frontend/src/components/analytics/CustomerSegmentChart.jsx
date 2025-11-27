import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Empty, Statistic, Row, Col, Card } from 'antd'

const COLORS = {
  vip: '#722ed1',
  regular: '#1890ff',
  occasional: '#52c41a'
}

const LABELS = {
  vip: 'VIP (≥5 оренд)',
  regular: 'Постійні (2-4 оренди)',
  occasional: 'Нові (1 оренда)'
}

function CustomerSegmentChart({ data }) {
  if (!data) {
    return <Empty description="Немає даних для відображення" />
  }

  const chartData = [
    { name: LABELS.vip, value: data.vip.count, segment: 'vip', revenue: data.vip.total_revenue },
    { name: LABELS.regular, value: data.regular.count, segment: 'regular', revenue: data.regular.total_revenue },
    { name: LABELS.occasional, value: data.occasional.count, segment: 'occasional', revenue: data.occasional.total_revenue }
  ].filter(item => item.value > 0)

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="VIP клієнти"
              value={data.vip.count}
              valueStyle={{ color: COLORS.vip }}
              suffix={`/ ${data.summary.total_customers}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Постійні клієнти"
              value={data.regular.count}
              valueStyle={{ color: COLORS.regular }}
              suffix={`/ ${data.summary.total_customers}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title="Нові клієнти"
              value={data.occasional.count}
              valueStyle={{ color: COLORS.occasional }}
              suffix={`/ ${data.summary.total_customers}`}
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
            label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.segment]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [
            `${value} клієнтів (${props.payload.revenue.toFixed(2)} грн)`,
            name
          ]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}

export default CustomerSegmentChart
