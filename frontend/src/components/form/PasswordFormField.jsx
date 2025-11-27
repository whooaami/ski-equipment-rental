import { Form, Input } from 'antd'

function PasswordFormField({ isRegister = false }) {
  const rules = [
    { required: true, message: 'Введіть пароль' }
  ]

  if (isRegister) {
    rules.push(
      { min: 8, message: 'Мінімум 8 символів' },
      { pattern: /[A-Z]/, message: 'Потрібна мінімум 1 велика літера' }
    )
  }

  return (
    <Form.Item
      name="password"
      label="Пароль"
      rules={rules}
    >
      <Input.Password
        placeholder={isRegister ? "Мінімум 8 символів, 1 велика літера" : "Ваш пароль"}
        size="large"
      />
    </Form.Item>
  )
}

export default PasswordFormField
