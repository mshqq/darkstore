import { login } from '@/api/auth';
import { getApiErrorMessage } from '@/utils/apiError';
import { setAccessToken } from '@/utils/authToken';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: login,
    onSuccess: async data => {
      await queryClient.cancelQueries();
      queryClient.clear();

      setAccessToken(data.access_token);
      navigate('/customer-orders', { replace: true });
    },
    onError: error => message.error(getApiErrorMessage(error, 'Не удалось войти'))
  });
}
