export const GEAR_TYPES = {
  ski: { value: 'ski', label: 'Лижі' },
  skate: { value: 'skate', label: 'Ковзани' },
  sled: { value: 'sled', label: 'Санки' }
}

export const GEAR_STATUS = {
  available: { value: 'available', label: 'Доступно', color: 'green' },
  rented: { value: 'rented', label: 'В оренді', color: 'blue' },
  broken: { value: 'broken', label: 'Зламане', color: 'red' }
}

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  showTotal: (total) => `Всього: ${total}`,
  showSizeChanger: true,
  position: ['bottomCenter']
}
