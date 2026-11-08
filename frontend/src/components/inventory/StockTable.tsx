import type { StockItem } from '@/types/stock';
import { numberFormatter } from '@/utils/number';
import { Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type StockTableProps = { items: StockItem[]; loading: boolean; search: string };

const StockTable = ({ items, loading, search }: StockTableProps) => {
  const columns: ColumnsType<StockItem> = [
    {
      title: 'Товар',
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
    {
      title: 'На складе',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (value: number) => numberFormatter.format(value)
    },
    {
      title: 'Резерв',
      dataIndex: 'reserved',
      key: 'reserved',
      align: 'right',
      sorter: (a, b) => a.reserved - b.reserved,
      render: (value: number) =>
        value > 0 ? (
          numberFormatter.format(value)
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        )
    },
    {
      title: 'Доступно',
      dataIndex: 'available',
      key: 'available',
      align: 'right',
      sorter: (a, b) => a.available - b.available,
      render: (value: number, item) => (
        <Typography.Text
          strong
          type={item.is_low ? 'danger' : undefined}
        >
          {numberFormatter.format(value)}
        </Typography.Text>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'is_low',
      key: 'status',
      width: 110,
      filters: [
        { text: 'Мало', value: true },
        { text: 'Ок', value: false }
      ],
      onFilter: (value, item) => item.is_low === value,
      render: (isLow: boolean) => <Tag color={isLow ? 'red' : 'green'}>{isLow ? 'Мало' : 'Ок'}</Tag>
    }
  ];

  return (
    <Table<StockItem>
      rowKey={item => item.sku}
      columns={columns}
      dataSource={items}
      loading={loading}
      pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
      locale={{ emptyText: search ? 'Ничего не найдено' : 'Остатков нет' }}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default StockTable;
