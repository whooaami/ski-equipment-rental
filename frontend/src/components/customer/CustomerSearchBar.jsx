import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Search } = Input

function CustomerSearchBar({ value, onChange, onSearch }) {
  return (
    <Search
      placeholder="Пошук за ПІБ або телефоном"
      allowClear
      enterButton={<SearchOutlined />}
      size="large"
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      style={{ marginBottom: 16 }}
    />
  )
}

export default CustomerSearchBar
