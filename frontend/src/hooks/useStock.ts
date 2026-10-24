import { getStock } from '@/api/stock';
import { useQuery } from '@tanstack/react-query';

export function useStock(onlyLow: boolean) {
  return useQuery({ queryKey: ['stock', onlyLow], queryFn: () => getStock(onlyLow) });
}
