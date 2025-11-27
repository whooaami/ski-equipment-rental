import { useState } from 'react'
import { Layout, Menu, Button, Flex, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  DashboardOutlined,
  ToolOutlined,
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TagsOutlined,
  LogoutOutlined
} from '@ant-design/icons'

const { Sider } = Layout
const { Text } = Typography

function Header() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Головна' },
    { key: '/equipment', icon: <ToolOutlined />, label: 'Спорядження' },
    { key: '/brands', icon: <TagsOutlined />, label: 'Бренди' },
    { key: '/customers', icon: <UserOutlined />, label: 'Клієнти' },
    { key: '/rentals', icon: <FileTextOutlined />, label: 'Оренди' },
    { key: '/analytics', icon: <BarChartOutlined />, label: 'Аналітика' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleMouseEnter = () => {
    document.body.style.overflow = 'hidden'
  }

  const handleMouseLeave = () => {
    document.body.style.overflow = 'auto'
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0
      }}
    >
      <Flex vertical justify="space-between" style={{ height: '100%' }}>
        <div>
          <Flex
            justify="center"
            align="center"
            style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}
          >
            <Text strong style={{ fontSize: '16px' }}>
              {collapsed ? '🎿' : '🎿 Ski Rental'}
            </Text>
          </Flex>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </div>

        <Flex vertical gap="small" style={{ padding: '16px' }}>
          {!collapsed && user && (
            <Text type="secondary" style={{ fontSize: '12px', textAlign: 'center' }}>
              {user.email}
            </Text>
          )}
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
          >
            {!collapsed && 'Вийти'}
          </Button>
        </Flex>
      </Flex>
    </Sider>
  )
}

export default Header
