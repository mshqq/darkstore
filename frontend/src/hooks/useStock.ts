import { useQuery } from '@tanstack/react-query';
import { getStock } from '../api/stock';

export function useStock(onlyLow: boolean) {
  return useQuery({ queryKey: ['stock', onlyLow], queryFn: () => getStock(onlyLow) });
}
