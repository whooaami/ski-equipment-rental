import { Tag, Button, Dropdown } from 'antd'
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import { GEAR_TYPES, GEAR_STATUS } from '../constants/gearConstants'

export const createGearColumns = (handleEdit, handleDelete) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: 'Тип',
    dataIndex: 'type',
    key: 'type',
    render: (type) => GEAR_TYPES[type]?.label || type
  },
  {
    title: 'Бренд',
    dataIndex: 'brand',
    key: 'brand',
    render: (brand) => brand?.name || '-'
  },
  {
    title: 'Розмір',
    dataIndex: 'size',
    key: 'size'
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const config = GEAR_STATUS[status] || { label: status, color: 'default' }
      return <Tag color={config.color}>{config.label}</Tag>
    }
  },
  {
    title: 'Ціна/год',
    dataIndex: 'hourly_price',
    key: 'hourly_price',
    render: (price) => `${price} грн`
  },
  {
    title: 'Ціна/день',
    dataIndex: 'daily_price',
    key: 'daily_price',
    render: (price) => `${price} грн`
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
