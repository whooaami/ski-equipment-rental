import { Space, Card, Row, Col, Statistic, Spin, Typography, Alert, Tabs } from 'antd'
import {
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useDashboardStats, usePopularEquipment, useTopCustomers, useRevenueData, useOverdueRentals, useBrandAnalytics, useCustomerSegmentation, useProblematicCustomers } from '../hooks/useAnalytics'
import { useAuth } from '../context/AuthContext'
import EquipmentPieChart from '../components/analytics/EquipmentPieChart'
import PopularEquipmentTable from '../components/analytics/PopularEquipmentTable'
import TopCustomersTable from '../components/analytics/TopCustomersTable'
import BrandPerformanceTable from '../components/analytics/BrandPerformanceTable'
import BrandRevenueChart from '../components/analytics/BrandRevenueChart'
import CustomerSegmentChart from '../components/analytics/CustomerSegmentChart'
import ProblematicCustomersTable from '../components/analytics/ProblematicCustomersTable'
import RevenueBreakdownChart from '../components/analytics/RevenueBreakdownChart'

const { Title } = Typography

function Analytics() {
  const { user } = useAuth()
  const { data: dashboardStats, loading: loadingDashboard } = useDashboardStats()
  const { data: equipmentData, loading: loadingEquipment } = usePopularEquipment()
  const { data: customersData, loading: loadingCustomers } = useTopCustomers()
  const { data: revenueData, loading: loadingRevenue } = useRevenueData()
  const { data: overdueData, loading: loadingOverdue } = useOverdueRentals()
  const { data: brandData, loading: loadingBrands } = useBrandAnalytics()
  const { data: segmentData, loading: loadingSegments } = useCustomerSegmentation()
  const { data: problematicData, loading: loadingProblematic } = useProblematicCustomers()

  if (loadingDashboard) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        Аналітика{user?.company_name ? ` | ${user.company_name}` : ''}
      </Title>

      {/* Прострочені оренди - попередження */}
      {overdueData && overdueData.count > 0 && (
        <Alert
          message={
            <span>
              <WarningOutlined style={{ marginRight: 8 }} />
              Увага! Є {overdueData.count} прострочених споряджень
            </span>
          }
          description={`Зверніться до клієнтів для повернення спорядження`}
          type="error"
          closable
        />
      )}

      {/* Ключові метрики - 4 карточки */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Всього орend"
              value={dashboardStats?.rentals?.active || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Виручка за місяць"
              value={dashboardStats?.revenue?.month || 0}
              precision={2}
              suffix="грн"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Середня оцінка стану"
              value={dashboardStats?.quality?.avg_condition_score || 0}
              precision={2}
              suffix="/ 5.0"
              prefix="⭐"
              valueStyle={{
                color: (dashboardStats?.quality?.avg_condition_score || 0) >= 4 ? '#52c41a' : '#faad14'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Зайнятість"
              value={dashboardStats?.equipment?.occupancy_rate || 0}
              precision={1}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{
                color: (dashboardStats?.equipment?.occupancy_rate || 0) > 70 ? '#52c41a' : '#faad14'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Таби для організації аналітики */}
      <Tabs
        defaultActiveKey="overview"
        size="large"
        items={[
          {
            key: 'overview',
            label: '📊 Огляд',
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title="Розподіл виручки за типом оренди" loading={loadingRevenue}>
                  {revenueData && <RevenueBreakdownChart data={revenueData} />}
                </Card>

                <Card title="Розподіл спорядження по типах" loading={loadingEquipment}>
                  {equipmentData && <EquipmentPieChart data={equipmentData.by_type} />}
                </Card>

                <Row gutter={16}>
                  <Col xs={24} lg={12}>
                    <Card title="Топ-10 спорядження за орендами">
                      <PopularEquipmentTable
                        data={equipmentData?.top_equipment || []}
                        loading={loadingEquipment}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Топ-10 клієнтів">
                      <TopCustomersTable
                        data={customersData?.top_customers || []}
                        loading={loadingCustomers}
                      />
                    </Card>
                  </Col>
                </Row>
              </Space>
            )
          },
          {
            key: 'brands',
            label: '🏷️ Бренди',
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title="Виручка по брендах" loading={loadingBrands}>
                  {brandData && <BrandRevenueChart data={brandData.brands} />}
                </Card>

                <Card title="Детальна аналітика по брендах" loading={loadingBrands}>
                  {brandData && <BrandPerformanceTable data={brandData.brands} loading={false} />}
                </Card>
              </Space>
            )
          },
          {
            key: 'customers',
            label: '👥 Клієнти',
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title="Сегментація клієнтів" loading={loadingSegments}>
                  {segmentData && <CustomerSegmentChart data={segmentData} />}
                </Card>

                {problematicData && problematicData.count > 0 && (
                  <Card
                    title={`Проблемні клієнти (${problematicData.count})`}
                    loading={loadingProblematic}
                    extra={<span style={{ color: '#ff4d4f' }}>⚠️ Середня оцінка стану &lt; 3.0</span>}
                  >
                    <ProblematicCustomersTable
                      data={problematicData.problematic_customers}
                      loading={false}
                    />
                  </Card>
                )}
                {(!problematicData || problematicData.count === 0) && (
                  <Alert
                    message="Чудово! Немає проблемних клієнтів"
                    description="Всі клієнти повертають спорядження в хорошому стані"
                    type="success"
                    showIcon
                  />
                )}
              </Space>
            )
          }
        ]}
      />
    </Space>
  )
}

export default Analytics
