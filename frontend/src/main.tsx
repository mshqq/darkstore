import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import AppLayout from './layout/AppLayout.tsx';
import DirectoriesPage from './pages/DirectoriesPage.tsx';
import OrdersPage from './pages/OrdersPage.tsx';
import StockPage from './pages/StockPage.tsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={ruRU}>
      <App>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={<AppLayout />}
              >
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
                  path="stock"
                  element={<StockPage />}
                />
                <Route
                  path="directories"
                  element={<DirectoriesPage />}
                />
                <Route
                  path="orders"
                  element={<OrdersPage />}
                />

                <Route
                  path="*"
                  element={
                    <Navigate
                      to="/stock"
                      replace
                    />
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </App>
    </ConfigProvider>
  </StrictMode>
);
