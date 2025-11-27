import { Form, Rate, Input, Button, Space, Descriptions, Tag } from 'antd'
import { RENTAL_TYPES } from '../../constants/rentalConstants'
import { GEAR_TYPES } from '../../constants/gearConstants'

const { TextArea } = Input

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

function RentalReturnForm({ form, rental, onFinish, onCancel, loading }) {
  if (!rental) return null

  const gearType = GEAR_TYPES[rental.gear.type]?.label || rental.gear.type
  const rentalTypeLabel = RENTAL_TYPES[rental.rental_type]?.label || rental.rental_type

  return (
    <div>
      <Descriptions
        bordered
        column={1}
        size="small"
        style={{ marginBottom: 24 }}
      >
        <Descriptions.Item label="Клієнт">
          <div>
            <div style={{ fontWeight: 500 }}>{rental.customer.full_name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{rental.customer.phone}</div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Спорядження">
          {`${gearType} ${rental.gear.brand || ''} ${rental.gear.size || ''}`.trim()}
        </Descriptions.Item>
        <Descriptions.Item label="Видано">
          {formatDateTime(rental.start_at)}
        </Descriptions.Item>
        <Descriptions.Item label="Повернути до">
          <span style={{ color: rental.is_overdue ? '#ff4d4f' : 'inherit' }}>
            {formatDateTime(rental.due_at)}
            {rental.is_overdue && <Tag color="red" style={{ marginLeft: 8 }}>Прострочка</Tag>}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Тип оренди">
          {rentalTypeLabel}
        </Descriptions.Item>
        <Descriptions.Item label="Вартість">
          {rental.total_price} грн
        </Descriptions.Item>
      </Descriptions>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        preserve={false}
      >
        <Form.Item
          name="condition_score"
          label="Оцінка стану спорядження"
          rules={[{ required: true, message: 'Оцініть стан спорядження' }]}
        >
          <Rate
            tooltips={['Дуже погано', 'Погано', 'Задовільно', 'Добре', 'Відмінно']}
            style={{ fontSize: 32 }}
          />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Коментар (опціонально)"
        >
          <TextArea
            rows={4}
            placeholder="Опишіть стан спорядження, пошкодження, зауваження..."
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Підтвердити повернення
            </Button>
            <Button onClick={onCancel}>
              Скасувати
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default RentalReturnForm
