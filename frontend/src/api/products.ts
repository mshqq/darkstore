import apiClient from '@/api/client';
import type { Product, ProductCreate, ProductUpdate } from '@/types/product';
import axios from 'axios';

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

export async function updateProduct(productId: number, data: ProductUpdate): Promise<Product> {
  const response = await apiClient.patch<Product>(`/products/${productId}`, data);
  return response.data;
}

export async function uploadProductImage(productId: number, file: File): Promise<Product> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<Product>(`/products/${productId}/image`, formData, {
    headers: { 'Content-Type': undefined }
  });
  return response.data;
}
