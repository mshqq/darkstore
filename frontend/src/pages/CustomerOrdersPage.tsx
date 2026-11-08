import CustomerOrderArchive from '@/components/customerOrders/CustomerOrderArchive';
import CustomerOrderColumn from '@/components/customerOrders/CustomerOrderColumn';
import CustomerOrderDrawer from '@/components/customerOrders/CustomerOrderDrawer';
import { useCustomerOrders } from '@/hooks/customerOrders/useCustomerOrders';
import type { CustomerOrderStatus } from '@/types/customerOrder';
import { Alert, Button, Segmented, Skeleton, Typography } from 'antd';
import { useState } from 'react';

const boardStatuses = [
  'new',
  'picking',
  'ready',
  'delivering'
] as const satisfies readonly CustomerOrderStatus[];

const CustomerOrdersPage = () => {
  const ordersQuery = useCustomerOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const [view, setView] = useState<'active' | 'archive'>('active');

  return (
    <>
      <Typography.Title level={3}>Заказы покупателей</Typography.Title>

      <Segmented
        options={[
          { label: 'Активные', value: 'active' },
          { label: 'Архив', value: 'archive' }
        ]}
        value={view}
        style={{ marginBottom: 5 }}
        onChange={(value: 'active' | 'archive') => setView(value)}
      />

      {ordersQuery.isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось загрузить заказы"
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
      {ordersQuery.isPending ? (
        <Skeleton active />
      ) : ordersQuery.data ? (
        view === 'active' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
              gap: 16,
              overflowX: 'auto'
            }}
          >
            {boardStatuses.map(status => (
              <CustomerOrderColumn
                key={status}
                status={status}
                orders={ordersQuery.data.filter(order => order.status === status)}
                onOpen={setSelectedOrderId}
              />
            ))}
          </div>
        ) : (
          <CustomerOrderArchive
            orders={ordersQuery.data.filter(
              order => order.status === 'delivered' || order.status === 'cancelled'
            )}
            onOpen={setSelectedOrderId}
          />
        )
      ) : null}

      <CustomerOrderDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  );
};

export default CustomerOrdersPage;
