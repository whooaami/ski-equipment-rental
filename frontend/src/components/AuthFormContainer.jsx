import { Form, Typography, Flex } from 'antd'
import AuthLayout from './AuthLayout'

const { Title } = Typography

function AuthFormContainer({ title, children, onFinish, formInstance }) {
  return (
    <AuthLayout>
      <Flex vertical align="center" gap="large" style={{ width: '100%', maxWidth: '400px' }}>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>

        <Form
          form={formInstance}
          onFinish={onFinish}
          layout="vertical"
          style={{ width: '100%' }}
          autoComplete="off"
        >
          {children}
        </Form>
      </Flex>
    </AuthLayout>
  )
}

export default AuthFormContainer
