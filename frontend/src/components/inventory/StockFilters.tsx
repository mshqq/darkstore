import { SearchOutlined } from '@ant-design/icons';
import { Card, Flex, Input, Segmented } from 'antd';

type StockFiltersProps = {
  search: string;
  onlyLow: boolean;
  onSearchChange: (value: string) => void;
  onOnlyLowChange: (value: boolean) => void;
};

const StockFilters = ({ search, onlyLow, onSearchChange, onOnlyLowChange }: StockFiltersProps) => {
  return (
    <Card styles={{ body: { padding: 16 } }}>
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
          onChange={event => onSearchChange(event.target.value)}
          style={{ maxWidth: 360 }}
        />

        <Segmented
          value={onlyLow ? 'low' : 'all'}
          onChange={value => onOnlyLowChange(value === 'low')}
          options={[
            { value: 'all', label: 'Все остатки' },
            { value: 'low', label: 'Заканчивающиеся' }
          ]}
        />
      </Flex>
    </Card>
  );
};

export default StockFilters;
