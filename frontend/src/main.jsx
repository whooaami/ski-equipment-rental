import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import ukUA from 'antd/locale/uk_UA'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      locale={ukUA}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6
        }
      }}
    >
      <AntApp>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  </StrictMode>
)
