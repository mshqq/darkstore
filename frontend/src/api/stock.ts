import apiClient from '@/api/client';
import type { StockItem } from '@/types/stock';
import axios from 'axios';

export async function getStock(onlyLow: boolean) {
  try {
    const res = await apiClient.get<StockItem[]>('/stock', { params: { only_low: onlyLow } });

    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса: ', err.response?.status);
    }
  }
}
