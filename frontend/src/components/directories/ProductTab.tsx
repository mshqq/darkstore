import { Button, Modal, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useSuppliers } from '../../hooks/useSuppliers';

import { EMPTY_PRODUCTS } from '../../constants/products';
import { EMPTY_SUPPLIERS } from '../../constants/suppliers';
import type { Product } from '../../types/product';
import ProductForm from './ProductForm';

export default function ProductTab() {
  const { data: products = EMPTY_PRODUCTS, isPending, isError } = useProducts();
  const { data: suppliers = EMPTY_SUPPLIERS, isPending: isSupplierPending } = useSuppliers();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const supplierNames = useMemo(
    () => new Map<number, string>(suppliers.map(s => [s.id, s.name])),
    [suppliers]
  );

  if (isPending) {
    return <p>Загрузка товаров...</p>;
  }

  if (isSupplierPending) {
    return <p>Загрузка поставщиков...</p>;
  }
  if (isError) {
    return <p>Не удалось загрузить товары.</p>;
  }

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Артикул', dataIndex: 'sku', key: 'sku' },
    { title: 'Единица измерения', dataIndex: 'unit', key: 'unit' },
    { title: 'Минимальный остаток', dataIndex: 'min_level', key: 'min_level' },
    {
      title: 'Поставщик',
      dataIndex: 'default_supplier_id',
      key: 'default_supplier_id',
      render: (id: number) => (id === null ? '-' : (supplierNames.get(id) ?? '-'))
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
        Добавить товар
      </Button>
      <Table<Product>
        rowKey="id"
        dataSource={products}
        columns={columns}
      />
      <Modal
        title="Добавить поставщика"
        open={isModalOpen}
        destroyOnHidden
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <ProductForm
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
