import SupplierForm from '@/components/directories/SupplierForm';
import { EMPTY_SUPPLIERS } from '@/constants/suppliers';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { Supplier } from '@/types/supplier';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Input, Modal, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

const Empty = () => <Typography.Text type="secondary">—</Typography.Text>;

export default function SupplierTab() {
  const supplierQuery = useSuppliers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const suppliers = supplierQuery.data ?? EMPTY_SUPPLIERS;

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return suppliers;

    return suppliers.filter(s =>
      [s.name, s.inn, s.contact_person, s.phone, s.email].some(value =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [suppliers, search]);

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'ru'),
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>
    },
    {
      title: 'ИНН',
      dataIndex: 'inn',
      key: 'inn',
      render: (inn: string | null | undefined) =>
        inn ? <Typography.Text type="secondary">{inn}</Typography.Text> : <Empty />
    },
    {
      title: 'Контактное лицо',
      dataIndex: 'contact_person',
      key: 'contact_person',
      render: (person: string | null | undefined) => person || <Empty />
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null | undefined) =>
        phone ? <Typography.Link href={`tel:${phone}`}>{phone}</Typography.Link> : <Empty />
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null | undefined) =>
        email ? <Typography.Link href={`mailto:${email}`}>{email}</Typography.Link> : <Empty />
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
      onFilter: (value, supplier) => supplier.is_active === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Активен' : 'Неактивен'}</Tag>
      )
    }
  ];

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
          placeholder="Поиск по названию, ИНН, контактам"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />

        <Flex gap={8}>
          <Button
            icon={<ReloadOutlined />}
            loading={supplierQuery.isFetching && !supplierQuery.isPending}
            onClick={() => supplierQuery.refetch()}
          >
            Обновить
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Добавить поставщика
          </Button>
        </Flex>
      </Flex>

      {supplierQuery.isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось загрузить поставщиков"
          action={
            <Button
              size="small"
              onClick={() => supplierQuery.refetch()}
            >
              Повторить
            </Button>
          }
        />
      )}

      <Table<Supplier>
        rowKey="id"
        dataSource={filteredSuppliers}
        columns={columns}
        loading={supplierQuery.isPending}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
        locale={{ emptyText: search ? 'Ничего не найдено' : 'Поставщиков пока нет' }}
        scroll={{ x: 'max-content' }}
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
    </Flex>
  );
}
