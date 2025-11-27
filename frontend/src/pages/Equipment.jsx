import { Space, Typography, Card, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useGear } from '../hooks/useGear'
import { useCrudModal } from '../hooks/useCrudModal'
import { useFilters } from '../hooks/useFilters'
import { useAuth } from '../context/AuthContext'
import { createGearColumns } from '../utils/gearTableConfig'
import { PAGINATION_CONFIG } from '../constants/gearConstants'
import GearFilters from '../components/gear/GearFilters'
import DataTable from '../components/common/DataTable'
import CrudModal from '../components/common/CrudModal'
import GearFormFields from '../components/form/GearFormFields'

const { Title } = Typography

function Equipment() {
  const { user } = useAuth()
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilters({
    type: null,
    status: null
  })

  const { data, loading, submitLoading, pagination, fetchGear, createGear, updateGear, deleteGear } = useGear(filters)

  const {
    form,
    isModalOpen,
    editingItem,
    openCreateModal,
    openEditModal,
    closeModal
  } = useCrudModal()

  const columns = createGearColumns(openEditModal, deleteGear)

  const handleSubmit = (values) => {
    if (editingItem) {
      updateGear(editingItem.id, values).then(() => {
        closeModal()
      }).catch(() => {
        // Помилка вже оброблена в хуку
      })
    } else {
      createGear(values).then(() => {
        closeModal()
      }).catch(() => {
        // Помилка вже оброблена в хуку
      })
    }
  }

  const handlePaginationChange = (page, pageSize) => {
    fetchGear(page, pageSize)
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        Спорядження{user?.company_name ? ` | ${user.company_name}` : ''}
      </Title>

      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Додати спорядження
          </Button>
        }
      >
        <GearFilters
          typeFilter={filters.type}
          statusFilter={filters.status}
          onTypeChange={(value) => setFilter('type', value)}
          onStatusChange={(value) => setFilter('status', value)}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <DataTable
          data={data}
          loading={loading}
          columns={columns}
          paginationConfig={PAGINATION_CONFIG}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </Card>

      <CrudModal
        open={isModalOpen}
        editingItem={editingItem}
        createTitle="Додати спорядження"
        editTitle="Редагувати спорядження"
        onCancel={closeModal}
      >
        <GearFormFields
          form={form}
          mode={editingItem ? 'edit' : 'create'}
          onFinish={handleSubmit}
          onCancel={closeModal}
          loading={submitLoading}
          initialValues={editingItem || {}}
        />
      </CrudModal>
    </Space>
  )
}

export default Equipment
