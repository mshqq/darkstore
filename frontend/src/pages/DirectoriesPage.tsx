import ProductTab from '@/components/directories/ProductTab';
import SupplierTab from '@/components/directories/SupplierTab';
import { ShoppingOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Flex, Tabs, Typography, type TabsProps } from 'antd';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_TAB = 'suppliers';

export default function DirectoriesPage() {
  const items: TabsProps['items'] = [
    { key: 'suppliers', label: 'Поставщики', icon: <TeamOutlined />, children: <SupplierTab /> },
    { key: 'products', label: 'Товары', icon: <ShoppingOutlined />, children: <ProductTab /> }
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeKey = items?.some(item => item.key === tabParam) ? tabParam! : DEFAULT_TAB;

  return (
    <Flex
      vertical
      gap={16}
    >
      <div>
        <Typography.Title
          level={3}
          style={{ margin: 0 }}
        >
          Справочники
        </Typography.Title>
        <Typography.Text type="secondary">Поставщики и номенклатура</Typography.Text>
      </div>
      <Card styles={{ body: { paddingTop: 0 } }}>
        <Tabs
          activeKey={activeKey}
          items={items}
          onChange={key => setSearchParams({ tab: key }, { replace: true })}
        />
      </Card>
    </Flex>
  );
}
