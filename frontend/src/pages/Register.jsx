import { Form, Input, App } from 'antd'
import { useNavigate } from 'react-router-dom'
import AuthFormContainer from '../components/AuthFormContainer'
import EmailFormField from '../components/form/EmailFormField'
import PasswordFormField from '../components/form/PasswordFormField'
import AuthFormButtons from '../components/AuthFormButtons'
import api from '../api/axios'

function Register() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm()

  const onFinish = (values) => {
    api.post('/register', {
      email: values.email,
      password: values.password,
      company_name: values.company_name || null
    })
      .then(() => {
        message.success('Реєстрація успішна! Тепер увійдіть у систему')
        navigate('/login')
      })
      .catch(error => {
        if (error.response?.status === 500) {
          message.error('Користувач вже існує')
        }
      })
  }

  return (
    <AuthFormContainer title="Реєстрація" onFinish={onFinish} formInstance={form}>
      <EmailFormField />
      <PasswordFormField isRegister />

      <Form.Item
        name="confirm"
        label="Підтвердження паролю"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Підтвердіть пароль' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Паролі не співпадають'))
            }
          })
        ]}
      >
        <Input.Password placeholder="Повторіть пароль" size="large" />
      </Form.Item>

      <Form.Item name="company_name" label="Назва компанії (необов'язково)">
        <Input placeholder="Назва вашої компанії" size="large" />
      </Form.Item>

      <AuthFormButtons submitText="Зареєструватися" />
    </AuthFormContainer>
  )
}

export default Register
