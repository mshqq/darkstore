import CustomerOrderCard from '@/components/customerOrders/CustomerOrderCard';
import { customerOrderStatusConfig } from '@/constants/customerOrder';
import type { CustomerOrder, CustomerOrderStatus } from '@/types/customerOrder';
import { Card, Flex } from 'antd';

type CustomerOrderColumnProps = {
  status: CustomerOrderStatus;
  orders: CustomerOrder[];
  onOpen: (id: number) => void;
};

const CustomerOrderColumn = ({ status, orders, onOpen }: CustomerOrderColumnProps) => {
  const config = customerOrderStatusConfig[status];

  return (
    <Card title={`${config.label} (${orders.length})`}>
      <Flex
        vertical
        gap={12}
      >
        {orders.length > 0 ? (
          orders.map(order => (
            <CustomerOrderCard
              key={order.id}
              order={order}
              onOpen={onOpen}
            />
          ))
        ) : (
          <p>Нет заказов</p>
        )}
      </Flex>
    </Card>
  );
};

export default CustomerOrderColumn;
