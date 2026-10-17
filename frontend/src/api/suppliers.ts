import axios from 'axios';
import type { Supplier, SupplierCreate } from '../types/supplier';
import apiClient from './client';

export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const res = await apiClient.get<Supplier[]>('/suppliers');
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса поставщиков: ', err.response?.status);
    }
    throw err;
  }
}

export async function createSupplier(data: SupplierCreate): Promise<Supplier> {
  const response = await apiClient.post<Supplier>('/suppliers', data);
  return response.data;
}
