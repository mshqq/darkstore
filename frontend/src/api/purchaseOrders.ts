import apiClient from '@/api/client';
import type { PurchaseOrder, PurchaseOrderCreate } from '@/types/purchaseOrder';
import axios from 'axios';

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const res = await apiClient.get<PurchaseOrder[]>('/purchase-orders');
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса закупок: ', err.response?.status);
    }
    throw err;
  }
}

export async function sendPurchaseOrder(order_id: number): Promise<PurchaseOrder> {
  const res = await apiClient.post<PurchaseOrder>(`/purchase-orders/${order_id}/send`);
  return res.data;
}

export async function receivePurchaseOrder(order_id: number): Promise<PurchaseOrder> {
  const res = await apiClient.post<PurchaseOrder>(`/purchase-orders/${order_id}/receive`);
  return res.data;
}

export async function createPurchaseOrder(data: PurchaseOrderCreate): Promise<PurchaseOrder> {
  const res = await apiClient.post<PurchaseOrder>('/purchase-orders', data);
  return res.data;
}
