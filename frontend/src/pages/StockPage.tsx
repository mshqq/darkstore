import StockFilters from '@/components/inventory/StockFilters';
import StockSummary from '@/components/inventory/StockSummary';
import StockTable from '@/components/inventory/StockTable';
import { useStock } from '@/hooks/inventory/useStock';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Typography } from 'antd';
import { useMemo, useState } from 'react';

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
      <StockSummary
        positions={stats.positions}
        low={stats.low}
        available={stats.available}
      />
      <StockFilters
        search={search}
        onlyLow={onlyLow}
        onSearchChange={setSearch}
        onOnlyLowChange={setOnlyLow}
      />
      <StockTable
        items={filteredStock}
        loading={stockQuery.isLoading}
        search={search}
      />
    </Flex>
  );
}
