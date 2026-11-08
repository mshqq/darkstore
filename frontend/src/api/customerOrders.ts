import apiClient from '@/api/client';
import type { CustomerOrder } from '@/types/customerOrder';
import axios from 'axios';

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  try {
    const res = await apiClient.get<CustomerOrder[]>('/customer-orders');
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса заказов: ', err.response?.status);
    }
    throw err;
  }
}

export async function getCustomerOrder(id: number): Promise<CustomerOrder> {
  try {
    const res = await apiClient.get<CustomerOrder>(`/customer-orders/${id}`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса заказов: ', err.response?.status);
    }
    throw err;
  }
}

export async function startPicking(id: number): Promise<CustomerOrder> {
  try {
    const res = await apiClient.post<CustomerOrder>(`/customer-orders/${id}/start-picking`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса заказов: ', err.response?.status);
    }
    throw err;
  }
}

export async function finishPicking(id: number): Promise<CustomerOrder> {
  try {
    const res = await apiClient.post<CustomerOrder>(`/customer-orders/${id}/finish-picking`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса заказов: ', err.response?.status);
    }
    throw err;
  }
}

export async function startDelivery(id: number): Promise<CustomerOrder> {
  try {
    const res = await apiClient.post<CustomerOrder>(`/customer-orders/${id}/start-delivery`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса заказов: ', err.response?.status);
    }
    throw err;
  }
}

export async function finishDelivery(id: number): Promise<CustomerOrder> {
  try {
    const res = await apiClient.post<CustomerOrder>(`/customer-orders/${id}/finish-delivery`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса заказов: ', err.response?.status);
    }
    throw err;
  }
}

export async function cancelOrder(id: number): Promise<CustomerOrder> {
  try {
    const res = await apiClient.post<CustomerOrder>(`/customer-orders/${id}/cancel`);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса заказов: ', err.response?.status);
    }
    throw err;
  }
}
