import { Table } from 'antd'

function TopCustomersTable({ data, loading }) {
  const columns = [
    {
      title: "Ім'я",
      dataIndex: 'full_name',
      key: 'full_name'
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'К-сть орend',
      dataIndex: 'rental_count',
      key: 'rental_count',
      sorter: (a, b) => a.rental_count - b.rental_count,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Витрачено',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (value) => `${value.toFixed(2)} грн`,
      sorter: (a, b) => a.total_spent - b.total_spent
    },
    {
      title: 'Остання оренда',
      dataIndex: 'last_rental',
      key: 'last_rental',
      render: (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('uk-UA')
      }
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

export default TopCustomersTable
