import PurchaseOrderForm from '@/components/CreatePurchaseOrderForm';
import { statusConfig } from '@/constants/purchaseOrder';
import { EMPTY_SUPPLIERS } from '@/constants/suppliers';
import { usePurchaseOrderActions } from '@/hooks/usePurchaseOrderActions';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Flex,
  message,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

export default function OrdersPage() {
  const ordersQuery = usePurchaseOrders();
  const { sendMutation, receiveMutation } = usePurchaseOrderActions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: suppliers = EMPTY_SUPPLIERS } = useSuppliers();

  const supplierNames = new Map(suppliers.map(supplier => [supplier.id, supplier.name]));

  const pendingOrderId = sendMutation.isPending
    ? sendMutation.variables
    : receiveMutation.isPending
      ? receiveMutation.variables
      : undefined;

  const handleAction = (order: PurchaseOrder) => {
    const options = {
      onSuccess: () => message.success(`Закупка №${order.id} обновлена`),
      onError: () => message.error(`Не удалось обновить закупку №${order.id}`)
    };

    if (order.status === 'draft') {
      sendMutation.mutate(order.id, options);
    } else if (order.status === 'sent') {
      receiveMutation.mutate(order.id, options);
    }
  };

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      render: (id: number) => <Typography.Text strong>#{id}</Typography.Text>
    },
    {
      title: 'Поставщик',
      dataIndex: 'supplier_id',
      key: 'supplier_id',
      render: (supplierId: number) =>
        supplierNames.get(supplierId) ?? (
          <Typography.Text type="secondary">Поставщик #{supplierId}</Typography.Text>
        )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: PurchaseOrderStatus) => {
        const config = statusConfig[status];
        return <Tag color={config?.color}>{config?.label ?? status}</Tag>;
      }
    },
    {
      title: 'Создан',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 190,
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => (
        <Typography.Text type="secondary">
          {new Date(date).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
        </Typography.Text>
      )
    },
    {
      title: '',
      key: 'actions',
      width: 160,
      align: 'right',
      render: (_: unknown, order: PurchaseOrder) => {
        const actionLabel = statusConfig[order.status]?.actionLabel;
        if (!actionLabel) return null;
        return (
          <Popconfirm
            title={`${actionLabel}?`}
            description={`Закупка №${order.id}`}
            okText="Да"
            cancelText="Отмена"
            onConfirm={() => handleAction(order)}
          >
            <Button
              size="small"
              loading={pendingOrderId === order.id}
            >
              {actionLabel}
            </Button>
          </Popconfirm>
        );
      }
    }
  ];

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        wrap
        gap={18}
      >
        <div>
          <Typography.Title
            level={3}
            style={{ margin: 0 }}
          >
            Закупки
          </Typography.Title>
          <Typography.Text type="secondary">Заказы поставщикам и их статусы</Typography.Text>
        </div>

        <Flex gap={8}>
          <Button
            icon={<ReloadOutlined />}
            loading={ordersQuery.isFetching && !ordersQuery.isPending}
            onClick={() => ordersQuery.refetch()}
          >
            Обновить
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Добавить закупку
          </Button>
        </Flex>
      </Flex>

      {ordersQuery.isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось загрузить закупки"
          action={
            <Button
              size="small"
              onClick={() => ordersQuery.refetch()}
            >
              Повторить
            </Button>
          }
        />
      )}

      <Card
        style={{ marginTop: 5 }}
        styles={{ body: { padding: 16 } }}
      >
        <Table<PurchaseOrder>
          rowKey="id"
          dataSource={ordersQuery.data}
          columns={columns}
          loading={ordersQuery.isPending}
          pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
          locale={{ emptyText: 'Закупок пока нет' }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Modal
        title="Добавить закупку"
        open={isModalOpen}
        destroyOnHidden
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <PurchaseOrderForm
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
