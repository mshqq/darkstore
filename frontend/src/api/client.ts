import { clearAccessToken, getAccessToken } from '@/utils/authToken';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(config => {
  const token = getAccessToken();

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const token = getAccessToken();
      const sentAuthorization = error.config?.headers.get('Authorization');

      if (
        error.response?.status === 401 &&
        error.config?.url !== '/auth/login' &&
        (!token || sentAuthorization === `Bearer ${token}`)
      ) {
        clearAccessToken();
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
