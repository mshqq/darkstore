import apiClient from '@/api/client';
import type { LoginRequest, TokenResponse, User } from '@/types/auth';
import axios from 'axios';

export async function login(data: LoginRequest): Promise<TokenResponse> {
  try {
    const res = await apiClient.post<TokenResponse>('/auth/login', data);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса: ', err.response?.status);
    }
    throw err;
  }
}

export async function getMe(): Promise<User> {
  try {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error('Ошибка запроса: ', err.response?.status);
    }
    throw err;
  }
}
