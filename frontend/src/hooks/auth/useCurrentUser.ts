import { getMe } from '@/api/auth';
import { getAccessToken } from '@/utils/authToken';
import { useQuery } from '@tanstack/react-query';

export function useCurrentUser() {
  const token = getAccessToken();

  return useQuery({
    queryKey: ['current-user'],
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false
  });
}
