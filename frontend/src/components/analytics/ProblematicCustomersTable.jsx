import { Table, Tag } from 'antd'

function ProblematicCustomersTable({ data, loading }) {
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
      title: 'Середня оцінка стану',
      dataIndex: 'avg_condition_score',
      key: 'avg_condition_score',
      sorter: (a, b) => a.avg_condition_score - b.avg_condition_score,
      defaultSortOrder: 'ascend',
      render: (score) => {
        let color = 'default'
        if (score < 2.0) color = 'red'
        else if (score < 2.5) color = 'orange'
        else if (score < 3.0) color = 'gold'

        return <Tag color={color}>⭐ {score} / 5.0</Tag>
      }
    },
    {
      title: 'Кількість орend',
      dataIndex: 'rental_count',
      key: 'rental_count',
      sorter: (a, b) => a.rental_count - b.rental_count
    },
    {
      title: 'Загальна сума',
      dataIndex: 'total_spent',
      key: 'total_spent',
      sorter: (a, b) => a.total_spent - b.total_spent,
      render: (value) => `${value.toFixed(2)} грн`
    }
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey="id"
      pagination={{ pageSize: 10, showSizeChanger: false }}
      size="small"
    />
  )
}

export default ProblematicCustomersTable
