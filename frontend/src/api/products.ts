import axios from 'axios';
import type { Product, ProductCreate } from '../types/product';
import apiClient from './client';

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await apiClient.get<Product[]>('/products');
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса: ', err.response?.status);
    }
    throw err;
  }
}

export async function createProduct(data: ProductCreate): Promise<Product> {
  const response = await apiClient.post<Product>('/products', data);
  return response.data;
}
