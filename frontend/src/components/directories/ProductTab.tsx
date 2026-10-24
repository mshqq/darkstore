import { useProducts } from '@/hooks/useProducts';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Alert, Button, Flex, Input, message, Modal, Table, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';

import ProductForm from '@/components/directories/ProductForm';
import { EMPTY_PRODUCTS } from '@/constants/products';
import { EMPTY_SUPPLIERS } from '@/constants/suppliers';
import type { Product } from '@/types/product';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const numberFormatter = new Intl.NumberFormat('ru-RU');

export default function ProductTab() {
  const productsQuery = useProducts();
  const suppliersQuery = useSuppliers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const suppliers = suppliersQuery.data ?? EMPTY_SUPPLIERS;

  const supplierNames = useMemo(
    () => new Map<number, string>(suppliers.map(s => [s.id, s.name])),
    [suppliers]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter(
      p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
    );
  }, [products, search]);

  const columns: ColumnsType<Product> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'ru'),
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>
    },
    {
      title: 'Артикул',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku: string) => <Typography.Text type="secondary">{sku}</Typography.Text>
    },
    { title: 'Единица измерения', dataIndex: 'unit', key: 'unit', width: 100 },
    {
      title: 'Минимальный остаток',
      dataIndex: 'min_level',
      key: 'min_level',
      align: 'right',
      sorter: (a, b) => a.min_level - b.min_level,
      render: (value: number) => numberFormatter.format(value)
    },
    {
      title: 'Поставщик',
      dataIndex: 'default_supplier_id',
      key: 'default_supplier_id',
      render: (id: number | null) => {
        const name = id === null ? undefined : supplierNames.get(id);
        return name ?? <Typography.Text type="secondary">—</Typography.Text>;
      }
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Активен', value: true },
        { text: 'Неактивен', value: false }
      ],
      onFilter: (value, product) => product.is_active === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Активен' : 'Неактивен'}</Tag>
      )
    }
  ];

  const hasError = productsQuery.isError || suppliersQuery.isError;

  return (
    <Flex
      vertical
      gap={16}
    >
      <Flex
        justify="space-between"
        align="center"
        wrap
        gap={12}
      >
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Поиск по названию или артикулу"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />

        <Flex gap={8}>
          <Button
            icon={<ReloadOutlined />}
            loading={productsQuery.isFetching && !productsQuery.isPending}
            onClick={() => {
              productsQuery.refetch();
              suppliersQuery.refetch();
            }}
          >
            Обновить
          </Button>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => setIsModalOpen(true)}
          >
            Добавить товар
          </Button>
        </Flex>
      </Flex>

      {hasError && (
        <Alert
          type="error"
          showIcon
          title={
            productsQuery.isError
              ? 'Не удалось загрузить товары'
              : 'Не удалось загрузить поставщиков, в таблице они показаны как "—"'
          }
          action={
            <Button
              size="small"
              onClick={() => {
                productsQuery.refetch();
                suppliersQuery.refetch();
              }}
            >
              Повторить
            </Button>
          }
        />
      )}

      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
        loading={productsQuery.isPending || suppliersQuery.isPending}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
        locale={{ emptyText: search ? 'Ничего не найдено' : 'Товаров пока нет' }}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        title="Добавить товар"
        open={isModalOpen}
        destroyOnHidden
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <ProductForm
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            message.success('Товар создан');
          }}
        />
      </Modal>
    </Flex>
  );
}
