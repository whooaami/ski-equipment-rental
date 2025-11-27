import { useNavigate } from 'react-router-dom'
import { Typography, Button, Space, Flex } from 'antd'
import AuthLayout from '../components/AuthLayout'

const { Title, Paragraph } = Typography

function Landing() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <Flex vertical align="center" gap="large" style={{ padding: '0 1rem' }}>
        <Title
          level={1}
          style={{
            fontSize: 'clamp(1.5rem, 8vw, 3rem)',
            margin: 0,
            textAlign: 'center'
          }}
        >
          🎿 МЕНЕДЖЕР ПРОКАТУ
        </Title>

        <Paragraph
          style={{
            fontSize: '1.2rem',
            textAlign: 'center',
            color: '#666',
            margin: 0
          }}
        >
          Система обліку прокату лиж та ковзанів
        </Paragraph>

        <Space size="large" style={{ marginTop: '2rem' }}>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/login')}
          >
            Увійти
          </Button>
          <Button
            size="large"
            onClick={() => navigate('/register')}
          >
            Зареєструватися
          </Button>
        </Space>
      </Flex>
    </AuthLayout>
  )
}

export default Landing
