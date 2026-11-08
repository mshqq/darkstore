import RequireAuth from '@/components/auth/RequireAuth';
import CRMLayout from '@/layout/CRMLayout';
import LoginPage from '@/pages/LoginPage';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const PurchaseOrderPage = lazy(() => import('@/pages/PurchaseOrderPage'));
const PurchaseOrdersPage = lazy(() => import('@/pages/PurchaseOrdersPage'));
const StockPage = lazy(() => import('@/pages/StockPage'));
const DirectoriesPage = lazy(() => import('@/pages/DirectoriesPage'));
const CustomerOrdersPage = lazy(() => import('@/pages/CustomerOrdersPage'));

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
            <Route
              element={<LoginPage />}
              path="/login"
            />
            <Route element={<RequireAuth />}>
              <Route element={<CRMLayout />}>
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
                  element={<PurchaseOrdersPage />}
                />
                <Route
                  path="/orders/:id"
                  element={<PurchaseOrderPage />}
                />
                <Route
                  path="/customer-orders"
                  element={<CustomerOrdersPage />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
