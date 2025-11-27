import { Table, Tag } from 'antd'
import { GEAR_TYPES } from '../../constants/gearConstants'

function IdleEquipmentTable({ data, loading }) {
  const columns = [
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type) => GEAR_TYPES[type]?.label || type
    },
    {
      title: 'Бренд',
      dataIndex: 'brand',
      key: 'brand'
    },
    {
      title: 'Розмір',
      dataIndex: 'size',
      key: 'size'
    },
    {
      title: 'Ціна/день',
      dataIndex: 'daily_price',
      key: 'daily_price',
      render: (value) => `${value.toFixed(2)} грн`
    },
    {
      title: 'Днів простою',
      dataIndex: 'days_idle',
      key: 'days_idle',
      sorter: (a, b) => a.days_idle - b.days_idle,
      defaultSortOrder: 'descend',
      render: (days) => {
        let color = 'default'
        if (days >= 30) color = 'red'
        else if (days >= 14) color = 'orange'
        else if (days >= 7) color = 'gold'

        return <Tag color={color}>{days} днів</Tag>
      }
    },
    {
      title: 'Останнє використання',
      dataIndex: 'last_used',
      key: 'last_used',
      render: (date) => {
        if (!date) return <Tag color="default">Ніколи</Tag>
        const d = new Date(date)
        return d.toLocaleDateString('uk-UA')
      }
    },
    {
      title: 'Втрачена виручка',
      dataIndex: 'potential_lost_revenue',
      key: 'potential_lost_revenue',
      sorter: (a, b) => a.potential_lost_revenue - b.potential_lost_revenue,
      render: (value) => (
        <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
          {value.toFixed(2)} грн
        </span>
      )
    }
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="gear_id"
      pagination={{ pageSize: 10, showSizeChanger: false }}
      size="small"
      scroll={{ x: 800 }}
    />
  )
}

export default IdleEquipmentTable
