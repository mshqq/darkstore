import { Button, Modal, Table, Tag } from 'antd';
import { useState } from 'react';
import { useSuppliers } from '../../hooks/useSuppliers';
import type { Supplier } from '../../types/supplier';
import SupplierForm from './SupplierForm';

export default function SupplierTab() {
  const { data = [], isPending, isError } = useSuppliers();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isPending) {
    return <p>Загрузка поставщиков...</p>;
  }

  if (isError) {
    return <p>Не удалось загрузить поставщиков.</p>;
  }

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'ИНН', dataIndex: 'inn', key: 'inn' },
    { title: 'Контактное лицо', dataIndex: 'contact_person', key: 'contact_person' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null | undefined) => email ?? '—'
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'status',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Активен' : 'Неактивен'}</Tag>
      )
    }
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Добавить поставщика
      </Button>
      <Table<Supplier>
        rowKey="id"
        dataSource={data}
        columns={columns}
      />

      <Modal
        title="Добавить поставщика"
        open={isModalOpen}
        destroyOnHidden
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <SupplierForm
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
