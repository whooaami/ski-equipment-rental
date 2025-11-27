import { Button, Dropdown } from 'antd'
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('uk-UA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const createBrandColumns = (handleEdit, handleDelete) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: 'Назва бренду',
    dataIndex: 'name',
    key: 'name',
    width: 300
  },
  {
    title: 'Дата додавання',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    render: (date) => formatDateTime(date)
  },
  {
    title: 'Дії',
    key: 'actions',
    width: 100,
    render: (_, record) => {
      const items = [
        {
          key: 'edit',
          label: 'Редагувати',
          icon: <EditOutlined />
        },
        {
          type: 'divider'
        },
        {
          key: 'delete',
          label: 'Видалити',
          icon: <DeleteOutlined />,
          danger: true
        }
      ]

      return (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              if (key === 'edit') {
                handleEdit(record)
              } else if (key === 'delete') {
                handleDelete(record.id)
              }
            }
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  }
]
