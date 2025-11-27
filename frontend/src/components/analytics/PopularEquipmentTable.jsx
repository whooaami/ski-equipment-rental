import { Table } from 'antd'
import { GEAR_TYPES } from '../../constants/gearConstants'

function PopularEquipmentTable({ data, loading }) {
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
      title: 'К-сть орend',
      dataIndex: 'rental_count',
      key: 'rental_count',
      sorter: (a, b) => a.rental_count - b.rental_count,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Виручка',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value) => `${value.toFixed(2)} грн`,
      sorter: (a, b) => a.total_revenue - b.total_revenue
    }
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 5, showSizeChanger: false }}
      size="small"
    />
  )
}

export default PopularEquipmentTable
