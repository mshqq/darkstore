import { Tabs, type TabsProps } from 'antd';
import ProductTab from '../components/directories/ProductTab';
import SupplierTab from '../components/directories/SupplierTab';

export default function DirectoriesPage() {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    { key: 'Suppliers', label: 'Поставщики', children: <SupplierTab /> },
    { key: 'Products', label: 'Товары', children: <ProductTab /> }
  ];

  return (
    <Tabs
      defaultActiveKey="1"
      items={items}
      onChange={onChange}
    />
  );
}
