import { Segmented } from 'antd'
import { RENTAL_STATUS_FILTERS } from '../../constants/rentalConstants'

function RentalFilters({ statusFilter, onStatusChange }) {
  const options = Object.values(RENTAL_STATUS_FILTERS).map(filter => ({
    label: filter.label,
    value: filter.value
  }))

  return (
    <div style={{ marginBottom: 16 }}>
      <Segmented
        options={options}
        value={statusFilter}
        onChange={onStatusChange}
        size="large"
      />
    </div>
  )
}

export default RentalFilters
