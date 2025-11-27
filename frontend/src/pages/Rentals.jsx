import { useState } from 'react'
import { Space, Typography, Card, Button, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useRentals } from '../hooks/useRentals'
import { useCrudModal } from '../hooks/useCrudModal'
import { useAuth } from '../context/AuthContext'
import { createRentalColumns } from '../utils/rentalTableConfig'
import { PAGINATION_CONFIG } from '../constants/rentalConstants'
import RentalFilters from '../components/rental/RentalFilters'
import DataTable from '../components/common/DataTable'
import CrudModal from '../components/common/CrudModal'
import RentalFormFields from '../components/form/RentalFormFields'
import RentalReturnForm from '../components/rental/RentalReturnForm'
import { Form } from 'antd'

const { Title } = Typography

function Rentals() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [returningRental, setReturningRental] = useState(null)
  const [returnForm] = Form.useForm()

  const { data, loading, submitLoading, pagination, fetchRentals, createRental, returnRental } = useRentals(statusFilter)

  const {
    form,
    isModalOpen,
    editingItem,
    openCreateModal,
    openEditModal,
    closeModal
  } = useCrudModal()

  const handleReturn = (rental) => {
    setReturningRental(rental)
    returnForm.resetFields()
    setReturnModalOpen(true)
  }

  const columns = createRentalColumns(handleReturn, statusFilter)

  const handleCreateSubmit = (values) => {
    createRental(values).then(() => {
      closeModal()
    }).catch(() => {
      // Помилка вже оброблена в хуку
    })
  }

  const handleReturnSubmit = (values) => {
    if (returningRental) {
      returnRental(returningRental.id, values).then(() => {
        setReturnModalOpen(false)
        setReturningRental(null)
        returnForm.resetFields()
      }).catch(() => {
        // Помилка вже оброблена в хуку
      })
    }
  }

  const handleReturnCancel = () => {
    setReturnModalOpen(false)
    setReturningRental(null)
    returnForm.resetFields()
  }

  const handlePaginationChange = (page, pageSize) => {
    fetchRentals(page, pageSize)
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        Оренди{user?.company_name ? ` | ${user.company_name}` : ''}
      </Title>

      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Створити оренду
          </Button>
        }
      >
        <RentalFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
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

      {/* Модалка створення оренди */}
      <CrudModal
        open={isModalOpen}
        editingItem={editingItem}
        createTitle="Створити оренду"
        editTitle="Редагувати оренду"
        onCancel={closeModal}
        width={700}
      >
        <RentalFormFields
          form={form}
          mode={editingItem ? 'edit' : 'create'}
          onFinish={handleCreateSubmit}
          onCancel={closeModal}
          loading={submitLoading}
          initialValues={editingItem || {}}
        />
      </CrudModal>

      {/* Модалка повернення спорядження */}
      <Modal
        title="Повернення спорядження"
        open={returnModalOpen}
        onCancel={handleReturnCancel}
        footer={null}
        destroyOnHidden
        width={700}
      >
        <RentalReturnForm
          form={returnForm}
          rental={returningRental}
          onFinish={handleReturnSubmit}
          onCancel={handleReturnCancel}
          loading={submitLoading}
        />
      </Modal>
    </Space>
  )
}

export default Rentals
