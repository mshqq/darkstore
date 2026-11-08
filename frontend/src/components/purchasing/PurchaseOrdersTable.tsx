import { statusConfig } from '@/constants/purchaseOrder';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder';
import { Button, Popconfirm, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';

type PurchaseOrdersTableProps = {
  orders: PurchaseOrder[];
  supplierNames: Map<number, string>;
  loading: boolean;
  pendingOrderId: number | undefined;
  onAction: (order: PurchaseOrder) => void;
  onOpen: (id: number) => void;
};

const PurchaseOrdersTable = ({
  orders,
  supplierNames,
  loading,
  pendingOrderId,
  onAction,
  onOpen
}: PurchaseOrdersTableProps) => {
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      render: (id: number) => (
        <Link to={`/orders/${id}`}>
          <Typography.Text strong>#{id}</Typography.Text>
        </Link>
      )
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
          <div onClick={event => event.stopPropagation()}>
            <Popconfirm
              title={`${actionLabel}?`}
              description={`Закупка №${order.id}`}
              okText="Да"
              cancelText="Отмена"
              onConfirm={() => onAction(order)}
            >
              <Button
                size="small"
                loading={pendingOrderId === order.id}
              >
                {actionLabel}
              </Button>
            </Popconfirm>
          </div>
        );
      }
    }
  ];
  return (
    <Table<PurchaseOrder>
      rowKey="id"
      dataSource={orders}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
      locale={{ emptyText: 'Закупок пока нет' }}
      scroll={{ x: 'max-content' }}
      onRow={order => ({
        onClick: () => onOpen(order.id),
        style: { cursor: 'pointer' }
      })}
    />
  );
};

export default PurchaseOrdersTable;
