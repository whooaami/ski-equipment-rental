import { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, Button, Space, Spin } from 'antd'
import api from '../../api/axios'

const { TextArea } = Input

function GearFormFields({ form, mode, onFinish, onCancel, loading, initialValues }) {
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(false)

  // Завантажити бренди
  useEffect(() => {
    setLoadingBrands(true)
    api.get('/brands?page_size=100')
      .then(response => {
        setBrands(response.data.items || [])
      })
      .catch(error => {
        console.error('Помилка завантаження брендів:', error)
        setBrands([])
      })
      .finally(() => {
        setLoadingBrands(false)
      })
  }, [])

  if (loadingBrands) {
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
        name="type"
        label="Тип спорядження"
        rules={[{ required: true, message: 'Виберіть тип спорядження' }]}
      >
        <Select placeholder="Виберіть тип">
          <Select.Option value="ski">Лижі</Select.Option>
          <Select.Option value="skate">Ковзани</Select.Option>
          <Select.Option value="sled">Санки</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="brand_id"
        label="Бренд"
        rules={[{ required: true, message: 'Виберіть бренд' }]}
      >
        <Select
          placeholder="Оберіть бренд"
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={brands.map(b => ({ value: b.id, label: b.name }))}
        />
      </Form.Item>

      <Form.Item
        name="size"
        label="Розмір"
      >
        <Input placeholder="170cm або 42" />
      </Form.Item>

      <Form.Item
        name="hourly_price"
        label="Ціна за годину (грн)"
        rules={[
          { required: true, message: 'Вкажіть ціну за годину' },
          { type: 'number', min: 0, message: 'Ціна не може бути від\'ємною' }
        ]}
      >
        <InputNumber
          placeholder="50"
          style={{ width: '100%' }}
          min={0}
          precision={2}
          addonAfter="грн"
        />
      </Form.Item>

      <Form.Item
        name="daily_price"
        label="Ціна за день (грн)"
        rules={[
          { required: true, message: 'Вкажіть ціну за день' },
          { type: 'number', min: 0, message: 'Ціна не може бути від\'ємною' }
        ]}
      >
        <InputNumber
          placeholder="300"
          style={{ width: '100%' }}
          min={0}
          precision={2}
          addonAfter="грн"
        />
      </Form.Item>

      <Form.Item
        name="notes"
        label="Примітки"
      >
        <TextArea
          rows={3}
          placeholder="Додаткова інформація про спорядження..."
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'create' ? 'Створити' : 'Зберегти'}
          </Button>
          <Button onClick={onCancel}>
            Скасувати
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default GearFormFields
