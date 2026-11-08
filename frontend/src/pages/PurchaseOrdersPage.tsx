import PurchaseOrderForm from '@/components/purchasing/CreatePurchaseOrderForm';
import PurchaseOrdersTable from '@/components/purchasing/PurchaseOrdersTable';
import { EMPTY_SUPPLIERS } from '@/constants/suppliers';
import { usePurchaseOrderActions } from '@/hooks/purchasing/usePurchaseOrderActions';
import { usePurchaseOrders } from '@/hooks/purchasing/usePurchaseOrders';
import { useSuppliers } from '@/hooks/suppliers/useSuppliers';
import type { PurchaseOrder } from '@/types/purchaseOrder';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Modal, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PurchaseOrdersPage() {
  const ordersQuery = usePurchaseOrders();
  const { sendMutation, receiveMutation } = usePurchaseOrderActions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: suppliers = EMPTY_SUPPLIERS } = useSuppliers();

  const navigate = useNavigate();

  const supplierNames = new Map(suppliers.map(supplier => [supplier.id, supplier.name]));

  const pendingOrderId = sendMutation.isPending
    ? sendMutation.variables
    : receiveMutation.isPending
      ? receiveMutation.variables
      : undefined;

  const handleAction = (order: PurchaseOrder) => {
    if (order.status === 'draft') {
      sendMutation.mutate(order.id);
    } else if (order.status === 'sent') {
      receiveMutation.mutate(order.id);
    }
  };

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
        <PurchaseOrdersTable
          orders={ordersQuery.data ?? []}
          supplierNames={supplierNames}
          loading={ordersQuery.isPending}
          pendingOrderId={pendingOrderId}
          onAction={handleAction}
          onOpen={(id: number) => navigate(`/orders/${id}`)}
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
