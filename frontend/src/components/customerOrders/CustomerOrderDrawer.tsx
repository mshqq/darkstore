import CustomerOrderActions from '@/components/customerOrders/CustomerOrderActions';
import { customerOrderStatusConfig } from '@/constants/customerOrder';
import { useCustomerOrder } from '@/hooks/customerOrders/useCustomerOrder';
import type { CustomerOrderItem } from '@/types/customerOrder';
import { formatMoney } from '@/utils/money';
import { Alert, Descriptions, Drawer, Flex, Skeleton, Table, Tag, Typography } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';

type CustomerOrderDrawerProps = {
  orderId: number | null;
  onClose: () => void;
};

const CustomerOrderDrawer = ({ orderId, onClose }: CustomerOrderDrawerProps) => {
  const orderQuery = useCustomerOrder(orderId);
  const selectedOrder = orderQuery.data;

  return (
    <>
      <Drawer
        title={orderId === null ? 'Заказ' : `Заказ №${orderId}`}
        open={orderId !== null}
        onClose={onClose}
        size={400}
      >
        {orderId !== null &&
          (selectedOrder ? (
            <Flex
              vertical
              gap={24}
            >
              <Descriptions
                title="Данные покупателя"
                column={1}
                size="small"
              >
                <DescriptionsItem label="Покупатель">
                  {selectedOrder.customer_name}
                </DescriptionsItem>

                <DescriptionsItem label="Статус">
                  <Tag color={customerOrderStatusConfig[selectedOrder.status].color}>
                    {customerOrderStatusConfig[selectedOrder.status].label}
                  </Tag>
                </DescriptionsItem>

                <DescriptionsItem label="Телефон">
                  <a href={`tel:${selectedOrder.phone.replace(/[^\d+]/g, '')}`}>
                    {selectedOrder.phone}
                  </a>
                </DescriptionsItem>

                <DescriptionsItem label="Адрес доставки">{selectedOrder.address}</DescriptionsItem>

                {selectedOrder.comment?.trim() && (
                  <DescriptionsItem label="Комментарий">
                    <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {selectedOrder.comment}
                    </span>
                  </DescriptionsItem>
                )}
              </Descriptions>

              <Flex
                vertical
                gap={8}
              >
                <Typography.Text strong>
                  Состав заказа - {selectedOrder.items.length}
                </Typography.Text>

                <Table<CustomerOrderItem>
                  rowKey="id"
                  dataSource={selectedOrder.items}
                  size="small"
                  pagination={false}
                  locale={{ emptyText: 'В заказе нет позиций' }}
                  columns={[
                    {
                      title: 'Товар',
                      dataIndex: 'product_name'
                    },
                    {
                      title: 'Кол-во',
                      dataIndex: 'qty',
                      align: 'right'
                    },
                    {
                      title: 'Цена',
                      dataIndex: 'price',
                      align: 'right',
                      render: (price: CustomerOrderItem['price']) => (
                        <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(price)}</span>
                      )
                    }
                  ]}
                />

                <Typography.Title
                  level={4}
                  style={{ margin: 0 }}
                >
                  Итого: {formatMoney(selectedOrder.total)}
                </Typography.Title>
              </Flex>
              <CustomerOrderActions order={selectedOrder} />
            </Flex>
          ) : orderQuery.isPending ? (
            <Skeleton active />
          ) : (
            <Alert
              type="error"
              showIcon
              title="Не удалось загрузить заказ"
            />
          ))}
      </Drawer>
    </>
  );
};

export default CustomerOrderDrawer;
