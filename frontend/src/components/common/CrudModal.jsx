import { Modal } from 'antd'

function CrudModal({
  open,
  editingItem,
  createTitle,
  editTitle,
  onCancel,
  width = 600,
  children
}) {
  return (
    <Modal
      title={editingItem ? editTitle : createTitle}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={width}
    >
      {children}
    </Modal>
  )
}

export default CrudModal
