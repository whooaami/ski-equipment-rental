import { Form, Input } from 'antd'

function EmailFormField() {
  return (
    <Form.Item
      name="email"
      label="Електронна пошта"
      rules={[
        { required: true, message: 'Введіть електронну пошту' },
        { type: 'email', message: 'Невірний формат пошти' }
      ]}
    >
      <Input placeholder="example@email.com" size="large" />
    </Form.Item>
  )
}

export default EmailFormField
