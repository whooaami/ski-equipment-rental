import { Table } from 'antd'

const DEFAULT_PAGINATION = {
  defaultPageSize: 10,
  showTotal: (total) => `Всього: ${total}`,
  showSizeChanger: true,
  pageSizeOptions: [10, 25, 50, 100],
  position: ['bottomRight']
}

function DataTable({
  data,
  loading,
  columns,
  paginationConfig = DEFAULT_PAGINATION,
  pagination,
  onPaginationChange
}) {
  const handleTableChange = (paginationParams) => {
    if (onPaginationChange) {
      onPaginationChange(paginationParams.current, paginationParams.pageSize)
    }
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination?.current || 1,
        pageSize: pagination?.pageSize || paginationConfig.defaultPageSize,
        total: pagination?.total || 0,
        showTotal: paginationConfig.showTotal,
        showSizeChanger: paginationConfig.showSizeChanger,
        pageSizeOptions: paginationConfig.pageSizeOptions,
        position: paginationConfig.position
      }}
      onChange={handleTableChange}
    />
  )
}

export default DataTable
