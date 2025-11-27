import { useState } from 'react'
import { Space, Typography, Card, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useCustomers } from '../hooks/useCustomers'
import { useCrudModal } from '../hooks/useCrudModal'
import { useAuth } from '../context/AuthContext'
import { createCustomerColumns } from '../utils/customerTableConfig'
import { PAGINATION_CONFIG } from '../constants/customerConstants'
import CustomerSearchBar from '../components/customer/CustomerSearchBar'
import DataTable from '../components/common/DataTable'
import CrudModal from '../components/common/CrudModal'
import CustomerFormFields from '../components/form/CustomerFormFields'

const { Title } = Typography

function Customers() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, submitLoading, pagination, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomers(searchQuery)

  const {
    form,
    isModalOpen,
    editingItem,
    openCreateModal,
    openEditModal,
    closeModal
  } = useCrudModal()

  const columns = createCustomerColumns(openEditModal, deleteCustomer)

  const handleSubmit = (values) => {
    if (editingItem) {
      updateCustomer(editingItem.id, values).then(() => {
        closeModal()
      }).catch(() => {
        // Помилка вже оброблена в хуку
      })
    } else {
      createCustomer(values).then(() => {
        closeModal()
      }).catch(() => {
        // Помилка вже оброблена в хуку
      })
    }
  }

  const handleSearch = (value) => {
    setSearchQuery(value)
  }

  const handlePaginationChange = (page, pageSize) => {
    fetchCustomers(page, pageSize)
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        Клієнти{user?.company_name ? ` | ${user.company_name}` : ''}
      </Title>

      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Додати клієнта
          </Button>
        }
      >
        <CustomerSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
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
        createTitle="Додати клієнта"
        editTitle="Редагувати клієнта"
        onCancel={closeModal}
      >
        <CustomerFormFields
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

export default Customers
