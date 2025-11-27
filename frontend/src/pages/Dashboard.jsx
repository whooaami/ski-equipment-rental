import { Row, Col, Card, Statistic, Table, Tag, Button, Typography, Space, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { App } from 'antd'
import api from '../api/axios'
import { useDashboardStats } from '../hooks/useAnalytics'
import { useAuth } from '../context/AuthContext'
import { GEAR_TYPES } from '../constants/gearConstants'

const { Title } = Typography

function Dashboard() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { user } = useAuth()
  const { data: stats, loading: loadingStats } = useDashboardStats()
  const [recentRentals, setRecentRentals] = useState([])
  const [loadingRentals, setLoadingRentals] = useState(false)

  useEffect(() => {
    // Завантажити останні 10 орend
    setLoadingRentals(true)
    api.get('/rentals?status=active')
      .then(response => {
        // Взяти тільки перші 10
        setRecentRentals(response.data.items.slice(0, 10))
      })
      .catch(error => {
        message.error('Не вдалося завантажити оренди')
      })
      .finally(() => {
        setLoadingRentals(false)
      })
  }, [])

  const columns = [
    {
      title: 'Клієнт',
      dataIndex: ['customer', 'full_name'],
      key: 'customer'
    },
    {
      title: 'Спорядження',
      key: 'equipment',
      render: (_, record) => {
        const typeLabel = GEAR_TYPES[record.gear.type]?.label || record.gear.type
        return `${typeLabel} ${record.gear.brand || ''} ${record.gear.size || ''}`.trim()
      }
    },
    {
      title: 'Видано',
      dataIndex: 'start_at',
      key: 'start_at',
      render: (date) => new Date(date).toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      title: 'Повернути до',
      dataIndex: 'due_at',
      key: 'due_at',
      render: (date) => new Date(date).toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.is_overdue ? 'red' : 'green'}>
          {record.is_overdue ? 'Прострочка' : 'Активна'}
        </Tag>
      )
    }
  ]

  if (loadingStats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        Головна панель{user?.company_name ? ` | ${user.company_name}` : ''}
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Всього спорядження" value={stats?.equipment?.total || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Доступно"
              value={stats?.equipment?.available || 0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="В оренді"
              value={stats?.equipment?.rented || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Прострочки"
              value={stats?.rentals?.overdue || 0}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Зайнятість"
              value={stats?.equipment?.occupancy_rate || 0}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Клієнтів" value={stats?.customers?.total || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Середня оцінка стану"
              value={stats?.quality?.avg_condition_score || 0}
              precision={2}
              suffix="/ 5.0"
              prefix="⭐"
              valueStyle={{
                color: (stats?.quality?.avg_condition_score || 0) >= 4 ? '#52c41a' : '#faad14'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Дохід за місяць"
              value={stats?.revenue?.month || 0}
              precision={2}
              suffix="грн"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Останні 10 активних орend"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/rentals')}
          >
            Нова оренда
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={recentRentals}
          loading={loadingRentals}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </Space>
  )
}

export default Dashboard
