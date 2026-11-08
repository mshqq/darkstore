import { clearAccessToken } from '@/utils/authToken';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async function logout() {
    clearAccessToken();

    await queryClient.cancelQueries();
    queryClient.clear();

    navigate('/login', { replace: true });
  };
}
