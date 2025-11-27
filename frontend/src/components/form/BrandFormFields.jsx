import { Form, Input, Button, Space } from 'antd'

function BrandFormFields({ form, mode, onFinish, onCancel, loading, initialValues }) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      preserve={false}
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="Назва бренду"
        rules={[
          { required: true, message: 'Введіть назву бренду' },
          { max: 100, message: 'Максимум 100 символів' }
        ]}
      >
        <Input placeholder="Rossignol" />
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

export default BrandFormFields
