import { Flex, Select, Button } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
import { GEAR_TYPES, GEAR_STATUS } from '../../constants/gearConstants'

function GearFilters({ typeFilter, statusFilter, onTypeChange, onStatusChange, onClearFilters, hasActiveFilters }) {
  return (
    <Flex gap="middle" wrap="wrap" style={{ marginBottom: 16 }}>
      <Select
        placeholder="Тип спорядження"
        style={{ width: 200 }}
        value={typeFilter}
        onChange={onTypeChange}
        allowClear
      >
        {Object.values(GEAR_TYPES).map(type => (
          <Select.Option key={type.value} value={type.value}>
            {type.label}
          </Select.Option>
        ))}
      </Select>

      <Select
        placeholder="Статус"
        style={{ width: 180 }}
        value={statusFilter}
        onChange={onStatusChange}
        allowClear
      >
        {Object.values(GEAR_STATUS).map(status => (
          <Select.Option key={status.value} value={status.value}>
            {status.label}
          </Select.Option>
        ))}
      </Select>

      <Button
        icon={<ClearOutlined />}
        onClick={onClearFilters}
        disabled={!hasActiveFilters}
      >
        Очистити фільтри
      </Button>
    </Flex>
  )
}

export default GearFilters
