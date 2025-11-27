import { Space, Typography, Card, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useBrands } from '../hooks/useBrands'
import { useCrudModal } from '../hooks/useCrudModal'
import { useAuth } from '../context/AuthContext'
import { createBrandColumns } from '../utils/brandTableConfig'
import { PAGINATION_CONFIG } from '../constants/brandConstants'
import DataTable from '../components/common/DataTable'
import CrudModal from '../components/common/CrudModal'
import BrandFormFields from '../components/form/BrandFormFields'

const { Title } = Typography

function Brands() {
  const { user } = useAuth()
  const { data, loading, submitLoading, pagination, fetchBrands, createBrand, updateBrand, deleteBrand } = useBrands()

  const {
    form,
    isModalOpen,
    editingItem,
    openCreateModal,
    openEditModal,
    closeModal
  } = useCrudModal()

  const columns = createBrandColumns(openEditModal, deleteBrand)

  const handleSubmit = (values) => {
    if (editingItem) {
      updateBrand(editingItem.id, values).then(() => {
        closeModal()
      }).catch(() => {
        // Помилка вже оброблена в хуку
      })
    } else {
      createBrand(values).then(() => {
        closeModal()
      }).catch(() => {
        // Помилка вже оброблена в хуку
      })
    }
  }

  const handlePaginationChange = (page, pageSize) => {
    fetchBrands(page, pageSize)
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>
        Бренди{user?.company_name ? ` | ${user.company_name}` : ''}
      </Title>

      <Card
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Додати бренд
          </Button>
        }
      >
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
        createTitle="Додати бренд"
        editTitle="Редагувати бренд"
        onCancel={closeModal}
      >
        <BrandFormFields
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

export default Brands
