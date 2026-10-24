import { useStock } from '@/hooks/useStock';
import type { StockItem } from '@/types/stock';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Input,
  Row,
  Segmented,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

const numberFormatter = new Intl.NumberFormat('ru-RU');

export default function StockPage() {
  const [onlyLow, setOnlyLow] = useState(false);
  const [search, setSearch] = useState('');
  const stockQuery = useStock(onlyLow);

  const stock = useMemo(() => stockQuery.data ?? [], [stockQuery.data]);

  const filteredStock = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return stock;

    return stock.filter(
      item => item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query)
    );
  }, [stock, search]);

  const stats = useMemo(
    () => ({
      positions: filteredStock.length,
      low: filteredStock.filter(item => item.is_low).length,
      available: filteredStock.reduce((sum, item) => sum + item.available, 0)
    }),
    [filteredStock]
  );

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
        <div>
          <Typography.Title
            level={3}
            style={{ margin: 0 }}
          >
            Остатки
          </Typography.Title>
          <Typography.Text type="secondary">Наличие товаров на складе и в резерве</Typography.Text>
        </div>

        <Button
          icon={<ReloadOutlined />}
          loading={stockQuery.isFetching && !stockQuery.isPending}
          onClick={() => stockQuery.refetch()}
        >
          Обновить
        </Button>
      </Flex>
      {stockQuery.isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось загрузить остатки"
          action={
            <Button
              size="small"
              onClick={() => stockQuery.refetch()}
            >
              Повторить
            </Button>
          }
        />
      )}
      <Row gutter={[16, 16]}>
        <Col
          xs={24}
          sm={8}
        >
          <Card size="small">
            <Statistic
              title="Позиций в списке"
              value={stats.positions}
            />
          </Card>
        </Col>
        <Col
          xs={24}
          sm={8}
        >
          <Card size="small">
            <Statistic
              title="Заканчиваются"
              value={stats.low}
              styles={{ content: stats.low > 0 ? { color: '#cf1322' } : undefined }}
            />
          </Card>
        </Col>
        <Col
          xs={24}
          sm={8}
        >
          <Card size="small">
            <Statistic
              title="Единиц доступно"
              value={stats.available}
              groupSeparator=" "
            />
          </Card>
        </Col>
      </Row>
      <Card styles={{ body: { padding: 16 } }}>
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
              placeholder="Поиск по названию или артикулу"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 360 }}
            />

            <Segmented
              value={onlyLow ? 'low' : 'all'}
              onChange={value => setOnlyLow(value === 'low')}
              options={[
                { value: 'all', label: 'Все остатки' },
                { value: 'low', label: 'Заканчивающиеся' }
              ]}
            />
          </Flex>
        </Flex>
      </Card>
      <Flex
        gap="medium"
        align="flex-start"
        justify="center"
        dir="columns"
        vertical={true}
        style={{ paddingBottom: 20 }}
      ></Flex>
      <Table<StockItem>
        rowKey={item => item.sku}
        columns={columns}
        dataSource={filteredStock}
        loading={stockQuery.isLoading}
        pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
        locale={{ emptyText: search ? 'Ничего не найдено' : 'Остатков нет' }}
        scroll={{ x: 'max-content' }}
      />
    </Flex>
  );
}
