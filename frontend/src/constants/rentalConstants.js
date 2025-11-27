export const RENTAL_TYPES = {
  hourly: { value: 'hourly', label: 'Погодинна' },
  daily: { value: 'daily', label: 'Поденна' }
}

export const RENTAL_STATUS_FILTERS = {
  all: { value: 'all', label: 'Всі' },
  active: { value: 'active', label: 'Активні' },
  completed: { value: 'completed', label: 'Завершені' },
  overdue: { value: 'overdue', label: 'Прострочки' }
}

export const CONDITION_SCORES = {
  1: { value: 1, label: 'Дуже погано', color: 'red' },
  2: { value: 2, label: 'Погано', color: 'orange' },
  3: { value: 3, label: 'Задовільно', color: 'yellow' },
  4: { value: 4, label: 'Добре', color: 'lime' },
  5: { value: 5, label: 'Відмінно', color: 'green' }
}

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  showTotal: (total) => `Всього: ${total}`,
  showSizeChanger: true,
  position: ['bottomCenter']
}
