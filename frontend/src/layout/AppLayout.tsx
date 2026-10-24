import {
  DatabaseOutlined,
  InboxOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShopOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { Button, Flex, Layout, Menu, Skeleton, theme, Typography } from 'antd';
import { Header } from 'antd/es/layout/layout';
import type { MenuProps } from 'antd/lib/menu';
import { Suspense, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;

const menuItems = [
  { key: '/stock', icon: <InboxOutlined />, label: 'Остатки' },
  { key: '/directories', icon: <DatabaseOutlined />, label: 'Справочники' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Закупки' }
] satisfies MenuProps['items'];

export default function AppLayout() {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const activeItem = menuItems.find(
    item => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`)
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        width={232}
        collapsible
        trigger={null}
        collapsed={collapsed}
        breakpoint="lg"
        onBreakpoint={setCollapsed}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          borderRight: `1px solid ${token.colorBorderSecondary}`
        }}
      >
        <Flex
          align="center"
          justify={collapsed ? 'center' : 'flex-start'}
          gap={10}
          style={{
            height: 64,
            padding: collapsed ? 0 : '0 24px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        >
          <ShopOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          {!collapsed && (
            <Typography.Text
              strong
              style={{ fontSize: 26, letterSpacing: 0.3 }}
            >
              DarkStore
            </Typography.Text>
          )}
        </Flex>

        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={activeItem ? [activeItem.key] : []}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 0, padding: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 24px',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`
          }}
        >
          <Button
            type="text"
            aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(prev => !prev)}
          >
            <Typography.Text
              strong
              style={{ fontSize: 16 }}
            >
              {activeItem?.label}
            </Typography.Text>
          </Button>
        </Header>

        <Content style={{ padding: 24 }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Suspense
              fallback={
                <Skeleton
                  active
                  paragraph={{ rows: 8 }}
                />
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
