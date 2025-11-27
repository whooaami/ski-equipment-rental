import { Form, Button, Space } from 'antd'
import { useNavigate } from 'react-router-dom'

function AuthFormButtons({ submitText }) {
  const navigate = useNavigate()

  return (
    <Form.Item style={{ marginBottom: 0 }}>
      <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
        <Button type="primary" htmlType="submit" size="large">
          {submitText}
        </Button>
        <Button size="large" onClick={() => navigate('/')}>
          На головну
        </Button>
      </Space>
    </Form.Item>
  )
}

export default AuthFormButtons
