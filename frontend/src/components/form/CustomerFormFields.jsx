import { Form, Input, Button, Space } from 'antd'

const { TextArea } = Input

function CustomerFormFields({ form, mode, onFinish, onCancel, loading, initialValues }) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      preserve={false}
      initialValues={initialValues}
    >
      <Form.Item
        name="full_name"
        label="ПІБ"
        rules={[
          { required: true, message: 'Введіть ПІБ клієнта' },
          { max: 255, message: 'Максимум 255 символів' }
        ]}
      >
        <Input placeholder="Іван Петренко" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Номер телефону"
        rules={[
          { required: true, message: 'Введіть номер телефону' },
          {
            pattern: /^\+?[0-9]{10,15}$/,
            message: 'Введіть коректний номер телефону (10-15 цифр)'
          }
        ]}
      >
        <Input placeholder="+380501234567" />
      </Form.Item>

      <Form.Item
        name="notes"
        label="Примітки"
      >
        <TextArea
          rows={3}
          placeholder="Додаткова інформація про клієнта (розмір ноги, вага, тощо)..."
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

export default CustomerFormFields
