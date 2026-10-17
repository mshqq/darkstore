import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { key: '/stock', label: 'Остатки' },
    { key: '/directories', label: 'Справочники' },
    { key: '/orders', label: 'Заказы' }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        style={{ overflow: 'auto', height: '100vh', backgroundColor: 'white' }}
      >
        <div
          style={{
            height: 64,
            backgroundColor: '#00152a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            color: 'white',
            fontWeight: 'bolder'
          }}
        >
          DarkStore
        </div>

        <Menu
          mode="inline"
          items={items}
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
