import { Flex } from 'antd'

function AuthLayout({ children }) {
  return (
    <Flex
      vertical
      justify="center"
      align="center"
      style={{ minHeight: '100vh', background: '#f0f2f5' }}
    >
      {children}
    </Flex>
  )
}

export default AuthLayout
