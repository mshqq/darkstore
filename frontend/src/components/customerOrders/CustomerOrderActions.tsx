import { useCustomerOrderActions } from '@/hooks/customerOrders/useCustomerOrderActions';
import type { CustomerOrder } from '@/types/customerOrder';
import { Button, Flex, Popconfirm } from 'antd';

type CustomerOrderActionsProps = {
  order: CustomerOrder;
};

const CustomerOrderActions = ({ order }: CustomerOrderActionsProps) => {
  const {
    startPickingMutation,
    finishPickingMutation,
    startDeliveryMutation,
    finishDeliveryMutation,
    cancelOrderMutation
  } = useCustomerOrderActions();

  const isPending =
    startPickingMutation.isPending ||
    finishPickingMutation.isPending ||
    startDeliveryMutation.isPending ||
    finishDeliveryMutation.isPending ||
    cancelOrderMutation.isPending;

  return (
    <>
      <Flex
        vertical
        gap={8}
      >
        {order.status === 'new' && (
          <Button
            disabled={isPending}
            type="primary"
            loading={startPickingMutation.isPending}
            onClick={() => startPickingMutation.mutate(order.id)}
          >
            Начать сборку
          </Button>
        )}
        {order.status === 'picking' && (
          <Button
            disabled={isPending}
            type="primary"
            loading={finishPickingMutation.isPending}
            onClick={() => finishPickingMutation.mutate(order.id)}
          >
            Завершить сборку
          </Button>
        )}
        {order.status === 'ready' && (
          <Button
            disabled={isPending}
            type="primary"
            loading={startDeliveryMutation.isPending}
            onClick={() => startDeliveryMutation.mutate(order.id)}
          >
            Передать курьеру
          </Button>
        )}
        {order.status === 'delivering' && (
          <Button
            disabled={isPending}
            type="primary"
            loading={finishDeliveryMutation.isPending}
            onClick={() => finishDeliveryMutation.mutate(order.id)}
          >
            Завершить доставку
          </Button>
        )}
        {(order.status === 'new' || order.status === 'ready' || order.status === 'picking') && (
          <Popconfirm
            title="Отменить заказ?"
            description="Резерв товаров будет освобождён"
            okText="Отменить заказ"
            cancelText="Назад"
            onConfirm={() => cancelOrderMutation.mutateAsync(order.id)}
            okButtonProps={{ loading: cancelOrderMutation.isPending, disabled: isPending }}
          >
            <Button
              disabled={isPending}
              danger
              loading={cancelOrderMutation.isPending}
            >
              Отменить заказ
            </Button>
          </Popconfirm>
        )}
      </Flex>
    </>
  );
};

export default CustomerOrderActions;
