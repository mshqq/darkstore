import AppLayout from '@/layout/AppLayout';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const StockPage = lazy(() => import('@/pages/StockPage'));
const DirectoriesPage = lazy(() => import('@/pages/DirectoriesPage'));
const OrdersPage = lazy(() => import('@/pages/OrdersPage'));

export default function App() {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          colorPrimary: '#E5739B',
          colorLink: '#D45B87',
          colorBgLayout: '#FFF7F9',
          borderRadius: 10
        }
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route
                index
                element={
                  <Navigate
                    to="/stock"
                    replace
                  />
                }
              />
              <Route
                path="/stock"
                element={<StockPage />}
              />
              <Route
                path="/directories"
                element={<DirectoriesPage />}
              />
              <Route
                path="/orders"
                element={<OrdersPage />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
