import { Form, App } from 'antd'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import AuthFormContainer from '../components/AuthFormContainer'
import EmailFormField from '../components/form/EmailFormField'
import PasswordFormField from '../components/form/PasswordFormField'
import AuthFormButtons from '../components/AuthFormButtons'
import api from '../api/axios'

function Login() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { login } = useAuth()
  const [form] = Form.useForm()

  const onFinish = (values) => {
    api.post('/login', { email: values.email, password: values.password })
      .then(response => {
        login(response.data.token, {
          id: response.data.id,
          email: response.data.email,
          company_name: response.data.company_name
        })
        navigate('/dashboard')
      })
      .catch(error => {
        if (error.response?.status === 401) {
          message.error('Невірний email або пароль')
        }
      })
  }

  return (
    <AuthFormContainer title="Вхід" onFinish={onFinish} formInstance={form}>
      <EmailFormField />
      <PasswordFormField />
      <AuthFormButtons submitText="Увійти" />
    </AuthFormContainer>
  )
}

export default Login
