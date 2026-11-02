import apiClient from '@/api/client';
import type { Supplier, SupplierCreate, SupplierUpdate } from '@/types/supplier';
import axios from 'axios';

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

export async function updateSupplier(supplierId: number, data: SupplierUpdate): Promise<Supplier> {
  const response = await apiClient.patch<Supplier>(`/suppliers/${supplierId}`, data);
  return response.data;
}
