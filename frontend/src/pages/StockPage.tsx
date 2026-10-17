import { Flex, Input, Switch, Table, Tag } from 'antd';
import { useState } from 'react';
import { useStock } from '../hooks/useStock';

export default function StockPage() {
  const [onlyLow, setOnlyLow] = useState(false);
  const [search, setSearch] = useState('');
  const { data = [], isPending, isError } = useStock(onlyLow);

  console.log(data);

  if (isPending) {
    return <p>Загрузка поставщиков...</p>;
  }

  if (isError) {
    return <p>Не удалось загрузить поставщиков.</p>;
  }

  const filteredStock = (data ?? []).filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Товар', dataIndex: 'name', key: 'name' },
    { title: 'Артикул', dataIndex: 'sku', key: 'sku' },
    { title: 'На складе', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Резерв', dataIndex: 'reserved', key: 'reserved' },
    { title: 'Доступно', dataIndex: 'available', key: 'available' },
    {
      title: 'Статус',
      dataIndex: 'is_low',
      key: 'status',
      render: (isLow: boolean) => <Tag color={isLow ? 'red' : 'green'}>{isLow ? 'Мало' : 'Ок'}</Tag>
    }
  ];

  return (
    <>
      <Flex
        gap="medium"
        align="flex-start"
        justify="center"
        dir="columns"
        vertical={true}
        style={{ paddingBottom: 20 }}
      >
        <Input
          placeholder="Поиск"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Switch
          defaultChecked
          checked={!onlyLow}
          onChange={() => setOnlyLow(prev => !prev)}
          checkedChildren={
            <Flex
              gap={4}
              justify="flex-start"
              align="center"
            >
              Все остатки
            </Flex>
          }
          unCheckedChildren={
            <Flex
              gap={4}
              justify="flex-start"
              align="center"
            >
              Заканчивающиеся
            </Flex>
          }
        />
      </Flex>
      <Table
        dataSource={filteredStock}
        columns={columns}
      />
    </>
  );
}
