import { useState, useEffect } from 'react'
import { Form, Select, Radio, InputNumber, Button, Space, Alert, Spin } from 'antd'
import { RENTAL_TYPES } from '../../constants/rentalConstants'
import api from '../../api/axios'

function RentalFormFields({ form, mode, onFinish, onCancel, loading, initialValues }) {
  const [customers, setCustomers] = useState([])
  const [gear, setGear] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState(null)

  const rentalType = Form.useWatch('rental_type', form)
  const duration = Form.useWatch('duration', form)
  const gearId = Form.useWatch('gear_id', form)

  // Завантажити клієнтів та спорядження
  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      api.get('/customers?page_size=100'),
      api.get('/gear?status=available&page_size=100')
    ])
      .then(([customersRes, gearRes]) => {
        setCustomers(customersRes.data.items || [])
        setGear(gearRes.data.items || [])
      })
      .catch(error => {
        console.error('Помилка завантаження даних:', error)
        setCustomers([])
        setGear([])
      })
      .finally(() => {
        setLoadingData(false)
      })
  }, [])

  // Автоматичний розрахунок ціни
  useEffect(() => {
    if (rentalType && duration && gearId) {
      const selectedGear = gear.find(g => g.id === gearId)
      if (selectedGear) {
        const price = rentalType === 'hourly'
          ? selectedGear.hourly_price * duration
          : selectedGear.daily_price * duration
        setCalculatedPrice(price)
      }
    } else {
      setCalculatedPrice(null)
    }
  }, [rentalType, duration, gearId, gear])

  if (loadingData) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      preserve={false}
      initialValues={initialValues}
    >
      <Form.Item
        name="customer_id"
        label="Клієнт"
        rules={[{ required: true, message: 'Виберіть клієнта' }]}
      >
        <Select
          placeholder="Оберіть клієнта"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={customers.map(c => ({
            value: c.id,
            label: `${c.full_name} (${c.phone})`
          }))}
        />
      </Form.Item>

      <Form.Item
        name="gear_id"
        label="Спорядження"
        rules={[{ required: true, message: 'Виберіть спорядження' }]}
      >
        <Select
          placeholder="Оберіть спорядження (тільки доступне)"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={gear.map(g => ({
            value: g.id,
            label: `${g.type} ${g.brand?.name || ''} ${g.size || ''} (${g.hourly_price}грн/год, ${g.daily_price}грн/день)`.trim()
          }))}
        />
      </Form.Item>

      <Form.Item
        name="rental_type"
        label="Тип оренди"
        rules={[{ required: true, message: 'Виберіть тип оренди' }]}
      >
        <Radio.Group>
          {Object.values(RENTAL_TYPES).map(type => (
            <Radio.Button key={type.value} value={type.value}>
              {type.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="duration"
        label={rentalType === 'hourly' ? 'Тривалість (годин)' : 'Тривалість (днів)'}
        rules={[
          { required: true, message: 'Вкажіть тривалість' },
          { type: 'number', min: 1, message: 'Тривалість має бути більше 0' }
        ]}
      >
        <InputNumber
          placeholder={rentalType === 'hourly' ? 'Кількість годин' : 'Кількість днів'}
          style={{ width: '100%' }}
          min={1}
        />
      </Form.Item>

      {calculatedPrice !== null && (
        <Alert
          message="Розрахункова вартість"
          description={`${calculatedPrice.toFixed(2)} грн`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item style={{ marginBottom: 0 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'create' ? 'Створити оренду' : 'Зберегти'}
          </Button>
          <Button onClick={onCancel}>
            Скасувати
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default RentalFormFields
