import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import { useAuth } from '../context/AuthContext'
import Landing from '../pages/Landing'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Header from '../components/Header'
import Dashboard from '../pages/Dashboard'
import Equipment from '../pages/Equipment'
import Customers from '../pages/Customers'
import Rentals from '../pages/Rentals'
import Brands from '../pages/Brands'
import Analytics from '../pages/Analytics'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

const ProtectedLayout = () => (
  <Layout style={{ minHeight: '100vh' }}>
    <Header />
    <Layout style={{ marginLeft: 200 }}>
      <Layout.Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  </Layout>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    element: <ProtectedRoute><ProtectedLayout /></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/equipment', element: <Equipment /> },
      { path: '/customers', element: <Customers /> },
      { path: '/rentals', element: <Rentals /> },
      { path: '/brands', element: <Brands /> },
      { path: '/analytics', element: <Analytics /> }
    ]
  }
])
