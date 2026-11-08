import { customerOrderStatusConfig } from '@/constants/customerOrder';
import type { CustomerOrder, CustomerOrderStatus } from '@/types/customerOrder';
import { orderDateFormatter } from '@/utils/date';
import { formatMoney } from '@/utils/money';
import { Table, Tag } from 'antd';

type CustomerOrderArchiveProps = {
  orders: CustomerOrder[];
  onOpen: (id: number) => void;
};

const CustomerOrderArchive = ({ orders, onOpen }: CustomerOrderArchiveProps) => {
  return (
    <Table<CustomerOrder>
      rowKey="id"
      onRow={order => ({ onClick: () => onOpen(order.id), style: { cursor: 'pointer' } })}
      dataSource={orders}
      columns={[
        { title: '№', dataIndex: 'id' },
        { title: 'Клиент', dataIndex: 'customer_name' },
        {
          title: 'Статус',
          dataIndex: 'status',
          render: (status: CustomerOrderStatus) => {
            const config = customerOrderStatusConfig[status];
            return <Tag color={config.color}>{config.label}</Tag>;
          }
        },
        {
          title: 'Сумма',
          dataIndex: 'total',
          align: 'right',
          render: (total: string) => formatMoney(total)
        },
        {
          title: 'Дата',
          dataIndex: 'created_at',
          render: (value: string) => orderDateFormatter.format(new Date(value))
        }
      ]}
    />
  );
};

export default CustomerOrderArchive;
