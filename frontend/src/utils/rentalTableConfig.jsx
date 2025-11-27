import { Button, Tag, Rate } from 'antd'
import { RENTAL_TYPES } from '../constants/rentalConstants'
import { GEAR_TYPES } from '../constants/gearConstants'

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

export const createRentalColumns = (handleReturn, statusFilter) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: 'Клієнт',
    key: 'customer',
    width: 200,
    render: (_, record) => (
      <div>
        <div style={{ fontWeight: 500 }}>{record.customer.full_name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{record.customer.phone}</div>
      </div>
    )
  },
  {
    title: 'Спорядження',
    key: 'gear',
    width: 200,
    render: (_, record) => {
      const gearType = GEAR_TYPES[record.gear.type]?.label || record.gear.type
      return `${gearType} ${record.gear.brand || ''} ${record.gear.size || ''}`.trim()
    }
  },
  {
    title: 'Видано',
    dataIndex: 'start_at',
    key: 'start_at',
    width: 160,
    render: (date) => formatDateTime(date)
  },
  {
    title: 'Повернути до',
    dataIndex: 'due_at',
    key: 'due_at',
    width: 160,
    render: (date, record) => {
      const formatted = formatDateTime(date)
      if (record.is_overdue && !record.return_at) {
        return <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{formatted}</span>
      }
      return formatted
    }
  },
  {
    title: 'Повернуто',
    dataIndex: 'return_at',
    key: 'return_at',
    width: 160,
    render: (date) => formatDateTime(date)
  },
  {
    title: 'Тип',
    dataIndex: 'rental_type',
    key: 'rental_type',
    width: 120,
    render: (type) => RENTAL_TYPES[type]?.label || type
  },
  {
    title: 'Ціна',
    dataIndex: 'total_price',
    key: 'total_price',
    width: 100,
    render: (price) => `${price} грн`
  },
  {
    title: 'Стан',
    dataIndex: 'condition_score',
    key: 'condition_score',
    width: 140,
    render: (score) => score ? <Rate disabled value={score} /> : '-'
  },
  {
    title: 'Статус',
    key: 'status',
    width: 120,
    render: (_, record) => {
      if (record.return_at) {
        return <Tag color="green">Завершено</Tag>
      }
      if (record.is_overdue) {
        return <Tag color="red">Прострочка</Tag>
      }
      return <Tag color="blue">Активна</Tag>
    }
  },
  {
    title: 'Дії',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (_, record) => {
      if (!record.return_at) {
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => handleReturn(record)}
          >
            Повернути
          </Button>
        )
      }
      return '-'
    }
  }
]
