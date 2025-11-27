import { Table, Progress, Tag } from 'antd'

function BrandPerformanceTable({ data, loading }) {
  const columns = [
    {
      title: 'Бренд',
      dataIndex: 'brand_name',
      key: 'brand_name',
      fixed: 'left',
      width: 120
    },
    {
      title: 'Спорядження',
      dataIndex: 'equipment_count',
      key: 'equipment_count',
      width: 100,
      sorter: (a, b) => a.equipment_count - b.equipment_count
    },
    {
      title: 'Попит %',
      dataIndex: 'demand_percentage',
      key: 'demand_percentage',
      width: 140,
      sorter: (a, b) => a.demand_percentage - b.demand_percentage,
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          format={(percent) => `${percent}%`}
        />
      )
    },
    {
      title: 'Зайнятість %',
      dataIndex: 'utilization_rate',
      key: 'utilization_rate',
      width: 140,
      sorter: (a, b) => a.utilization_rate - b.utilization_rate,
      render: (value) => (
        <Progress
          percent={value}
          size="small"
          status={value > 70 ? 'success' : value > 40 ? 'normal' : 'exception'}
          format={(percent) => `${percent}%`}
        />
      )
    },
    {
      title: 'Виручка',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      width: 120,
      sorter: (a, b) => a.total_revenue - b.total_revenue,
      defaultSortOrder: 'descend',
      render: (value) => `${value.toFixed(2)} грн`
    },
    {
      title: '% від виручки',
      dataIndex: 'revenue_percentage',
      key: 'revenue_percentage',
      width: 120,
      sorter: (a, b) => a.revenue_percentage - b.revenue_percentage,
      render: (value) => `${value}%`
    },
    {
      title: 'Середня виручка / од.',
      dataIndex: 'avg_revenue_per_item',
      key: 'avg_revenue_per_item',
      width: 140,
      sorter: (a, b) => a.avg_revenue_per_item - b.avg_revenue_per_item,
      render: (value) => `${value.toFixed(2)} грн`
    },
    {
      title: 'Середній стан',
      dataIndex: 'avg_condition_score',
      key: 'avg_condition_score',
      width: 140,
      sorter: (a, b) => a.avg_condition_score - b.avg_condition_score,
      render: (value) => {
        let color = 'default'
        if (value >= 4.5) color = 'green'
        else if (value >= 4.0) color = 'blue'
        else if (value >= 3.0) color = 'orange'
        else if (value > 0) color = 'red'

        return value > 0 ? (
          <Tag color={color}>⭐ {value} / 5.0</Tag>
        ) : (
          <Tag color="default">Н/Д</Tag>
        )
      }
    },
    {
      title: 'Оренд всього',
      dataIndex: 'rental_count',
      key: 'rental_count',
      width: 100,
      sorter: (a, b) => a.rental_count - b.rental_count
    }
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="brand_id"
      pagination={{ pageSize: 10, showSizeChanger: false }}
      size="small"
      scroll={{ x: 1200 }}
    />
  )
}

export default BrandPerformanceTable
